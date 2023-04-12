import Button from './Button';

function Header(props){
    
    return (
        <div style={styles.headerContainer}>
            <div style = {styles.imageContainer}>
                <img 
                    src={`${process.env.PUBLIC_URL}/myIcon.svg`} 
                    alt="My Icon" 
                    style ={{height: '30px'}}
                />
            </div>  
            <div style = {styles.buttonContainer}>
                {
                    props.buttonShow ? (
                        <Button 
                            title={props.buttonTitle}
                            style={styles.buttonStyle} 
                            onClick={props.onClick}
                        />
                    ) : (
                        <></>
                    )
                }
            </div>
        </div>
    )
}

const styles = {
    headerContainer : {
        width:'100%',
        backgroundColor : '#1A1B1E', 
        height: '50px', 
        alignItems:'center', 
        display:'flex'
    },
    buttonContainer:{
        flexDirection:'row-reverse',
        display: 'flex',
        width:'85%', 
        paddingRight:'35px'
    },
    imageContainer:{
        width:'15%', 
        paddingLeft:'35px'
    },
    buttonStyle :{
    width: '100px', 
    height: 30, 
    backgroundColor: '#7762F6'
    },
}

export default Header;