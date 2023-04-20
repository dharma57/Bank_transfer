import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import InputForm from './InputForm';
import Button from './Button';
import Header from './Header';
import axios from 'axios';

function MFAPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  
  const handleMFA = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    axios.post('http://localhost:3001/api/mfa', { code }, config)
      .then(response => {
        navigate('/home');
      })
      .catch(error => {
        console.log(error);
        alert('Invalid MFA code');
      });
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  return (
    <div style={styles.MFAPageContainer}>
        <Header buttonTitle='cancel' buttonShow={true}/>
        <div style={styles.formContainer}>
            <form 
            onSubmit={handleMFA} 
            style={styles.MFAPane}>
            <h1 style={styles.MFAHeader}>
                Authentication
            </h1>
            <img 
                src={`${process.env.PUBLIC_URL}/lock-and-password.png`} 
                alt="Example" 
                style={styles.imageStyle}
            />
            <p style={styles.statement}>
                Please enter the 5 digit code that was sent to the email address associated with the account
            </p>
            <InputForm 
                type="text" 
                maxLength="5" 
                placeholder="5-digit code" 
                onChange={handleCodeChange}
            />
            <Button 
                type="submit"
                title = 'Continue' 
                style = {{marginTop: 45}}
            />
            </form>
        </div>
    </div>
  );
}

// Add Style Sheet here for Simplicity 
const styles = {
  MFAPageContainer : {
    backgroundColor: 'black',
    minHeight: '100vh',
    minWidth: '100vh',
    display : 'flex',
    flexDirection:'column',
    alignItems : 'center',
  },
  MFAPane : {
    backgroundColor : '#1A1B1E',
    height : '400px',
    width : '400px',
    borderRadius : 10,
    display: 'flex',
    flexDirection : 'column',
    padding: '15px',
    alignItems: 'center'
  },
  MFAHeader : {
    color: 'white',
    marginBottom: -3
  },
  statement : {
    width : '75%',
    textAlign : 'center',
    color: 'white',
    fontSize: 13,
    marginBottom:30,
    marginTop: -5
  },
  imageStyle : {
    height: '30%'
  },
  formContainer : {
    width:'100%',
    height: '100vh',
    display:'flex', 
    justifyContent:'center', 
    justifySelf:'center', 
    alignItems:'center'
  }
}

export default MFAPage;
