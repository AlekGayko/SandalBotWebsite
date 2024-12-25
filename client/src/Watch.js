import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import LichessGames from './components/LichessGames';
import "./Watch.css";

function Watch() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <h1>Watch</h1>
                <div className="horizontalLine"></div>
                <LichessGames />
            </main>
            <Footer />
        </div>
    )
}

export default Watch;