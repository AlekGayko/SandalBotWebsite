import React, { Component } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import GameOverDialogue from "./GameOverDialogue";

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
            gameOver: false,
            result: null,
            whiteTime: props.time * 60,
            blackTime: props.time * 60,
            increment: props.increment
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

    countDown = () => {
        if (this.state.gameOver) {
            return;
        }

        const { game, whiteTime, blackTime } = this.state;
        let currentSideTime = game.turn() === "w" ? whiteTime : blackTime;

        if (currentSideTime === 0) {
            if (!this.state.gameOver) {
                const winningSide = game.turn() === "b" ? "White" : "Black";
                const losingSide = winningSide === "White" ? "Black" : "White";
                const botWon = !this.state.isBotTurn;

                this.quitGame();
                this.setState({
                    gameOver: true,
                    result: {
                        type: "TimeOut",
                        winningSide: winningSide,
                        losingSide: losingSide,
                        botWon: botWon
                    }
                });
            }

            clearInterval(this.interval);
            return
        }

        if (game.turn() === "w") {
            this.setState({
                whiteTime: this.state.whiteTime - 1
            });
        } else {
            this.setState({
                blackTime: this.state.blackTime - 1
            });
        }
    }
    
    incrementTime = () => {
        if (this.state.gameOver) {
            return;
        }

        const { increment, whiteTime, blackTime } = this.state;

        if (increment <= 0) {
            return;
        }

        if (this.state.game.turn() === "w") {
            this.setState({
                whiteTime: whiteTime + increment
            });
        } else {
            this.setState({
                blackTime: blackTime + increment
            });
        }
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
            this.interval = setInterval(this.countDown, 1000);
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
                        let moveObj = null;

                        if (moveData === "O-O" || moveData === "O-O-O") {
                            moveObj = moveData;
                        } else {
                            moveObj = {
                                from: moveData.slice(0, 2), 
                                to: moveData.slice(2, 4),
                                promotion: moveData.length === 5 ? moveData[4] : "q"
                            };
                        }

                        this.makeMove(moveObj);
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
        } catch (error) {
            console.error(error);
        }
    }

    generateBotMove = async (from, to, promotionType) => {
        try {
            this.setState({
                isBotTurn: true
            });
            const { whiteTime, blackTime, increment } = this.state;
            const moveMsg = { type: "move", move: { from: from, to: to, promotion: promotionType } };
            console.log(moveMsg)
            this.socket.send(JSON.stringify(moveMsg));
            const botMoveMsg = { type: "makeMove", times: { wtime: whiteTime * 1000, btime: blackTime * 1000, winc: increment * 1000, binc: increment * 1000 } };
            this.socket.send(JSON.stringify(botMoveMsg));
        } catch (error) {
            throw error;
        }
    }

    makeMove = (moveObj) => {
        this.incrementTime();
        let move = null;
        if (moveObj === "O-O" || moveObj === "O-O-O") {
            move = this.state.game.move(moveObj);
        } else {
            move = this.state.game.move({
                from: moveObj.from,
                to: moveObj.to,
                promotion: moveObj.promotion
            });
        }
        this.logResult();
        console.log(moveObj)
        this.state.moves.push(move.san);
        const makeBotMove = !this.state.isBotTurn;
        this.setState({
            fen: this.state.game.fen(),
            moveIndex: this.state.moveIndex + 1,
            isBotTurn: !this.state.isBotTurn
        });

        if (makeBotMove) {
            this.generateBotMove(moveObj.from, moveObj.to, moveObj.promotion)
        }
        this.scrollToBottom();
        return move;
    }

    logResult = () => {
        const {game} = this.state;
        const winningSide = game.turn() === "b" ? "White" : "Black";
        const losingSide = winningSide === "White" ? "Black" : "White";
        const botWon = this.state.isBotTurn;
        let result = null;

        if (game.isCheckmate()) {
            result = { type: "Checkmate", winningSide: winningSide, losingSide: losingSide, botWon: botWon };
        } else if (game.isThreefoldRepetition()) {
            result = { type: "Threefold", winningSide: winningSide, losingSide: losingSide, botWon: botWon };
        } else if (game.isStalemate()) {
            result = { type: "Stalemate", winningSide: winningSide, losingSide: losingSide, botWon: botWon };
        } else if (game.isInsufficientMaterial()) {
            result = { type: "InsufficientMaterial", winningSide: winningSide, losingSide: losingSide, botWon: botWon };
        } else if (game.isDraw()) {
            result = { type: "FiftyMoveRule", winningSide: winningSide, losingSide: losingSide, botWon: botWon };
        }

        if (result) {
            this.setState({
                result: result,
                gameOver: true
            });
            this.quitGame();
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

        if (this.state.gameOver) {
            return;
        }

        if (this.state.isBotTurn) {
            return;
        }

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

            const move = this.makeMove({
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
            this.makeMove({
                from: this.state.moveFrom,
                to: this.state.moveTo,
                promotion: piece[1].toLowerCase() ?? "q"
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

    resign = () => {
        this.quitGame();
        const winningSide = this.props.firstMove === "black" ? "White" : "Black";
        const losingSide = winningSide === "White" ? "Black" : "White";
        const botWon = true;
        this.setState({
            gameOver: true,
            result: { 
                type: "Resignation", 
                winningSide: winningSide,
                losingSide: losingSide,
                botWon: botWon
            }
        });
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

        const whiteTime = Math.floor(this.state.whiteTime / 60) + ":" + (this.state.whiteTime % 60 < 10 ? "0" + this.state.whiteTime % 60 : this.state.whiteTime % 60);
        const blackTime = Math.floor(this.state.blackTime / 60) + ":" + (this.state.blackTime % 60 < 10 ? "0" + this.state.blackTime % 60 : this.state.blackTime % 60);
        const whiteTimeStyle = { backgroundColor: this.state.game.turn() === "w" && !this.state.gameOver ? "white" : "grey" };
        const blackTimeStyle = { backgroundColor: this.state.game.turn() === "b" && !this.state.gameOver ? "black" : "grey" , color: this.state.game.turn() === "b" && !this.state.gameOver ? "white" : "black"};

        return (
            <div className="playContainer">
                <div className="boardContainerPlay">
                    <div className="timer" style={orientation === "white" ? blackTimeStyle : whiteTimeStyle}>{orientation === "white" ? blackTime : whiteTime}</div>
                    <Chessboard id="ClickToMove" position={fen} boardOrientation={orientation} arePiecesDraggable={false} onSquareClick={this.onSquareClick} onSquareRightClick={this.onSquareRightClick} onPromotionPieceSelect={this.onPromotionPieceSelect} 
                    customSquareStyles={customSquareStyles} promotionToSquare={moveTo} showPromotionDialog={showPromotionDialog} />
                    <div className="timer" style={orientation === "black" ? blackTimeStyle : whiteTimeStyle}>{orientation === "black" ? blackTime : whiteTime}</div>
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
                    {
                        !this.state.result ? (
                            <button id="resign" onClick={this.resign}><i className="fa-regular fa-flag"></i> Resign</button>
                        ) : (
                            ''
                        )
                    }
                    <GameOverDialogue result={this.state.result} />
                </div>
            </div>
        )
    }
}

export default PlayBoard;