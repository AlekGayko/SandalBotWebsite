import { spawn } from 'node:child_process';
import { Chess } from "chess.js";

// Game class abstracts the chess engine process and state
class Game {
    constructor(id) {
        this.id = id;
        this.exePath = process.env.ENGINE;
        this.childProcess = null;
        this.prevInfo = {};
        this.prevBestMove = "";
        this.currInfo = {};
        this.generatingMove = false;
        this.isAnalysing = false;
        this.gameClient = new Chess();

        this.startProcess();
    }

    // Start chess engine process
    startProcess() {
        this.childProcess = spawn(this.exePath);

        this.childProcess.stdout.on('data', (data) => {
            let res = data.toString();
            console.log(res);
            res = res.trim().split(" ");
            if (res.length === 0) {
                return;
            } else if (res[0] === "info") {
                const info = this.processInfo(res);
                this.currInfo = info;
            } else if (res[0] === "bestmove") {
                this.prevInfo = this.currInfo;
                this.currInfo = {};
                this.prevBestMove = res[1];
                this.generatingMove = false;
            }
        });

        this.childProcess.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
            this.childProcess = null;

            if (code !== 0) {
                console.log('Process terminated unexpectedly. Restarting...');
            }
        });

        this.childProcess.on('error', (error) => {
            console.log('Child process has encountered an error');
            console.log(error.toString());
        })
    }

    // Kill the chess engine process
    killProcess() {
        if (this.isAnalysing === true) {
            this.childProcess.stdin.write('stop\r\n');
        }
        this.childProcess.stdin.write('quit\n');
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
    inputMove(fenStr, moveObj) {
        if (this.generatingMove === true || this.isAnalysing === true) {
            return null;
        }

        this.gameClient = new Chess(fenStr);
        const move = this.gameClient.move({
            from: moveObj.from,
            to: moveObj.to,
            promotion: moveObj.promotion
        });

        const positionCommand = `position fen ${fenStr} moves ${move.lan}\r\n`;
        this.childProcess.stdin.write(positionCommand);
    }

    generateMove(fen, moveTime=100) {
        if (this.generatingMove === true) {
            return null;
        }
        if (this.isAnalysing) {
            this.childProcess.stdin.write("stop\r\n");
        }
        if (!moveTime) {
            moveTime = 100;
        }

        this.generatingMove = true;

        const positionCommand = `position fen ${fen}\r\n`;
        this.childProcess.stdin.write(positionCommand);

        let moveCommand = `go movetime ${moveTime}\r\n`;
        this.childProcess.stdin.write(moveCommand);
    }

    // Get move made by engine`
    getMove() {
        if (this.generatingMove === true || this.isAnalysing === true) {
            return null;
        }

        if (this.prevBestMove === "") {
            return null;
        }

        return this.prevBestMove;
    }

    startAnalysis() {
        if (this.isAnalysing) {
            this.childProcess.stdin.write("stop\r\n");
        }
        this.isAnalysing = true;
        this.childProcess.stdin.write(`go\r\n`);
    }

    getAnalysis(fen) {
        if (fen !== this.gameClient.fen() && fen !== null) {
            this.childProcess.stdin.write("stop\r\n");
            this.childProcess.stdin.write(`position fen ${fen}\r\n`);
            this.gameClient = new Chess(fen);
            this.startAnalysis();
            return null;
        }
        return this.currInfo;
    }
}

export default Game;