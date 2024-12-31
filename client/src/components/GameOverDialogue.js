import React from "react";

function GameOverDialogue(props) {
    if (!props.result) {
        return;
    }

    const { type, winningSide, losingSide, botWon } = props.result;
    
    const style = { color: botWon ? "red" : "green"};

    switch (type) {
        case "Checkmate":
            return <div className="endDialogue" style={style}>Checkmate &bull; {winningSide} is victorious</div>;
        case "TimeOut":
            return <div className="endDialogue" style={style}>{losingSide} time out &bull; {winningSide} is victorious</div>;
        case "Resignation":
            return <div className="endDialogue" style={style}>{losingSide} resigned &bull; {winningSide} is victorious</div>;
        case "Threefold":
            return <div className="endDialogue" style={style}>Stalemate</div>;
        case "Stalemate":
            return <div className="endDialogue" style={style}>{losingSide} time out &bull; {winningSide} is victorious</div>;
        case "InsufficientMaterial":
            return <div className="endDialogue" style={style}>Insufficient Material &bull; Draw</div>;
        case "FiftyMoveRule":
            return <div className="endDialogue" style={style}>Fifty moves without progress &bull; Draw</div>;
    }
}

export default GameOverDialogue;