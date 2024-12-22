const { spawn } = require('child_process');
import chess from 'chess';

// Game class abstracts the chess engine process and state
class Game {
    constructor(id, whiteTurn) {
        this.id = id;
        this.exePath = process.env.ENGINE;
        this.childProcess = null;

        this.gameClient = chess.create();

        this.startProcess();

        if (whiteTurn) {
            this.generateMove();
        }
    }

    // Start chess engine process
    startProcess() {
        this.childProcess = spawn(this.exePath);

        this.childProcess.stdout.on('data', (data) => {
            console.log(`stdout ${data}`);
        });
    }

    // Kill the chess engine process
    killProcess() {
        this.childProcess.stdin.write('quit');
        // this.childProcess.on('close', (code) => {
        //     console.log(`Child process exited with code ${code}`);
        //     this.childProcess = null;

        //     if (code !== 0) {
        //         console.log('Process terminated unexpectedly. Restarting...');
        //     }
        // });
    }

    // Receive move and make move on game client and the chess engine
    inputMove(moveInput) {
        move = this.gameClient.move(moveInput);

        this.childProcess.stdin.write(moveInput);

        this.generateMove();
    }

    generateMove() {
        let command = 'go movetime 1000';
        this.childProcess.stdin.write(command);
    }

    // Get move made by engine
    getMove() {
        this.childProcess.stdout.on('data', (data) => {
            console.log(`stdout ${data}`);
        });
    }

    // Get all legal moves in position
    getLegalMoves() {
        return this.gameClient.getStatus();
    }
}

module.exports = Game;