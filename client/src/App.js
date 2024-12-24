import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import './SandalBot.css';
import Home from './Home';
import Play from './Play';
import Watch from './Watch';
import Analysis from './Analysis';
import About from './About';


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path = "/" Component={Home} />
        <Route path="/play" Component={Play} />
        <Route path="/analysis" Component={Analysis} />
        <Route path="/watch" Component={Watch} />
        <Route path="/about" Component={About} />
      </Routes>
    </Router>
  );
}

export default App;
