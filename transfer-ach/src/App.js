import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MFAPage from './components/MFAPage';
import HomePage from './components/HomePage';

function App() {
  console.log('Rendering Apps...');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/mfa" element={<MFAPage/>} />
        <Route path="/home" element={<HomePage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
