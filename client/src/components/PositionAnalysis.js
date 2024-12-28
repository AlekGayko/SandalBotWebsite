import React from "react";

const PositionAnalysis = (props) => {
    if (!props) {
        return <div></div>
    }
    console.log(props);
    return (
        <div>
            <h1>Analysis</h1>
            <p> Depth: {props.analysis.depth}, 
                Seldepth: {props.analysis.depth},
                Score: {props.analysis.score},
                Nodes: {props.analysis.nodes},
                NPS: {props.analysis.nps},
                hashfull: {props.analysis.hashfull},
                time: {props.analysis.time},
                pv: {props.analysis.pv}
            </p>
        </div>
    )
}

export default PositionAnalysis;