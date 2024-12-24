import React from 'react';
import Board from './components/Board';
import './Board.css'
import Nav from './components/Nav';
import Footer from './components/Footer';

function Watch() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <h1>Watch</h1>
            </main>
            <Footer />
        </div>
    )
}

export default Watch;