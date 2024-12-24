import React from "react";

function Nav() {
    return (
        <nav id="navbar">
            <div className="navLogo">
                <img src="pawn.ico" height="30rem"></img>
                <h4>SandalBot Chess</h4>
            </div>
            <a href="/">Home</a>
            <a href="/play">Play</a>
            <a href="/analysis">Analysis</a>
            <a href="/watch">Watch</a>
            <a href="/about">About</a>
        </nav>
    )
}

export default Nav;