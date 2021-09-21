import React,  { useState } from 'react'
import FormCSS from "./Form.module.css"

const Form = () => {

    const [values, setValues] = useState({username: '', password: '', email: '' })

    const handleChange = e => {
        const {name, value} = e.target;
        // if (name === "Username")
        // {
            // console.log(value)
            // console.log(values.username)
            // setValues( currentValues =>{
            //     console.log(value)
            //     return { ...currentValues, username: value}
            // })
            setValues({...values, username: value})
        // }
        console.log(values.username)
    }

    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    <label>Username</label>
                    <input
                        type= "text"
                        name="Username"
                        onChange={handleChange}
                        placeholder="Username..."
                    />
                    <label>Password</label>
                    <input/>
                    <label>Email</label>
                    <input/>
                </div>
                <div>
                    <button>Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
