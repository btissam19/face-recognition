import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import Instructions from './Instructions';
import Verification from './Verification';
import Confidality from './Confidality';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/confidality" element={<Confidality />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
