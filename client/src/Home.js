import React, { Component } from 'react';
import Nav from './components/Nav';
import './Home.css';
import Footer from './components/Footer';
import axios from 'axios';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bulletRating: "",
            blitzRating: "",
            rapidRating: ""
        }
    }
    async componentDidMount() {
        try {
            let response = await axios.get("https://lichess.org/api/user/SandalBot");
            console.log(response);
            this.setState({
                bulletRating: response.data.perfs.bullet.rating,
                blitzRating: response.data.perfs.blitz.rating,
                rapidRating: response.data.perfs.rapid.rating 
            })
        } catch (error) {

        }
    }

    downloadBinary = async () => {
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

    render() {
        const { bulletRating, blitzRating, rapidRating } = this.state;
        return (
            <div className="pageWrapper">
                <Nav />
                <main>
                    <section id="elo">
                        <div><h3>Bullet Rating: </h3><h3>{bulletRating}</h3></div>
                        <div><h3>Blitz Rating: </h3><h3>{blitzRating}</h3></div>
                        <div><h3>Rapid Rating: </h3><h3>{rapidRating}</h3></div>
                    </section>
                    <div className="horizontalLine"></div>
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
                            <button onClick={this.downloadBinary}>Download</button>
                            <a href="https://github.com/DirtySandals/SandalBotV2"><button>View on GitHub</button></a>
                            <a href="https://lichess.org/@/SandalBot"><button>View on Lichess</button></a>
                        </div>
                    </section>
                </main>
                <Footer /> 
            </div>
        )
    }
}

export default Home;