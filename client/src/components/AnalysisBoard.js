import React, { Component } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import PositionAnalysis from "./PositionAnalysis";

class AnalysisBoard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            game: new Chess(),
            chessBoardPosition: null,
            analysis: {}
        }

        this.state.chessBoardPosition = this.state.game.fen();
    }

    async componentDidMount() {
        try {
            let response = await axios.post('/api/start-analysis');

            if (response.status === 201 || response.status === 400) {
                console.log(response);
                this.getAnalysis();
            } else {
                console.error(response);
            }
        } catch (error) {
            console.error(error);
        }
    }

    getAnalysis = async () => {
        const endTime = Date.now() + 10000;
        let intervalId;
        let move = null;
        const fetchMove = async () => { 
            try {
                const response = await axios.get('/api/bot-analysis');
                console.log(response);
                if (response.status === 200) {
                    console.log(response.data);
                    this.setState({
                        analysis: response.data.analysis
                    });
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
        });
    }
    onDrop = (sourceSquare, targetSquare, piece) => {
        try {
            const move = this.state.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: piece[1].toLowerCase() ?? "q"
            });
            this.setState({
                chessBoardPosition: this.state.game.fen(),
                possibleMate: ""
            });
        
            // illegal move
            if (move === null) 
                return false;
            //engine.stop();
            this.setState({
                pv: ""
            });
            if (this.state.game.game_over() || this.state.game.in_draw()) 
                return false;

            return true;
        } catch (err) {
            return false;
        }
    }

    render() {
        const { chessBoardPosition, analysis } = this.state;
        const bestMove = this.state.pv?.split(" ")?.[0];
        return (
            <div>
                <PositionAnalysis analysis={analysis} />
                <div className="boardContainer">
                    <Chessboard id="AnalysisBoard" position={chessBoardPosition} onPieceDrop={this.onDrop} customBoardStyle={{
                    borderRadius: "4px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
                    }} customArrows={bestMove ? [[(bestMove.substring(0, 2)), (bestMove.substring(2, 4)), "rgb(0, 128, 0)"]] : undefined} />
                </div>
            </div>
        )
    }
}

export default AnalysisBoard;