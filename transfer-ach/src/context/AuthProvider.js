import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [email,setEmail] = useState('')
  const navigate = useNavigate(); 

  const handleEmailChange = (e) => {
    console.log(e.target.value)
    setEmail(e.target.value)
  }

  const handleTokenChange = (token) => {
    setToken(token);
  }

  const handleLogout = () => {
    setToken(null);
    setEmail('')
    navigate('/');
  }

  return (
    <AuthContext.Provider value={{ token, email,handleEmailChange, handleTokenChange, handleLogout}}>
      {children}
    </AuthContext.Provider>
  );
};
