
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionList from './TransactionList';
import AccountBalance from './AccountBalance';
import SendMoneyForm from './SendMoneyForm';
import Header from './Header';
import { AuthContext } from '../context/AuthProvider';

function HomePage() {
  const navigate = useNavigate();
  const { handleLogout } = useContext(AuthContext);
  
  return (
    <div style={styles.homePageContainer}>
        <Header 
            buttonTitle='logout' 
            buttonShow={true} 
            onClick={handleLogout}
        />
        <div style ={styles.paneContainer}>
            <div >
                <AccountBalance />
                <SendMoneyForm style={{marginTop:15}}/>
            </div>
            <TransactionList />
        </div>
    </div>
  );
}

const styles = {
  homePageContainer:{
    backgroundColor: 'black',
    minHeight: '100vh',
    minWidth: '100vh',
    display : 'flex',
    flexDirection:'column',
    alignItems:'center'
  },
  paneContainer:{
    flexDirection:'row', 
    display: 'flex', 
    height: '100vh', 
    width: '100vh', 
    justifyContent:'center', 
    alignItems:'center'
  }
}

export default HomePage;
