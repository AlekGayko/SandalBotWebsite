import React, { Component } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import "./Play.css";
import TimeControls from './components/TimeControls';
import PlayBoard from './components/PlayBoard';

class Play extends Component {
    constructor(props) {
        super(props)

        this.state = {
            settingsConfirmed: false,
            firstMove: null
        }
    }

    submit = (inputs) => {
        console.log(inputs);
        let firstMove = null;
        if (inputs.side === "white-black") {
            firstMove = Math.random() < 0.5 ? "white" : "black";
        } else {
            firstMove = inputs.side;
        }

        this.setState({
            settingsConfirmed: true,
            firstMove: firstMove
        });
    }

    back = () => {
        this.setState({
            settingsConfirmed: false
        });
    }

    render () {
        return (
            <div className="pageWrapper">
                <Nav />
                <main>
                    <h1>Play SandalBot</h1>
                    <div className="horizontalLine"></div>
                    {
                        this.state.settingsConfirmed ? (
                            <PlayBoard firstMove={this.state.firstMove} back={this.back} />
                        ) : (
                            <TimeControls submit={this.submit} />
                        )
                    }
                    
                </main>
                <Footer />
            </div>
        )
    }
}

export default Play;