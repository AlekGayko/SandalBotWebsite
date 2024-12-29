import React from 'react';
import Nav from './components/Nav';
import './Home.css';
import Footer from './components/Footer';
import axios from 'axios';

let downloadBinary = async () => {
    try {
        const response = await axios({
            url: '/api/download-binary',
            method: 'GET',
            responseType: 'blob'
        })
        
        // Create a URL for the file blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'SandalBotV2.exe');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.log(err);
    }
}

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
                    <img src="pawn.ico" height="200px" alt="Pawn Logo"></img>
                </section>
                <div className="horizontalLine"></div>
                <section className="homeDetails">
                    Download, documentation, and more.
                    <div>
                        <button onClick={downloadBinary}>Download</button>
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