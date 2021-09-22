import React,  { useState, useEffect } from 'react'
import FormCSS from "./Form.module.css"
import TextField from "../components/FormTextField"
import axios from   "axios" 

const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const Form = () => {

    const [values, setValues] = useState({username: '', password: '', email: '' })
    const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})

    // handles input errors.
    const handleErrors = (name, value) => {
        // handle errors:
        if(name === "username")
        {
            inputErrors.usernameErr = 
                            (value.length < 3 && value.length>0)  ? "minimum of 3 characters required": "";
        }
        else if(name === "password")
        {
            inputErrors.passwordErr= (value.length < 6 && value.length>0) ? "minimum of 6 characters required": "";
        }
        else if(name === "email")
        {
            inputErrors.emailErr= (emailRegex.test(value) || value.length === 0) ? "":"invalid email";
        }

    }
    const handleChange = e => {
        const {name, value} = e.target;
        handleErrors(name, value);
        setValues({...values, [name]:value})
    }

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        const response = await axios
                                .post('/api/users/register',values)
                                .then( res => {
                                    console.log(res)
                                })
                                .catch( (err) => console.log("Error:", err ) );

    }
    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    
                    <label>Username</label>
                    <input
                        type= "text"
                        name="username"
                        onChange={handleChange}
                        placeholder="Username..."
                    />
                    {inputErrors.usernameErr}
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        placeholder= "Password..." 
                    />
                    {inputErrors.passwordErr}
                    <label>Email</label>
                    <input
                        type= "text"
                        name="email"
                        onChange={handleChange}
                        placeholder="Email..."
                    />
                    {inputErrors.emailErr}
                </div>
                <div>
                    <button onClick={handleSubmit}>Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
