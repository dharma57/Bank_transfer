import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

function TransactionTableRow(props) {
  const sign = props.direction === 0 ? '- ' : '+ ';
  let circleStyle = {}

    const letterColorMap = {
        A: '#FF5733',
        B: '#FFC300',
        C: '#DAF7A6',
        D: '#900C3F',
        E: '#581845',
        F: '#C70039',
        G: '#FFD700',
        H: '#00FF00',
        I: '#FF00FF',
        J: '#FFA07A',
        K: '#FF6347',
        L: '#ADFF2F',
        M: '#7CFC00',
        N: '#FF4500',
        O: '#8A2BE2',
        P: '#7B68EE',
        Q: '#6A5ACD',
        R: '#DC143C',
        S: '#00BFFF',
        T: '#F08080',
        U: '#EE82EE',
        V: '#FF69B4',
        W: '#00FA9A',
        X: '#3CB371',
        Y: '#7FFF00',
        Z: '#32CD32',
    };
      
    try {
      const circleColor = letterColorMap[props.user.charAt(0).toUpperCase()]
      
      circleStyle = {
        backgroundColor: circleColor
      }

    } catch (error) {
      circleStyle = {
        backgroundColor: '#32CD32'
      }
    }

    return (
        <td style={styles.tableContainer}>
            <div style={styles.nameContainer}>
                <div style={{...styles.circle,...circleStyle}}>
                    <p>
                        {props.user.charAt(0).toUpperCase()}
                    </p>
                </div>
                <div style= {{marginLeft:'13px'}}>
                    <p style={styles.username}>
                        {props.user}
                    </p>
                    <p style={styles.date}>
                        {props.date}
                    </p>
                </div>
            </div>
            <div style={styles.amountContainer}>
                <p style={styles.amount}>
                    {`${sign}$${props.amount}`}
                </p>
            </div>
        </td>
  );
}

// Add Style Sheet here for Simplicity 
const styles = {
  tableContainer:{
    height : '80px',
    width : '300px',
    display : 'flex',
    flexDirection : 'row',
    alignItems: 'center'
  },
  nameContainer :{
    display:'flex',
    flexDirection:'row', 
    alignItems:'center', 
    marginLeft:35
  },
  circle : {
    width:'47px', 
    height: '47px',
    borderRadius: '50%', 
    display:'flex',
    alignItems : 'center',
    justifyContent:'center'
  },
  username : {
    color: 'white', 
    whiteSpace:'nowrap', 
    overflow:'hidden', 
    textOverflow:'ellipsis', 
    width: '10ch', 
    fontWeight:'bold', 
    fontSize:11, 
    paddingTop:10
  },
  date : {
    color: '#737370',
    whiteSpace:'nowrap', 
    overflow:'hidden', 
    textOverflow:'ellipsis', 
    width: '10ch', 
    fontWeight:'normal', 
    fontSize:11, 
    paddingBottom:10
  },
  amountContainer: {
    display:'flex', 
    flexDirection:'row-reverse', 
    flex:2, 
    marginRight:35
  },
  amount : {
    color:'white', 
    fontWeight:'bold'
  }
  
}
export default TransactionTableRow;
