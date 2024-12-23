import React from 'react';
import Nav from './components/Nav';
import './Home.css';
import Footer from './components/Footer';

function Home() {
    return (
        <div className="homeWrapper">
            <Nav />
            <main>
                <section className="titleScreen">
                    <div>
                        <h1>SandalBot Chess Engine</h1>
                        <p>
                            An alpha-beta search engine written in C++
                        </p>
                    </div>
                    <div className="playButton">
                        <a href="/play">Play SandalBot</a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default Home;