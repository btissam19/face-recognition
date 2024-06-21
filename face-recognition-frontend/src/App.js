import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing';
import Instructions from './components/Instructions';
import Verification from './components/Verification';
import Confidality from './components/Confidality';
import ErrorPage from './components/ErrorPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/confidality" element={<Confidality />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
