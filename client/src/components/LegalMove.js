import React from "react";
import './../Board.css'

const LegalMove = (props) => {
    const { file, rank, makeMove } = props;

    let colDist = file.charCodeAt(0) - 'a'.charCodeAt(0);
    let rowDist = rank - 1;

    colDist = colDist * 12.5;
    rowDist = rowDist * 12.5;

    const callMakeMove = () => {
        makeMove(file + rank)
    }

    return (
        <div className="overlaySquare" onClick={callMakeMove} style={{top: `${rowDist}%`, left: `${colDist}%`}}>
            <div className="circle"></div>
        </div>
    )
}

export default LegalMove;