import React from 'react';
import Nav from './components/Nav';
import './Home.css';
import Footer from './components/Footer';

function Home() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <section className="titleScreen">
                    <div className='title'>
                        <h1>SandalBot</h1>
                        <h1>Open-source chess engine</h1>
                        <h2>
                            An alpha-beta search engine written in C++ by Aleksander Gayko.
                        </h2>
                    </div>
                    <img src="pawn.png" height="200px"></img>
                </section>
                <div className="horizontalLine"></div>
                <section className="homeDetails">
                    Download, documentation, and more.
                    <div>
                        <button>Download</button>
                        <a href="https://github.com/DirtySandals/SandalBotV2"><button>View on GitHub</button></a>
                        <a href="https://lichess.org/@/SandalBot"><button>View on Lichess</button></a>
                    </div>

                </section>
                
            </main>
            <Footer />
        </div>
    )
}

export default Home;