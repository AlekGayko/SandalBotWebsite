import React, { Component } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

class LichessGames extends Component {
    constructor(props) {
        super(props);

        this.state = {
            maxGames: props.maxGames,
            urls: null,
            finished: props.finished
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

    getGames() {
        axios.get(`https://lichess.org/api/games/user/SandalBot?max=${this.state.maxGames}&moves=false&finished=${this.state.finished}`)
        .then(response => {
            let urls = this.parsePGNs(response.data);
            this.setState({
                urls: urls
            })
        })
        .catch(error => {
            console.log(error);
        })
    }

    componentDidMount() {
        this.getGames(); 
    }

    render() {
        const { urls } = this.state;

        const settings = {
            dots: true,
            infinite: false,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            responsive: [
                {
                  breakpoint: 1400,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: false
                  }
                },
                {
                  breakpoint: 1000,
                  settings: {
                    className: "center",
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 2,
                    dots: false
                  }
                }
              ]
          };
        
        return (
            <div className="games">
                {
                    urls ? (
                        urls.length ? (
                            <Slider {...settings}>
                                {
                                    urls.map((gameUrl, key) => 
                                        <iframe 
                                            className="game"
                                            src={gameUrl + "?them=autho"} 
                                            frameBorder={0} 
                                            key={key} 
                                            scrolling="no" 
                                            title="Lichess Game"
                                        />
                                    )
                                }
                            </Slider>
                        ) : (
                            <p>No Games Found</p>
                        )
                    ) : (
                        <div className="loader"></div>
                    )
                }
            </div>
        )
    }
}

export default LichessGames;