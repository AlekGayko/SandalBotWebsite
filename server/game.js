import { spawn } from 'node:child_process';
import chess from 'chess';

// Game class abstracts the chess engine process and state
class Game {
    constructor(id, goFirst) {
        this.id = id;
        this.exePath = process.env.ENGINE;
        this.childProcess = null;
        this.outputs = [];
        this.moves = [];
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
        console.log(`move: ${moveInput}`);
        const move = this.gameClient.move(moveInput);
        console.log(move);
        let moveStr = '';
        moveStr += move.move.prevSquare.file + move.move.prevSquare.rank;
        moveStr += move.move.postSquare.file + move.move.postSquare.rank;
        
        console.log(moveStr)
        this.moves.push(move);

        this.childProcess.stdin.write(moveInput + '\r\n');
    }

    generateMove() {
        if (this.isBotMove === false) {
            return;
        }
        
        let command = 'go movetime 100\r\n';
        this.childProcess.stdin.write(command);
    }

    // Get move made by engine
    getMove() {
        if (this.isBotMove === false) {
            return null;
        }

        let moveInfo = ['', ''];
        let move = '';
        while (moveInfo[0] !== 'bestmove') {
            const output = this.outputs[this.outputs.length - 1];

            moveInfo = output.split(" ");
            move = moveInfo[1];
        }

        const srcFile = move[0];
        const srcRank = parseInt(move[1]);
        const destFile = move[2];
        const destRank = parseInt(move[3]);

        const moves = this.gameClient.notatedMoves

        for (let key in moves) {
            if (moves[key].src.file === srcFile && moves[key].src.rank === srcRank
                && moves[key].dest.file === destFile && moves[key].dest.rank === destRank) {
                move = key.toString();
                break;
            }
        }
        this.isBotMove = false;
        return move;
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