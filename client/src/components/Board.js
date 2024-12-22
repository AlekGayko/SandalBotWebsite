import React, { Component } from "react";
import Square from "./Square";
import chess from 'chess';
import axios from 'axios';
import './../Board.css';
import LegalMove from "./LegalMove";

class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameClient: null,
            move: null,
            selectedCoord: null,
            selectedIndex: null,
            waitingForMove: false
        };

        this.state.gameClient = chess.create();

        console.log('GameClient', this.state.gameClient);
    }

    componentDidMount() {
        axios.post('/api/start-game')
        .then(response => {
            console.log(response);            
        })
        .catch(error => {
            console.log(error);
        });
    }

    sendMove(moveInput) {
        axios.post('/api/make-move', { move: moveInput })
        .then(response=> {
            console.log('make-move response:', response);
        })
        .catch(error => {
            console.log(error);
        })
    }

    getMove() {
        axios.get('/api/bot-move')
        .then(response => {
            console.log('get-move response:', response);
            this.gameClient.move(response.move);
            this.setState({
                waitingForMove: false
            });
        })
        .catch(error => {
            console.log(error);
        })
    }

    selectPiece = (coord) => {
        if (this.state.waitingForMove) {
            return;
        }

        const col = coord.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = coord.charCodeAt(1) - '1'.charCodeAt(0);
        const index = (row * 8) + col;

        this.setState({
            selectedCoord: coord,
            selectPiece: index
        })
    }

    makeMove = (coord) => {
        if (this.state.waitingForMove) {
            return;
        }

        const srcFile = this.state.selectedCoord[0];
        const srcRank = parseInt(this.state.selectedCoord[1]);
        const destFile = coord[0];
        const destRank = parseInt(coord[1]);

        const moves = this.state.gameClient.notatedMoves
        let move = null;
        for (let key in moves) {
            if (moves[key].src.file === srcFile && moves[key].src.rank === srcRank
                && moves[key].dest.file === destFile && moves[key].dest.rank === destRank) {
                move = key.toString();
                break;
            }
        }

        let madeMove = this.state.gameClient.move(move);

        this.setState({
            selectedCoord: null,
            selectPiece: null,
            waitingForMove: true
        });

        this.sendMove(move);
        this.getMove();
    }

    render() {
        const { squares } = this.state.gameClient.game.board;
        let { validMoves } = this.state.gameClient;
        validMoves = validMoves.find(moves => (moves.src.file + moves.src.rank) === this.state.selectedCoord);
        if (validMoves) {
            validMoves = validMoves.squares;
        }

        return (
            <React.Fragment>
                <div className="board">
                    {
                        squares.map((square, key) => {
                            const piece = square.piece === null ? null : square.piece.type;
                            const color = square.piece === null ? null : square.piece.side.name;
                            const backgroundColor = Math.floor((key / 8) + (key % 8)) % 2 === 0 ? 'bright' : 'dark';

                            return (
                                <div className={`square ` + backgroundColor} key={square.file + square.rank}>
                                    <Square piece={piece} color={color} index={square.file + square.rank} select={this.selectPiece} />
                                </div>
                            );
                        })
                    }
                    <div>
                    {
                        validMoves ? (
                            validMoves.map((move, key) => {
                                return <LegalMove key={key} file={move.file} rank={move.rank} makeMove={this.makeMove} />
                            })
                        ) : (
                            ''
                        )
                    }
                </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Board;