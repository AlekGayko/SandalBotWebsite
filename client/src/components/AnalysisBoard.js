import React, { Component } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import FenParser from "@chess-fu/fen-parser";

class AnalysisBoard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            game: new Chess(),
            chessBoardPosition: null,
            analysis: {},
            fenInput: '',
            selectedSidePiece: { type: "", color: "", str: "--" },
            side: "w"
        }

        this.state.chessBoardPosition = this.state.game.fen();
        this.state.fenInput = this.state.chessBoardPosition;

        this.socketUrl = null;
        this.socket = null;
        this.socketOpen = false;
    }

    async componentDidMount() {
        await this.startSession();
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
            this.updateAnalysis(this.state.chessBoardPosition);
        }

        this.socket.onmessage = (event) => {
            try {
                const jsonMsg = JSON.parse(event.data);

                console.log('Message Received', jsonMsg);

                switch (jsonMsg.type) {
                    case "ping":
                        break;
                    case "analysis":
                        const analysis = jsonMsg.info;
                        analysis.visualPv = this.transformPv(analysis.pv);
                        this.setState({
                            analysis: analysis
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

    transformPv = (pv) => {
        if (!pv) {
            return "";
        }
        let newPv = pv;
        newPv = newPv.trim().split(" ");
        console.log(newPv)
        const chess = new Chess(this.state.chessBoardPosition);
        let transformedPV = "";
        newPv.forEach(element => {
            let move = null;
            if (element === "O-O" || element === "O-O-O") {
                move = chess.move(element);
            } else {
                move = chess.move({
                    from: element.slice(0, 2),
                    to: element.slice(2, 4),
                    promotion: element.length === 5 ? element[4] : "q"
                });
            }

            transformedPV += move.san + " ";
        });
        transformedPV = transformedPV.trim();

        return transformedPV;
    }

    updateAnalysis = async (fen) => {
        try {
            this.setState({
                analysis: {}
            });
            const msg = JSON.stringify({ type: "analysis", fen: fen });
            this.socket.send(msg);
        } catch (error) {
            console.error(error);
        }
    }

    onDrop = (sourceSquare, targetSquare, piece) => {
        try {
            this.state.game.remove(sourceSquare);
            this.state.game.put({ type: piece[1], color: piece[0]}, targetSquare);

            this.setState({
                chessBoardPosition: this.state.game.fen()
            });

            this.updateAnalysis(this.state.game.fen());

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    onSquareClick = (square) => {
        try {
            const { selectedSidePiece } = this.state;
            if (selectedSidePiece.str === "--") {
                return;
            }

            this.state.game.put({ type: selectedSidePiece.type, color: selectedSidePiece.color }, square);

            this.setState({
                chessBoardPosition: this.state.game.fen(),
                selectedSidePiece: { color: "", type: "", str: "--"}
            });

            this.updateAnalysis(this.state.game.fen());
        } catch (error) {
            console.error(error);
            return;
        }
    }

    selectSidePiece = (event) => {
        const alt = event.target.alt;
        const color = alt[1] === "l" ? "w" : "b";
        const piece = alt[0].toUpperCase();

        if (alt === this.state.selectedSidePiece.str) {
            this.setState({
                selectedSidePiece: { type: "", color: "", str: "--" }
            }, console.log('same'));
        } else {
            this.setState({
                selectedSidePiece: { type: piece, color: color, str: alt }
            }, console.log(this.state.selectedSidePiece));
        }
        
    }

    switchSides = (event) => {
        const value = event.target.value;

        this.state.game._turn = value;
        const fen = new FenParser(this.state.game.fen());

        fen.turn = value;

        this.state.game._positionCount = fen.toString();
        this.setState({
            chessBoardPosition: fen.toString(),
            side: value
        });
        this.updateAnalysis(this.state.game.fen())
        console.log(this.state.game)
    }

    changeFEN = () => {
        const fen = new FenParser(this.state.fenInput); 
        if (!fen.isValid) {
            this.setState({ 
                fenInput: ''
            });
            return;
        }
        this.setState({ 
            game: new Chess(this.state.fenInput), 
            chessBoardPosition: this.state.fenInput, 
            fenInput: '', 
            side: fen.turn 
        });

        this.updateAnalysis(this.state.fenInput);
    }

    render() {
        const { chessBoardPosition, analysis } = this.state;
        let bestMove = this.state.analysis.pv?.split(" ")?.[0];
        if (bestMove) {
            try {
                const chess = new Chess(chessBoardPosition);
                const move = chess.move(bestMove);
                bestMove = move.lan;
            } catch (error) {
                bestMove = null;
            }
        }
        
        const noData = Object.keys(this.state.analysis).length === 0;
        let evaluation = "-";
        const colorChars = ["l", "d"];
        const pieceChars = ["p", "b", "n", "r", "q", "k"];
        if (!noData) {
            if (analysis.score.slice(0, 4) === "mate") {
                evaluation = "M" + Math.abs(parseInt(analysis.score.slice(4)));
            } else {
                const sign = analysis.score >= 0 ? "+" : "";
                evaluation = sign + (analysis.score / 100);
            }
        }

        let evalBarStyle = {};
        let evalHeight = 50 + Math.min(45, Math.abs(0.2 * evaluation ** 3)) * Math.sign(evaluation);
        let evalStyle = { 
            backgroundColor: evaluation >= 0 ^ this.state.game.turn() === "b" ? "white" : "black", 
            color:  evaluation >= 0 ^ this.state.game.turn() === "b" ? "black" : "white" 
        };
        if (evaluation[0] === "M") {
            const whiteWinning = parseInt(analysis.score.slice(4)) >= 0 ^ this.state.game.turn() === "b";
            evalBarStyle = { color: whiteWinning ? "black" : "white", top: whiteWinning ? "2.5%" : "97.5%" };
            evalHeight = whiteWinning ? 100 : 0;
            evalStyle = { backgroundColor: whiteWinning ? "white" : "black", color:  whiteWinning ? "black" : "white" };
        } else {
            evalBarStyle = { 
                color: evaluation >= 0 ^ this.state.game.turn() === "b" ? "black" : "white", 
                top: evaluation >= 0 ^ this.state.game.turn() === "b" ? "2.5%" : "97.5%" 
            };
        }

        return (
            <div className="analysisContainer">
                <div className="board-eval">
                    <div className="evalBar">
                        <div style={{ height: `${ evalHeight }%` }}></div>
                        <p style={evalBarStyle}>{evaluation}</p>                
                    </div>
                    <div className="boardContainerAnalysis">
                        <Chessboard id="defaultBoard" position={chessBoardPosition} onPieceDrop={this.onDrop} onSquareClick={this.onSquareClick} customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                        }} customArrows={bestMove ? [[(bestMove.substring(0, 2)), (bestMove.substring(2, 4)), "rgb(0, 128, 0)"]] : undefined} />
                </div>
                </div>
                <div className="sideMenuAnalysis">
                    <div className="depth-pv">
                        <div>
                            Depth={noData ? " - " : analysis.depth}
                        </div>
                        <div className="eval-pv-container">
                            <div className="eval" style={evalStyle}>{ evaluation }</div>
                            <div className="pv">{noData ? "-" : analysis.visualPv}</div>
                        </div>
                    </div>
                    <div className="fenDisplay">
                        <input type="text" value={this.state.chessBoardPosition} readOnly/>
                    </div>
                    <div className="fenChanger">
                        <input type="text" placeholder="FEN" value={this.state.fenInput} onChange={(event) => {this.setState({ fenInput: event.target.value })}}></input>
                        <button onClick={this.changeFEN}>Load</button>
                    </div>
                    <select className="sideSwitcher" value={this.state.game.turn()} onChange={this.switchSides}>
                        <option value="w">White to move</option>
                        <option value="b">Black to move</option>
                    </select>
                    <button id="reset" onClick={() => {this.state.game.reset(); this.updateAnalysis(this.state.game.fen()); this.setState({ chessBoardPosition: this.state.game.fen(), side: this.state.game.turn() });}}>Reset</button>
                    <div className="pieceSelect">
                        <div>
                            {
                                colorChars.map(color => (
                                    pieceChars.map(piece => {
                                        const pieceStr = `${piece}${color}`;
                                        return (
                                            <button key={pieceStr} value={pieceStr} onClick={this.selectSidePiece} style={{backgroundColor: this.state.selectedSidePiece.str === pieceStr ? "var(--opposite-color)" : ""}}>
                                                <img src={`pieces/Chess_${pieceStr}t60.png`} alt={pieceStr} />
                                            </button>
                                        );
                                    })
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AnalysisBoard;