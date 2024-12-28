import React, { Component } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";

class PlayBoard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            game: new Chess(),
            moveFrom: "",
            moveTo: null,
            showPromotionDialog: false,
            rightClickedSquares: false,
            moveSquares: {},
            optionSquares: {},
            orientation: this.props.firstMove,
            isBotTurn: false,
            moveTime: 500
        }
    }

    // Start game on server
    async componentDidMount() {
        await this.startGame();

        if (this.props.firstMove === "black") {
            await this.generateBotMove();

        }
    }

    startGame = async () => {
        try {
            let response = await axios.post('/api/start-game')
            .then(response => {
                console.log(response);            
            })
            .catch(error => {
                console.log(error);
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    getBotMove = async () => {
        const endTime = Date.now() + 10000;
        let intervalId;
        let move = null;
        const fetchMove = async () => { 
            try {
                const response = await axios.get('/api/bot-move');
                console.log(response);
                if (response.status === 200) {
                    console.log(`move: ${response.data.move}`);
                    let moveData = response.data.move;
                    console.log(this.state.game.ascii());
                    console.log(this.state.game);
                    const gameCopy = new Chess(this.state.game.fen());
                    const move = gameCopy.move({
                        from: moveData.slice(0, 2),
                        to: moveData.slice(2, 4),
                        promotion: moveData.length === 5 ? moveData[4] : "q"
                    });
                    this.setState({
                        game: gameCopy,
                        isBotTurn: false
                    });
                    clearInterval(intervalId);
                } else if (response.status === 202) {
                    console.log(`${response.data.message}`);
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
        }, this.state.moveTime * 2);
    }

    generateBotMove = async () => {
        this.setState({
            isBotTurn: true
        });
        try {
            let response = await axios.post('/api/generate-move', { fen: this.state.game.fen(), moveTime: this.state.moveTime })
            await this.getBotMove();
        } catch (err) {
            console.error(err);
        }
    }

    getMoveOptions = (square) => {
        const moves = this.state.game.moves({
            square,
            verbose: true
        });

        if (moves.length === 0) {
            this.setState({
                optionSquares: {}
            });
            return false;
        }

        const newSquares = {};

        moves.map(move => {
            newSquares[move.to] = {
                background: this.state.game.get(move.to) && this.state.game.get(move.to).color !== this.state.game.get(square).color ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)" : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%"
            };
            return move;
        });

        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)"
        };

        this.setState({
            optionSquares: newSquares
        });

        return true;
    }

    onSquareClick = (square) => {
        this.setState({
            rightClickedSquares: {}
        });

        if (this.state.isBotTurn) {
            return;
        }

        // from square
        if (!this.state.moveFrom) {
            const hasMoveOptions = this.getMoveOptions(square);
            if (hasMoveOptions) {
                this.setState({
                    moveFrom: square
                });
            }
            return;
        }

        // to square
        if (!this.state.moveTo) {
            const { moveFrom } = this.state;
            // check if valid move before showing dialog
            const moves = this.state.game.moves({
                moveFrom,
                verbose: true
            });
            const foundMove = moves.find(m => m.from === this.state.moveFrom && m.to === square);
            // not a valid move
            if (!foundMove) {
                // check if clicked on new piece
                const hasMoveOptions = this.getMoveOptions(square);
                // if new piece, setMoveFrom, otherwise clear moveFrom
                this.setState({
                    moveFrom: hasMoveOptions ? square : ""
                });

                return;
            }

            // valid move
            this.setState({
                moveTo: square
            });

            // if promotion move
            if ((foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8") || (foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1")) {
                this.setState({
                    showPromotionDialog: true
                });
                return;
            }

            // is normal move
            const gameCopy = new Chess(this.state.game.fen());

            const move = gameCopy.move({
                from: this.state.moveFrom,
                to: square,
                promotion: "q"
            });
            // if invalid, setMoveFrom and getMoveOptions
            if (move === null) {
                const hasMoveOptions = this.getMoveOptions(square);
                if (hasMoveOptions) {
                    this.setState({
                        moveFrom: square
                    });
                }
                return;
            }

            this.setState({
                game: gameCopy,
            }, () => {
                this.generateBotMove();
                setTimeout(this.state.moveTime * 2);
            });

            this.setState({
                moveFrom: "",
                moveTo: null,
                optionSquares: {}
            });
            return;
        }
    }

    onSquareRightClick = (square) => {
        const colour = "rgba(0, 0, 255, 0.4)";
        this.setState({
            rightClickedSquares: {
                ...this.state.rightClickedSquares,
                [square]: this.state.rightClickedSquares[square] && this.state.rightClickedSquares[square].backgroundColor === colour ? undefined : {
                    backgroundColor: colour
                }
            }
        });
    }

    onPromotionPieceSelect = (piece) => {
        if (this.state.isBotTurn) {
            return false;
        }
        // if no piece passed then user has cancelled dialog, don't make move and reset
        if (piece) {
            const gameCopy = {
                ...this.state.game
            };
            
            gameCopy.move({
                from: this.state.moveFrom,
                to: this.state.moveTo,
                promotion: piece[1].toLowerCase() ?? "q"
            });
            this.setState({
                game: gameCopy
            }, () => {
                this.generateBotMove();
                setTimeout(this.state.moveTime * 2);
            });
        }

        this.setState({
            moveFrom: "",
            moveTo: null,
            showPromotionDialog: false,
            optionSquares: {}
        });

        return true;
    }


    render() {
        const { game, moveSquares, optionSquares, rightClickedSquares, moveTo, showPromotionDialog, orientation } = this.state;
        return (
            <div>
                <button>Back</button>
                <div className="boardContainer">
                    <Chessboard id="ClickToMove" position={game.fen()} boardOrientation={orientation} arePiecesDraggable={false} onSquareClick={this.onSquareClick} onSquareRightClick={this.onSquareRightClick} onPromotionPieceSelect={this.onPromotionPieceSelect} customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                    }} customSquareStyles={{
                        ...moveSquares,
                        ...optionSquares,
                        ...rightClickedSquares
                    }} promotionToSquare={moveTo} showPromotionDialog={showPromotionDialog} />
                </div>
                <button>Resign</button>
                <button onClick={() => {this.setState({ orientation: this.state.orientation === "white" ? "black" : "white"})}}>Flip Board</button>
                {/* <button onClick={() => { const gameCopy = new Chess(game.fen());console.log(game); gameCopy.undo(); this.setState({ game: gameCopy })}}>Undo</button> */}
            </div>
        )
    }
}

export default PlayBoard;