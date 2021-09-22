import React from 'react'
import FormTextFieldCSS from "./FormTextField.module.css"
const FormTextField = ({label,name, type, placeholder, handleChange, inputErr }) => {
    return (
        <div>
            <label>{label}</label>
            <input
                type= {type}
                name= {name}
                onChange={handleChange}
                placeholder="Username..."
            />
            <div className={FormTextFieldCSS.errMsgClass}> {inputErr} </div>
        </div>
    )
}

export default FormTextField
