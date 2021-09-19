import React from 'react'
import ButtonCSS from "./Button.module.css"


const Button = ({name, onClick}) => {
    const handleOnClick=  () =>
    {
        onClick();
        console.log({name});
    }
    return (
        <div className={ButtonCSS.buttonClass} onClick={handleOnClick}>
            {name}
        </div>
    )
}

export default Button
