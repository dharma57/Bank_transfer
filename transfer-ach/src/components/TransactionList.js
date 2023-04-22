import { useContext, useEffect, useState } from "react";
import TransactionTableRow from "./TransactionTableRow";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";

function TransactionList() {
    // Should Fetch Transaction data
    // Temp Data 
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            //call transactions;
           // update transactions
            const response_db = await axios.post('http://localhost:3001/api/transactions', {token: token});
            setTransactions(response_db.data.transactions)
            console.log(transactions)
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
    
        const intervalId = setInterval(() => {
          fetchData();
        }, 2 * 60 * 1000); // 2 minutes in milliseconds
    
        return () => {
          clearInterval(intervalId);
        };
    }, []);
    
    // logic will be added to either put + or - in front of the dollor amount 
    // depending on the direction of the transactions 
    return (
        <div style={styles.transactionContainer}>
            <h2 style={styles.header}>
                Transactions
            </h2>
            <div style={styles.tableContainer}>
            <table>
                    <tbody>
                        {transactions.length === 0 ? (
                        <tr>
                            <td colSpan="4"></td>
                        </tr>
                        ) : (
                        transactions.map((transaction, index) => (
                            <tr key={index}>
                            <TransactionTableRow
                                user={
                                    transaction.direction === 0
                                    ? transaction.destination_first_name
                                    : transaction.origin_first_name
                                }
                                amount={transaction.amount}
                                date={transaction.transferDate}
                                direction={transaction.direction}
                            />
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }

  const styles = {
    transactionContainer : {
      backgroundColor : '#1A1B1E',
      minHeight : '490px',
      minWidth : '300px',
      maxHeight : '490px',
      maxWidth : '300px',
      borderRadius : 10,
      display: 'flex',
      flexDirection : 'column',
      marginLeft: '15px'
    },
    header :{
        color: 'white', 
        paddingLeft:35, 
        margin : 0, 
        paddingTop:20
    },
    tableContainer:{
        overflowY:'auto', 
        display:'block',
        marginRight:0
    }
  }

  // Add Style Sheet here for Simplicity 
  
  export default TransactionList;
  