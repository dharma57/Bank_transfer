function AccountBalance() {
    // Fetch account balance data
    const balance = 800.37; 
    // Replace with the actual balance fetched from an API or another source
    // Will need to sign up for notification of changes as well that will 
    // trigger the change of the account balance 
  
    return (
        <div style={styles.balanceContainer}>
            <p style={styles.headingStyle}>
                Cash Balance
            </p>
            <h1 style={styles.balanceStyle}>
                ${balance.toFixed(2)}
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