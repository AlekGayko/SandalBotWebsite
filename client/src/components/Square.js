import React from "react";

const pieceToChar = (piece) => {
    switch (piece) {
        case 'rook':
            return 'r';
        case 'knight':
            return 'n';
        case 'bishop':
            return 'b';
        case 'queen':
            return 'q';
        case 'king':
            return 'k';
        case 'pawn':
            return 'p';
        default:
            return null;
    }
}

const colorToChar = (color) => {
    switch (color) {
        case 'white':
            return 'l';
        case 'black':
            return 'd';
        default:
            return null;
    }
}

const Square = (props) => {
    let { piece, color, index, select } = props;
    piece = pieceToChar(piece);
    color = colorToChar(color);
    if (piece === null || color === null) {
        return;
    }

    const imgSrc = 'pieces/Chess_' + piece + color + 't60.png'

    const handleClick = () => {
        select(index);
    }

    return (
        <div onClick={handleClick}>
            <img src={imgSrc} alt="Piece"></img>
        </div>
    )
}

export default Square;