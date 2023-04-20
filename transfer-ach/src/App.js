import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MFAPage from './components/MFAPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage'
import WelcomePage from './components/WelcomePage';

function App() {
  console.log('Rendering Apps...');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mfa" element={<MFAPage/>} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/login" element={<LoginPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
