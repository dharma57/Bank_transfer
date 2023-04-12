


function InputForm(props){

    return (
        <input 
            type= {props.type}
            placeholder = {props.placeholder}
            onChange={props.onChangeHandler} 
            name = {props.name}
            style = {{...styles.formStyle, ...props.style}}
        />
    )
}

const styles = {
    formStyle : {
        borderRadius: 10,
        borderWidth: 0,
        height: 40,
        fontSize : 13,
        width: '72%',
        color: 'white',
        paddingLeft: 10,
        backgroundColor: '#282828'
    }
}

export default InputForm;