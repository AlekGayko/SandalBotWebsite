import React, { Component } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";

class PlayBoard extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            game: new Chess(),
            fen: null,
            moveFrom: "",
            moveTo: null,
            showPromotionDialog: false,
            rightClickedSquares: false,
            moveSquares: {},
            optionSquares: {},
            orientation: this.props.firstMove,
            isBotTurn: false,
            moves: [],
            moveIndex: 0,
            moveTime: 500
        }

        this.state.fen = this.state.game.fen();

        this.back = props.back;
        this.socketUrl = null;
        this.socket = null;
        this.socketOpen = false;
        this.movesRef = React.createRef();
    }

    // Start game on server
    componentDidMount() {
        this.startSession();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        if (this.movesRef.current) {
            this.movesRef.current.scrollTop = this.movesRef.current.scrollHeight;
        }
    }

    startSession = async () => {
        try {
            let response = await axios.get('/api/start-session')
            .then(response => {
                console.log(response);
                this.socketUrl = response.data.url;    
                this.openSocket();      
            })
            .catch(error => {
                console.log(error);
            });
        } catch (err) {
            console.error(err);
            throw new Error();
        }
    }

    openSocket = async () => {
        this.socket = new WebSocket(this.socketUrl);

        this.socket.onopen = () => {
            console.log('Socket Connected.');
            this.socketOpen = true;
            if (this.props.firstMove === "black") {
                this.generateBotMove();
            }
        }

        this.socket.onmessage = (event) => {
            try {
                const jsonMsg = JSON.parse(event.data);
                console.log('Message Received', jsonMsg);

                switch (jsonMsg.type) {
                    case "ping":
                        break;
                    case "move":
                        const moveData = jsonMsg.move;
                        let move = null;
                        if (moveData === "O-O" || moveData === "O-O-O") {
                            move = this.state.game.move(moveData);
                        } else {
                            move = this.state.game.move({
                                from: moveData.slice(0, 2),
                                to: moveData.slice(2, 4),
                                promotion: moveData.length === 5 ? moveData[4] : "q"
                            });
                        }
                        console.log(move);
                        this.state.moves.push(move.san);
                        this.setState({
                            fen: this.state.game.fen(),
                            isBotTurn: false,
                            moveIndex: this.state.moveIndex + 1
                        });
                        break;
                }
            } catch (error) {
                console.error(error);
            }
        }

        this.socket.onerror = (error) => {
            console.error(error);
        }

        this.socket.onclose = () => {
            console.error('Socket Closed.')
        }
    }

    quitGame = async () => {
        try {
            const msg = { type: "quit" };
            this.socket.send(JSON.stringify(msg));
            this.socket.close();
            this.back();
        } catch (error) {
            console.error(error);
        }
    }

    generateBotMove = async (from, to, promotionType) => {
        try {
            this.setState({
                isBotTurn: true
            });

            this.socket.send(JSON.stringify({ type: "move", move: { from: from, to: to, promotion: promotionType } }));
            // while (this.prevMsg === null) {

            // }
            // if (this.prevMsg.type !== "OK") {
            //     throw new Error("Did not receive OK");
            // }

            this.socket.send(JSON.stringify({ type: "makeMove", moveTime: this.state.moveTime }));
        } catch (error) {
            throw error;
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

        if (this.state.game.isGameOver()) {
            this.quitGame();
            return;
        }

        if (this.state.isBotTurn) {
            return;
        }
        console.log(this.state.moveIndex)
        if (this.state.moveIndex > this.state.moves.length) {
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
            const move = this.state.game.move({
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
            this.state.moves.push(move.san)
            this.setState({
                fen: this.state.game.fen(),
                moveIndex: this.state.moveIndex + 1
            });

            this.generateBotMove(this.state.moveFrom, square, "q");
            setTimeout(this.state.moveTime * 2);

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
            const move = this.state.game.move({
                from: this.state.moveFrom,
                to: this.state.moveTo,
                promotion: piece[1].toLowerCase() ?? "q"
            });
            this.state.moves.push(move.san)
            this.setState({
                fen: this.state.game.fen(),
                moveIndex: this.state.moveIndex + 1
            });

            this.generateBotMove(this.state.moveFrom, this.state.moveTo, piece[1].toLowerCase() ?? "q");
            setTimeout(this.state.moveTime * 2);
        }

        this.setState({
            moveFrom: "",
            moveTo: null,
            showPromotionDialog: false,
            optionSquares: {}
        });

        return true;
    }

    goBack = () => {
        const { moveIndex, isBotTurn } = this.state;
        this.state.game.undo();        

        if (moveIndex === 0) {
            return;
        }
        this.state.moveIndex--;
        this.setState({
            fen: this.state.game.fen(),
            isBotTurn: !isBotTurn
        });
    }

    goForward = () => {
        const { moves, moveIndex, isBotTurn } = this.state;
        if (moveIndex >= moves.length) {
            return;
        }

        this.state.game.move(moves[moveIndex]);
        this.state.moveIndex++;
        this.setState({
            fen: this.state.game.fen(),
            isBotTurn: !isBotTurn
        });
    }

    goToStart = () => {
        for (let i = this.state.moveIndex; i >= 0; i--) {
            this.goBack();
        }
    }

    goToEnd = () => {
        for (let i = this.state.moveIndex; i < this.state.moves.length; i++) {
            this.goForward();
        }
    }
    
    render() {
        const { game, fen, moveSquares, optionSquares, rightClickedSquares, moveTo, showPromotionDialog, orientation } = this.state;
        let fillerSquares = [];
        if (this.state.moves.length < 12 * 2) {
            for (let i = 0; i < (12 * 2 - this.state.moves.length); i++) {
                fillerSquares.push(0)
            }
        } else if (this.state.moves.length % 2 === 1) {
            fillerSquares.push(0);
        }

        const customSquareStyles = this.state.moveIndex === this.state.moves.length ? (
            {
                ...moveSquares,
                ...optionSquares,
                ...rightClickedSquares
            }
        ) : (
            {}
        )
        return (
            <div className="playContainer">
                <div className="boardContainerPlay">
                    <Chessboard id="ClickToMove" position={fen} boardOrientation={orientation} arePiecesDraggable={false} onSquareClick={this.onSquareClick} onSquareRightClick={this.onSquareRightClick} onPromotionPieceSelect={this.onPromotionPieceSelect} customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                    }} customSquareStyles={customSquareStyles} promotionToSquare={moveTo} showPromotionDialog={showPromotionDialog} />
                    <div id="flipContainer">
                        <button id="flip" onClick={() => {this.setState({ orientation: this.state.orientation === "white" ? "black" : "white"})}}><i className="fa-solid fa-retweet"></i></button>
                    </div>
                </div>
                <div className="sideMenuPlay">
                    <button id="back" onClick={() => {this.quitGame(); this.back();}}><i className="fa-solid fa-arrow-left"></i> Back</button>
                    <div className="moves">
                        <div className="moveList" ref={this.movesRef}>
                            {
                                this.state.moves.map((move, key) => {
                                    let style = {};
                                    if (key === this.state.moveIndex - 1) {
                                        style = {backgroundColor: "rgb(136, 136, 136)"};
                                    }
                                    return <div key={key} className="move" style={style}>{move}</div>
                                })
                            }
                            {
                                fillerSquares.map((element, index) => (
                                    <div key={index} className="move"></div>
                                ))
                            }
                        </div>
                        <div className="navButtons">
                            <button onClick={this.goToStart}><i className="fa-solid fa-less-than-equal"></i></button>
                            <button onClick={this.goBack}><i className="fa-solid fa-arrow-left"></i></button>
                            <button onClick={this.goForward}><i className="fa-solid fa-arrow-right"></i></button>
                            <button onClick={this.goToEnd}><i className="fa-solid fa-greater-than-equal"></i></button>
                        </div>
                    </div>
                    <button id="resign" onClick={this.quitGame}><i className="fa-regular fa-flag"></i> Resign</button>
                </div>
            </div>
        )
    }
}

export default PlayBoard;