
import React, { useState } from 'react';

function Button(props) {
    const [color, setColor] = useState('#509758');

    const backgroundColorStyle = {
        backgroundColor : color
    }

    const buttonStyle = {
        ...style.buttonStyle,
        ...backgroundColorStyle
    }

    const handleMouseDown = () => {
    // Add logout logic
        setColor('#91cf98')
    
    };

    const handleColorReset = () => {
        setColor('#509758')
    
    };

    return (
        <button 
            onMouseDown={handleMouseDown} 
            onMouseLeave={handleColorReset} 
            onMouseUp={handleColorReset} 
            onClick={props.onClick}
            type="submit" 
            style={{...buttonStyle, ...props.style}}
        >
            {props.title}
        </button>
    );
}

const style = {
    buttonStyle : {
        borderRadius: 10,
        borderWidth: 0,
        height: 40,
        fontSize : 17,
        width: '75%',
        color: 'white'
    }
}

export default Button;