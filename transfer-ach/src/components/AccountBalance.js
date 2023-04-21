import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AccountBalance() {
    // Fetch account balance data
    const [balance, setBalance] = useState(0);
    const {token} = useContext(AuthContext);
    const navigate = useNavigate();
    // Replace with the actual balance fetched from an API or another source
    // Will need to sign up for notification of changes as well that will 
    // trigger the change of the account balance

    useEffect(() => {
      const fetchData = async () => {
        try {
          //call transactions;
          // update transactions

          const response_db = await axios.post('http://localhost:3001/api/balance', {token: token});
          setBalance(response_db.data.amount[0].balance)
        } catch (error) {
          navigate('/');
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
  
      const intervalId = setInterval(() => {
        fetchData();
      }, 2 * 60 * 100); // 2 minutes in milliseconds
  
      return () => {
        clearInterval(intervalId);
      };
  }, []);
  
    return (
        <div style={styles.balanceContainer}>
            <p style={styles.headingStyle}>
                Cash Balance
            </p>
            <h1 style={styles.balanceStyle}>
                ${balance}
            </h1>
        </div>
    );
  }

  // StyleSheet 
  const styles = {
    balanceContainer : {
      minHeight: '125px',
      minWidth: '300px',
      maxHeight : '125px',
      maxWidth : '300px',
      borderRadius: 10,
      backgroundColor: '#1A1B1E'
    },
    headingStyle :
    {
      marginTop:0,
      color : 'white', 
      paddingLeft: 35, 
      paddingTop:25
    },
    balanceStyle :{
      color : 'white', 
      paddingLeft: 35, 
      paddingBottom:25
    }
  }
  export default AccountBalance;