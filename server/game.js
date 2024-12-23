import { spawn } from 'node:child_process';
import chess from 'chess';

class Move {
    constructor(gameClient, move, isAlgebraic) {
        this.algebraic = null;
        this.bot = null;

        if (isAlgebraic) {
            this.algebraic = move.move.algebraic;
            this.bot = this.algebraicToBot(move);
        } else {
            this.bot = move;
            this.algebraic = this.botToAlgebraic(gameClient, move);
        }
    }

    algebraicToBot(move) {
        let moveStr = '';
        moveStr += move.move.prevSquare.file + move.move.prevSquare.rank;
        moveStr += move.move.postSquare.file + move.move.postSquare.rank;
        console.log(move);
        const promotionType = move.move.algebraic[move.move.algebraic.length - 1];
        if (promotionType.toUpperCase() === promotionType && promotionType !== 'O') {
            moveStr += promotionType.toLowerCase();
        }
        return moveStr;
    }

    botToAlgebraic(gameClient, move) {
        const srcFile = move[0];
        const srcRank = parseInt(move[1]);
        const destFile = move[2];
        const destRank = parseInt(move[3]);
        let promotionType = null;
        if (move.length === 5) {
            promotionType = move[4].toUpperCase();
        }

        const moves = gameClient.notatedMoves;

        let moveStr = null;
        for (let key in moves) {
            if (moves[key].src.file === srcFile && moves[key].src.rank === srcRank
                && moves[key].dest.file === destFile && moves[key].dest.rank === destRank) {
                moveStr = key.toString();
                if (promotionType && move[move.length - 1] === promotionType) {
                    return moveStr;
                } else if (!promotionType) {
                    return moveStr;
                }
            }
        }

        return null;
    }
}

// Game class abstracts the chess engine process and state
class Game {
    constructor(id, goFirst) {
        this.id = id;
        this.exePath = process.env.ENGINE;
        this.childProcess = null;
        this.outputs = [];
        this.moves = [];
        this.moveStrList = '';
        this.gameClient = chess.create();
        this.isBotMove = goFirst;
        this.startProcess();

        if (goFirst) {
            this.generateMove();
        }
    }

    // Start chess engine process
    startProcess() {
        this.childProcess = spawn(this.exePath);

        this.childProcess.stdout.on('data', (data) => {
            this.outputs.push(data.toString());
            console.log(data.toString());
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
        this.childProcess.stdin.write('quit\n');

        //this.childProcess.kill();
    }

    // Receive move and make move on game client and the chess engine
    inputMove(moveInput) {
        if (this.isBotMove === true) {
            return;
        }

        this.isBotMove = true;

        const algebraicMove = this.gameClient.move(moveInput);

        const move = new Move(this.gameClient, algebraicMove, true);

        this.moveStrList += `${move.bot} `;

        const positionCommand = `position startpos moves ${this.moveStrList}\r\n`;
        this.childProcess.stdin.write(positionCommand);
    }

    generateMove() {
        if (this.isBotMove === false) {
            return;
        }
        let moveCommand = 'go movetime 100\r\n';
        this.childProcess.stdin.write(moveCommand);
    }

    // Get move made by engine`
    getMove() {
        if (this.isBotMove === false) {
            return null;
        }

        const output = this.outputs[this.outputs.length - 1];

        const moveInfo = output.trim().split(" ");

        if (moveInfo.length === 0 || moveInfo[0] !== 'bestmove') {
            return null;
        }

        const moveStr = moveInfo[1];

        const move = new Move(this.gameClient, moveStr, false);

        this.gameClient.move(move.algebraic);
        this.moveStrList += `${move.bot} `;
        this.isBotMove = false;

        return move.algebraic;
    }

    // Get all legal moves in position
    getLegalMoves() {
        return this.gameClient.getStatus();
    }

    // Get status of game
    getStatus() {
        return this.gameClient.getStatus();
    }
}

export default Game;