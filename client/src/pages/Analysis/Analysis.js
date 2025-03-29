import React from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import AnalysisBoard from '../../components/AnalysisBoard';
import "./Analysis.css";

function Analysis() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main id="analysis">
                <h1>Analysis Board</h1>
                <div className="horizontalLine"></div>
                <AnalysisBoard />
            </main>
            <Footer />
        </div>
    )
}

export default Analysis;