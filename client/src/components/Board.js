import React, { Component } from "react";
import Square from "./Square";
import chess from 'chess';
import axios from 'axios';
import './../Board.css';
import LegalMove from "./LegalMove";
import PromotionMenu from "./PromotionMenu";

class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameClient: null,
            move: null,
            selectedCoord: null,
            selectedIndex: null,
            promotionColor: null,
            promotingCoord: null,
            promoting: null,
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
        const endTime = Date.now() + 10000;
        const intervalDuration = 1000
        let intervalId;
        const fetchMove = async () => { 
            try {
                const response = await axios.get('/api/bot-move');
                console.log(response);
                if (response.status === 200) {
                    console.log(`move: ${response.data.move}`);
                    this.state.gameClient.move(response.data.move);
                    this.setState({
                        waitingForMove: false
                    });
                    clearInterval(intervalId);
                } else if (response.status === 202) {
                    console.log(`Status 202: ${response.data.message}`);
                }
            } catch (err) {
                console.log(err);
            }
        };

        intervalId = setInterval(() => {
            if (Date.now() >= endTime) {
                clearInterval(this.intervalId);
            } else {
                fetchMove();
            }
        }, intervalDuration);

    }

    selectPiece = (coord) => {
        if (this.state.waitingForMove) {
            return;
        }

        const col = coord.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = coord.charCodeAt(1) - '1'.charCodeAt(0);
        const index = (row * 8) + col;

        this.setState({
            promotingCoord: null,
            promoting: false,
            selectedCoord: coord,
            selectPiece: index
        })
    }

    selectPromotionType = (piece) => {
        this.makeMove(this.state.promotingCoord, piece);
    }

    makeMove = (coord, promotionType) => {
        console.log('MAKING MOVE!')
        if (this.state.waitingForMove) {
            return;
        }

        const srcFile = this.state.selectedCoord[0];
        const srcRank = parseInt(this.state.selectedCoord[1]);
        const destFile = coord[0];
        const destRank = parseInt(coord[1]);

        let piece = null;
        piece = this.state.gameClient.validMoves.find(move => move.src.file === srcFile && move.src.rank === srcRank);
        const color = piece.src.piece.side.name;
        piece = piece.src.piece.type;

        if (!promotionType && piece === "pawn" && (destRank === 8 || destRank === 1)) {
            this.setState({
                promotingCoord: coord,
                promotionColor: color,
                promoting: true,
            });
            return;
        }

        const moves = this.state.gameClient.notatedMoves;
        let move = null;
        for (let key in moves) {
            if (moves[key].src.file === srcFile && moves[key].src.rank === srcRank
                && moves[key].dest.file === destFile && moves[key].dest.rank === destRank) {
                move = key.toString();
                if (promotionType && move[move.length - 1] === promotionType) {
                    break;
                } else if (!promotionType) {
                    break;
                }
            }
        }

        let madeMove = this.state.gameClient.move(move);

        this.setState({
            promoting: null,
            promotingCoord: null,
            selectedCoord: null,
            selectPiece: null,
            waitingForMove: true
        });
        console.log(this.state.gameClient);
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
                    {
                        this.state.promoting ? (
                            <PromotionMenu color={this.state.promotionColor} select={this.selectPromotionType}/>
                        ) : (
                            ''
                        )
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default Board;