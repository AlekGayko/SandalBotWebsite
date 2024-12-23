import React from 'react';
import Board from './components/Board';
import './Board.css'
import Nav from './components/Nav';
import Footer from './components/Footer';

function Play() {
    return (
        <React.Fragment>
            <Nav />
            <div id="play">
                <Board />
            </div>
            <Footer />
        </React.Fragment>
    )
}

export default Play;