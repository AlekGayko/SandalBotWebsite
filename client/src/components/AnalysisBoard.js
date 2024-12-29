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
    }

    async componentDidMount() {
        const initIntervalTime = 500;
        let intervalTime = initIntervalTime;
        let fen;
        let intervalId;

        const startAnalysis = async () => {
            try {
                let response = await axios.post('/api/start-analysis');

                if (response.status === 201 || response.status === 400) {
                    this.getAnalysis();
                    clearInterval(intervalId);
                } else {
                    console.error(response);
                }
            } catch (error) {
                console.error(error);
            }
        }

        intervalId = setInterval(() => {
            startAnalysis();
        }, intervalTime);
    }

    getAnalysis = async () => {
        const initIntervalTime = 500;
        let intervalTime = initIntervalTime;
        let fen;
        let intervalId;
        
        const fetchMove = async () => { 
            try {
                const response = await axios.get('/api/bot-analysis', { 
                    params: { 
                        fen: fen 
                    }
                });
                
                if (response.status === 200) {
                    if (response.data.analysis === this.state.analysis) {
                        intervalTime = intervalTime * 1.25;
                        console.log(intervalTime);
                    } else {
                        intervalTime = initIntervalTime;
                    }
                    this.setState({
                        analysis: response.data.analysis
                    });
                } else if (response.status === 201) {
                    console.log(`${response.data.message}`);
                }
            } catch (err) {
                console.log(err);
            }
        };

        intervalId = setInterval(() => {
            fen = this.state.chessBoardPosition;
            fetchMove();
        }, intervalTime);
    }

    onDrop = (sourceSquare, targetSquare, piece) => {
        try {
            this.state.game.remove(sourceSquare);
            this.state.game.put({ type: piece[1], color: piece[0]}, targetSquare);

            this.setState({
                chessBoardPosition: this.state.game.fen()
            });

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
        console.log(this.state.game)
        this.state.game._turn = value;
        const fen = new FenParser(this.state.game.fen());
        console.log(fen.turn)
        fen.turn = value;
        console.log(fen.toString())
        this.state.game._positionCount = fen.toString();
        this.setState({
            chessBoardPosition: fen.toString(),
            side: value
        });
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
    }

    render() {
        const { chessBoardPosition, analysis } = this.state;
        const bestMove = this.state.analysis.pv?.split(" ")?.[0];
        const noData = Object.keys(this.state.analysis).length === 0;
        let evaluation = "-";
        const colorChars = ["l", "d"];
        const pieceChars = ["p", "b", "n", "r", "q", "k"];
        if (!noData) {
            if (analysis.score.slice(0, 4) === "mate") {
                evaluation = "M" + analysis.score[4];
            } else {
                const sign = analysis.score >= 0 ? "+" : "";
                evaluation = sign + (analysis.score / 100);
            }
        }

        let evalBarStyle = {};
        let evalHeight = 50 + Math.min(50, Math.abs(0.2 * evaluation ** 3)) * Math.sign(evaluation);
        if (evaluation[0] === "M") {
            const whiteWinning = !(this.state.game.turn() === "w" ^ analysis.pv.trim().split(" ").length % 2 === 1);
            evalHeight = whiteWinning ? "100" : "0";
            evalBarStyle = { color: whiteWinning ? "black" : "white", top: whiteWinning ? "2.5%" : "97.5%" };
        } else {
            evalBarStyle = { color: evaluation >= 0 ? "black" : "white", top: evaluation >= 0 ? "2.5%" : "97.5%" };
        }

        return (
            <div className="analysisContainer">
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
                <div className="sideMenuAnalysis">
                    <div>
                        <div>
                            Depth={noData ? " - " : analysis.depth}
                        </div>
                        <div className="eval-pv-container">
                            <div className="eval" style={{backgroundColor: evaluation >= 0 ? "white" : "black", color:  evaluation >= 0 ? "black" : "white"}}>{ evaluation }</div>
                            <div className="pv">{noData ? "-" : analysis.pv}</div>
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
                    <button id="reset" onClick={() => {this.state.game.reset(); this.setState({ chessBoardPosition: this.state.game.fen(), side: this.state.game.turn() });}}>Reset</button>
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