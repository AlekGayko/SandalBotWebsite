import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';

function About() {
    return (
        <React.Fragment>
            <Nav />
            <div>
                <h1>About</h1>
                <p>
                    This is SandalBot, a bot written in C++
                </p>
            </div>
            <Footer />
        </React.Fragment>
    )
}

export default About;