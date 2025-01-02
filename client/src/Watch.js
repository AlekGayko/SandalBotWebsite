import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import LichessGames from './components/LichessGames';
import "./Watch.css";

function Watch() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main id="watch">
                <h2>Current Games</h2>
                <LichessGames finished={true} maxGames={1}/>
                <div className="horizontalLine"></div>
                <h2>Most Recent Games</h2>
                <LichessGames finished={true} maxGames={9} />
            </main>
            <Footer />
        </div>
    )
}

export default Watch;