import { useEffect } from "react";
import TransactionTableRow from "./TransactionTableRow";

function TransactionList() {
    // Should Fetch Transaction data
    // Temp Data 
    const transactions = [
        {
            otherUser: 'ZachArm',
            amount: 200,
            direction: 0,
            transferDate : '01/11/1994'
        },
        {
            otherUser: 'natasha',
            amount: 765.06,
            direction: 1,
            transferDate : '01/11/1994'
        },
        {
            otherUser: 'jean',
            amount: 765.06,
            direction: 1,
            transferDate : '01/11/1994'
        },
        {
            otherUser: 'stella',
            amount: 765.06,
            direction: 1,
            transferDate : '01/11/1994'
        },
        {
            otherUser: 'mary',
            amount: 765.06,
            direction: 1,
            transferDate : '01/11/1994'
        },
        {
            otherUser: 'william',
            amount: 765.06,
            direction: 1,
            transferDate : '01/11/1994'
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
          try {
            //call transactions;
           // update transactions
            console.log("trying to fetch transaction")
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
                <table >
                    <tbody>
                        {transactions.map((transaction, index) => (
                        <tr key={index}>
                            <TransactionTableRow 
                                user={transaction.otherUser} 
                                amount={transaction.amount} 
                                date={transaction.transferDate}
                            />
                        </tr>
                        ))}
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
  