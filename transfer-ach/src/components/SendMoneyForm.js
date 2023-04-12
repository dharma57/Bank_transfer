import React, { useState } from 'react';
import Button from './Button';
import InputForm from './InputForm';

function SendMoneyForm(props) {

    const [amount, setAmount] = useState('');
    const [receiverUsername, setReceiverUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add logic to send money, such as making an API call
        // We should verify that the amount being sent is not more 
        // than what is in the account. 

        const amount = e.target.amount.value;
        const receiverUsername = e.target.receiverUsername.value;

        console.log("Amount:", amount);
        console.log("Receiver Username:", receiverUsername);

        // Clear the form fields after successful submission
        e.target.reset();
    };

    // Update the state variable  
    const handleAmountChange = (e) => {
        // Check if value is good. Can pass prop total and check here
        setAmount(e.target.value);
    };

    const handleReceiverUsernameChange = (e) => {
        // 
        setReceiverUsername(e.target.value);
    };

    return (
        <div style = {{...styles.sendMoneyContainer, ...props.style}}>
            <h2 style={styles.title}>
                Send Money
            </h2>
            <form 
                onSubmit={handleSubmit} 
                style = {styles.form}>
                <InputForm 
                    type="number" 
                    min="0" 
                    name="amount" 
                    onChange={handleAmountChange} 
                    placeholder="Amount" 
                    required 
                    style = {{marginTop: 15}}
                />
                <InputForm 
                    type="text" 
                    name="receiverUsername" 
                    onChange={handleReceiverUsernameChange} 
                    placeholder="Receiver's Username" 
                    required 
                    style={{marginTop:20}}
                />
                <p style={styles.transferNote}>
                    Be sure you are sending funds to the correct person. Transferred funds can not be reversed
                </p>
                <Button 
                    type="submit" 
                    title = 'Transfer'
                    style={{marginTop: 20}}
                /> 
            </form>
        </div>
    );
}

const styles = {
    sendMoneyContainer : {
        backgroundColor : '#1A1B1E',
        minHeight : '350px',
        minWidth : '300px',
        maxHeight : '350px',
        maxWidth : '300px',
        borderRadius : 10,
        display: 'flex',
        flexDirection : 'column',
    },
    title : {
        color:'white', 
        paddingLeft: 35
    },
    form :{
        width: '100%', 
        alignItems: 'center', 
        display: 'flex', 
        flexDirection: 'column'
    },
    transferNote: {
        color:'white', 
        fontSize: 10, 
        textAlign: 'justify',
        marginTop :15, 
        paddingLeft:40, paddingRight: 40
    }
}
  
// Add Style Sheet here for Simplicity 
export default SendMoneyForm;
  