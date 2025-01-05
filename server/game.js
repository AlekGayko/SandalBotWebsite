import { spawn } from "node:child_process";
import { Chess } from "chess.js";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { FenParser } from "@chess-fu/fen-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env" )});

const exePath = process.env.ENGINE;
const TIMEOUT_DURATION = 600000; // 10 minutes

const EngineState = {
    IDLE: 0,
    GENERATING_MOVE: 1,
    ANALYSING: 2
};

class Engine {
    constructor(wss) {
        this.childProcess = null;
        this.prevInfo = {};
        this.prevBestMove = "";
        this.moveList = "";
        this.currInfo = {};
        this.state = EngineState.IDLE;
        this.gameClient = new Chess();
        this.wss = wss;

        this.startProcess();
    }

    sendMessage(jsonMsg) {
        const msg = JSON.stringify(jsonMsg);
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }

    // Start chess engine process
    startProcess() {
        this.childProcess = spawn(exePath);
        this.childProcess.stdin.write('setoption name Hash value 64\r\n');
        this.childProcess.stdout.on('data', (data) => {
            let res = data.toString();
            res = res.trim().split(" ");
            if (res.length === 0) {
                return;
            } else if (res[0] === "info") {
                const info = this.processInfo(res);
                this.currInfo = info;
                if (this.state === EngineState.ANALYSING) {
                    const msg = { type: "analysis", info: this.currInfo }
                    this.sendMessage(msg);
                }
            } else if (res[0] === "bestmove") {
                this.prevInfo = this.currInfo;
                this.currInfo = {};
                this.prevBestMove = res[1];
                this.moveList += this.prevBestMove + " ";

                if (this.prevBestMove === "O-O" || this.prevBestMove === "O-O-O") {
                    this.gameClient.move(this.prevBestMove);
                } else {
                    this.gameClient.move({
                        from: this.prevBestMove.slice(0, 2),
                        to: this.prevBestMove.slice(2, 4),
                        promotion: this.prevBestMove.length === 5 ? this.prevBestMove[4] : "q"
                    });
                }

                if (this.state === EngineState.GENERATING_MOVE) {
                    this.state = EngineState.IDLE;
                    const msg = { type: "move", move: this.prevBestMove };
                    this.sendMessage(msg);
                }
            }
        });

        this.childProcess.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
            this.childProcess = null;
        });

        this.childProcess.on('error', (error) => {
            console.log('Child process has encountered an error');
            console.log(error.toString());
        })
    }

    // Kill the chess engine process
    killProcess() {
        if (this.childProcess) {
            this.childProcess.kill('SIGTERM');
        }
    }

    processInfo(info) {
        let infoObj = {};
        // Remove 'info' tag at start
        info.shift()
        let pvSeen = false;
        info.forEach((element, index) => {
            switch (element) {
                case "score":
                    if (info[index + 1] === "cp") {
                        if (this.gameClient.turn() === "w") {
                            infoObj[element] = info[index + 2];
                        } else {
                            infoObj[element] = String(parseInt(info[index + 2]) * -1);
                        }
                    } else if (info[index + 1] === "mate") {
                        infoObj[element] = info[index + 1] + info[index + 2];
                    }
                    break;
                case "pv":
                    infoObj[element] = "";
                    if (index === info.length - 1) {
                        break;
                    }
                    let pvMoves = ""
                    for (let i = index + 1; i < info.length; i++) {
                        pvMoves += info[i];
                        if (i !== info.length - 1) {
                            pvMoves += " ";
                        }
                    }
                    infoObj[element] = pvMoves;
                    pvSeen = true;
                    break;
                default:
                    const num = parseFloat(element);
                    if (!Number.isNaN(num)) {
                        break;
                    }
                    if (pvSeen) {
                        break;
                    }
                    if (element === "cp" || element === "mate") {
                        break;
                    }

                    infoObj[element] = info[index + 1];

                    break;
            }
        });

        return infoObj;
    }

    // Receive move and make move on game client and the chess engine
    inputMove(moveObj) {
        if (this.state !== EngineState.IDLE) {
            return null;
        }
        this.resetInfo();

        const move = this.gameClient.move({
            from: moveObj.from,
            to: moveObj.to,
            promotion: moveObj.promotion
        }); 

        this.moveList += moveObj.from + moveObj.to + moveObj.promotion + " ";
    }

    async generateMove(times) {
        this.stopAnalysis();
        if (this.state !== EngineState.IDLE) {
            this.resetProcess();
        }

        this.state = EngineState.GENERATING_MOVE;

        const positionCommand = `position startpos moves ${this.moveList}\r\n`;
        this.childProcess.stdin.write(positionCommand);

        let moveCommand = `go wtime ${times.wtime} btime ${times.btime} winc ${times.winc} binc ${times.binc}\r\n`;

        this.childProcess.stdin.write(moveCommand);
    }

    stopAnalysis() {
        if (this.state !== EngineState.ANALYSING) {
            return;
        }
        this.childProcess.stdin.write("stop\r\n");
        this.state = EngineState.IDLE;
    }

    resetInfo() {
        this.currInfo = {};
        this.prevInfo = {};
        this.prevBestMove = "";
    }

    resetProcess() {
        console.log("Resetting Process.");
        this.childProcess.kill();
        this.childProcess = spawn(exePath);
    }

    startAnalysis(fen) {
        this.stopAnalysis();
        if (this.state !== EngineState.IDLE) {
            this.resetProcess();
        }
        this.state = EngineState.ANALYSING;
        this.childProcess.stdin.write(`position fen ${fen}\r\n`);
        this.childProcess.stdin.write(`go\r\n`);
    }
}

// Game class abstracts the chess engine process and state
class Game {
    constructor(port) {
        this.port = port;
        this.gameServer = http.createServer();
        this.wss = new WebSocketServer({ server: this.gameServer });
        this.defineWssHandlers();
        this.gameServer.listen(this.port);
        this.engine = new Engine(this.wss);
        this.inactive = false;
    }

    delete() {
        this.wss.close();
        this.engine.killProcess();
    }

    defineWssHandlers() {
        this.wss.on('connection', (ws) => {
            console.log("Socket Opened");
            let timeoutId;

            const resetTimer = () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    ws.close();
                    this.engine.killProcess();
                    this.inactive = true;
                }, TIMEOUT_DURATION);
            };

            resetTimer();

            const okMsg = JSON.stringify({ type: "OK" });

            ws.on('message', (message) => {
                this.inactive = false;
                try {
                    resetTimer();
                    const jsonMsg = JSON.parse(message);
                    switch (jsonMsg.type) {
                        case "ping":
                            const msg = { type: "ping", state: this.engine.state };
                            ws.send(msg);
                            break;
                        case "move":
                            this.engine.inputMove(jsonMsg.move);
                            ws.send(okMsg);
                            break;
                        case "makeMove":
                            this.engine.generateMove(jsonMsg.times);
                            ws.send(okMsg);
                            break;
                        case "analysis":
                            const fen = new FenParser(jsonMsg.fen);
                            if (!fen.isValid) {
                                return;
                            }
                            this.engine.startAnalysis(jsonMsg.fen);
                            ws.send(okMsg);
                            break;
                        case "quit":
                            ws.close();
                            break;
                    }
                } catch (error) {
                    console.error(error);
                }
            });

            ws.on('close', () => {
                clearTimeout(timeoutId);
                this.engine.killProcess();
            });
    
            ws.on('error', (error) => {
                clearTimeout(timeoutId);
                this.engine.killProcess();
            });
        });        
    }
}

export default Game;