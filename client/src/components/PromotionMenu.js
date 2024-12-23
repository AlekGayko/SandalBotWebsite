import React from "react";
import './../Board.css'
import Square from "./Square";

const PromotionMenu = (props) => {
    const { color, select } = props;

    const selectQueen = () => {
        select('Q');
    }

    const selectRook = () => {
        select('R');
    }

    const selectBishop = () => {
        select('B');
    }

    const selectKnight = () => {
        select('N');
    }

    return (
        <div className="promotionMenu" style={{top: 0, left: 0}}>
            <Square piece="queen" color={color} index={0} select={selectQueen} />
            <Square piece="rook" color={color} index={0} select={selectRook} />
            <Square piece="bishop" color={color} index={0} select={selectBishop} />
            <Square piece="knight" color={color} index={0} select={selectKnight} />
        </div>
    )
}

export default PromotionMenu;