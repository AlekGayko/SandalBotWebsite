import React, { Component } from "react";
import axios from "axios";
import pgnParser from 'pgn-parser';

class LichessGames extends Component {
    constructor(props) {
        super(props);

        this.state = {
            maxGames: 9,
            currentUrls: null,
            oldGameUrls: null
        }
    }

    parsePGNs(pgns) {
        let urls = [];

        let data = pgns;
        let lines = data.trim().split("\n");
        console.log(pgns);
        for (let line of lines) {
            if (line.length === 0) {
                continue;
            }
            const info = line.split(" ");

            if (info[0] === "[Site") {
                const siteUrl = info[1].slice(1, -2);
                const urlObj = new URL(siteUrl);
                const embedUrl = urlObj.origin + "/embed/game" + urlObj.pathname;
                urls.push(embedUrl);
            }
        }

        return urls;
    }

    getCurrentGames() {
        axios.get(`https://lichess.org/api/games/user/SandalBot?max=${this.state.maxGames}&moves=false&finished=false`)
        .then(response => {
            let urls = this.parsePGNs(response.data);
            if (urls.length > 0) {
                this.setState({
                    currentUrls: urls
                })
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    getOldGames() {
        axios.get(`https://lichess.org/api/games/user/SandalBot?max=${this.state.maxGames}&moves=false&finished=true`)
        .then(response => {
            let urls = this.parsePGNs(response.data);

            if (urls.length > 0) {
                this.setState({
                    oldGameUrls: urls
                })
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    componentDidMount() {
        this.getCurrentGames();
        this.getOldGames();
    }

    render() {
        return (
            <div className="gamesContainer">
                <h2>Current Games</h2>
                <div className="games">
                    {
                        this.state.currentUrls ?
                        this.state.currentUrls.map((gameUrl, key) => <iframe src={gameUrl + "?them=autho&bg=auto#5"} frameBorder={0} key={key} scrolling="no"></iframe>)
                        : 'No Current Games'
                    }
                </div>
                <div className="horizontalLine"></div>
                <h2>Most Recent Games</h2>
                <div className="games">
                    {
                        this.state.oldGameUrls ?
                        this.state.oldGameUrls.map((gameUrl, key) => <iframe src={gameUrl + "?them=autho"} frameBorder={0} key={key} scrolling="no"></iframe>)
                        : 'Loading...'
                    }
                </div>
            </div>
        )
    }
}

export default LichessGames;