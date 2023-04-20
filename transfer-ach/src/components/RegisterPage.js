import React, { useState } from 'react';
import Button from './Button';
import InputForm from './InputForm';
import Header from './Header';
import axios from 'axios';
import { isValidEmail, isPasswordLongEnough, hasPasswordRequiredChars } from '../utils/inputValidation';

function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
    });

    const handleChange = (e) => {

        setFormData({ ...formData, [e.target.name]: e.target.value });

    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (isPasswordLongEnough(formData.password) && 
            hasPasswordRequiredChars(formData.password) &&
            isValidEmail(formData.email)){
            try {
                const response = await axios.post('http://localhost:3001/api/register', formData);
                console.log(response);
                alert('User registered successfully');
            } catch (error) {
                console.error(error);
                alert(`Error registering user: ${error.message}`);
            }
        }
        else {
            alert("Email and or password are not valid");
        } 
    };

    return (
        <div style={styles.loginPageContainer}>
            <Header/>
            <div style={styles.formContainer}>
                <form onSubmit={handleRegister} style={styles.loginPaneContainer}>
                    <h1 style={styles.loginHeader}>Register</h1>
                    <InputForm
                        style={styles.formPadding}
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        onChangeHandler={handleChange}
                    />
                    <InputForm
                        style={styles.formPadding}
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        onChangeHandler={handleChange}
                    />
                    <InputForm
                        style={styles.formPadding}
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChangeHandler={handleChange}
                    />
                    <InputForm
                        style={styles.formPadding}
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChangeHandler={handleChange}
                    />
                    <InputForm
                        style={styles.formPadding}
                        type="text"
                        name="phone_number"
                        placeholder="Phone Number"
                        onChangeHandler={handleChange}
                    />
                    <InputForm
                        style={styles.formPadding}
                        type="text"
                        name="address"
                        placeholder="Home Address"
                        onChangeHandler={handleChange}
                    />
                    <Button style={styles.buttonPadding} title="Register"/>
                    <p style={styles.legalStatement}>
                        By signing up, you agree to our
                        <br/>
                        <strong>Terms and Conditions</strong>
                        </p>
                </form>
            </div>
        </div>
    );
}

const styles = {
    loginPageContainer : {
        backgroundColor: 'black',
        minHeight: '100vh',
        minWidth: '100vh',
        display : 'flex',
        alignItems : 'center',
        flexDirection:'column'
    },
    loginPaneContainer:{
        backgroundColor : '#1A1B1E',
        height : '600px',
        width : '400px',
        borderRadius : 10,
        display: 'flex',
        flexDirection : 'column',
        padding: '15px',
        alignItems: 'center',
        justifySelf:'center'
    },
    loginHeader : {
        color: 'white'
    },
    formPadding : {
        marginTop : 25
    },
    buttonPadding : {
        marginTop: 30,
    },
    legalStatement : {
        width : '75%',
        textAlign : 'center',
        color: 'white',
        fontSize: 13
    },
    formContainer : {
        width:'100%',
        height: '100vh',
        display:'flex',
        justifyContent:'center',
        justifySelf:'center',
        alignItems:'center'
    }
};

export default RegisterPage;
