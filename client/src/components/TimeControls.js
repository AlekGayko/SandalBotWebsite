import React, { Component } from "react";

class TimeControls extends Component {
    constructor(props) {
        super(props);
        this.times = Array.from({length : 10}, (v, i) => i + 1);
        this.increments = [0].concat(Array.from({length : 10}, (v, i) => i + 1));

        this.state = {
            time: this.times.findIndex(element => element == 5),
            increment: this.increments.findIndex(element => element == 3),
            side: null,
            submitFunc: props.submit
        };
    }

    changeHandler = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }

    sideHandler = (event) => {
        const id = event.target.id ? event.target.id : "white-black";
        this.setState({ side: id });
    }

    submit = (event) => {
        event.preventDefault();
        const time = this.times[this.state.time];
        const increment = this.increments[this.state.increment];
        const { side } = this.state;

        this.state.submitFunc({ time, increment, side });
    }

    render() {
        const { time, increment, side } = this.state;

        return (
            <form onSubmit={this.submit}>
                <div>
                    <label htmlFor="time">Minutes per side: {this.times[time]}</label>
                    <input type="range" name="time" value={time} min={0} max={this.times.length - 1} onChange={this.changeHandler} />
                </div>
                <div>
                    <label htmlFor="increment">Increment in seconds: {this.increments[increment]}</label>
                    <input type="range" name="increment" value={increment} min={0} max={this.increments.length - 1} onChange={this.changeHandler} />
                </div>
                <div className="sideSelect">
                    <button type="submit" onClick={this.sideHandler}><i className="fa-solid fa-chess-king blackKing" id="black"></i></button>
                    <button type="submit" onClick={this.sideHandler}>
                        <i className="fa-solid fa-chess-king blackKing"></i>
                        /
                        <i className="fa-regular fa-chess-king whiteKing"></i>
                    </button>
                    <button type="submit" onClick={this.sideHandler}><i className="fa-regular fa-chess-king whiteKing" id="white"></i></button>
                </div>
            </form>
        )
    }
}

export default TimeControls;