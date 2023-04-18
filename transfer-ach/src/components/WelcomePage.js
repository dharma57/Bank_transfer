import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div style={styles.welcomePageContainer}>
      <h1 style={styles.welcomeHeader}>Welcome to Our Banking App</h1>
      <div style={styles.buttonsContainer}>
        <Link to="/login" style={styles.buttonPadding}>
          <button style={styles.loginButton}>Log In</button>
        </Link>
        <Link to="/register" style={styles.buttonPadding}>
          <button style={styles.registerButton}>Register</button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  welcomePageContainer: {
    backgroundColor: 'black',
    minHeight: '100vh',
    minWidth: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeHeader: {
    color: 'white',
    marginBottom: 50,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonPadding: {
    margin: 10,
  },
  loginButton: {
    backgroundColor: '#1A1B1E',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: '10px 30px',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  loginButtonHover: {
    backgroundColor: '#333',
  },
  registerButton: {
    backgroundColor: 'white',
    color: 'black',
    border: 'none',
    borderRadius: 5,
    padding: '10px 30px',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  registerButtonHover: {
    backgroundColor: '#F0F0F0',
  },
};




export default WelcomePage;
