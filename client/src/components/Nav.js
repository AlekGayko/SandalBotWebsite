import React from "react";

function Nav() {
    return (
        <nav id="navbar">
            <a href="/">
                <img src="pawn.ico" height="30rem"></img>
                SandalBot Chess
            </a>
            <a href="/play">Play</a>
            <a href="/analysis">Analysis</a>
            <a href="/watch">Watch</a>
            <a href="/about">About</a>
        </nav>
    )
}

export default Nav;