import React from 'react'

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
            {inputErr}
        </div>
    )
}

export default FormTextField
