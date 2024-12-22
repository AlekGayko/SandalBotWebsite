import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Play from './Play';
import About from './About';


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path = "/" Component={Home} />
        <Route path="/play" Component={Play} />
        <Route path="/about" Component={About} />
      </Routes>
    </Router>
  );
}

export default App;
