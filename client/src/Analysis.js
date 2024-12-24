import React from 'react';
import Board from './components/Board';
import './Board.css'
import Nav from './components/Nav';
import Footer from './components/Footer';

function Analysis() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <Board />
            </main>
            <Footer />
        </div>
    )
}

export default Analysis;