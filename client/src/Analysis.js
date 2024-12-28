import React from 'react';
import Board from './components/Board';
import './Board.css'
import Nav from './components/Nav';
import Footer from './components/Footer';
import AnalysisBoard from './components/AnalysisBoard';

function Analysis() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <AnalysisBoard />
            </main>
            <Footer />
        </div>
    )
}

export default Analysis;