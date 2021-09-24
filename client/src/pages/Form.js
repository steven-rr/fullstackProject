import React,  { useState, useEffect } from 'react'
import FormCSS from "./Form.module.css"
import TextField from "../components/FormTextField"
import axios from   "axios" 

const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const Form = () => {
    const [rerender, setRerender] = useState(false)
    const [values, setValues] = useState({username: '', password: '', email: '' })
    const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true, submitPWInvalid: true, submitEmailInvalid: true, submitInvalid: true})
    useEffect( () => {
        setRerender(!rerender)
    }, [values.usernameErr])
    // handles input errors.
    const handleErrors = (name, value) => {
        // handle errors:
        if(name === "username")
        {
            inputErrors.usernameErr = 
                            (value.length < 3)  ? "minimum of 3 characters required": "";
            invalidFlags.submitUsernameInvalid = (inputErrors.usernameErr === "") ? false: true;
        }
        else if(name === "password")
        {
            inputErrors.passwordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
            invalidFlags.submitPWInvalid = (inputErrors.passwordErr === "") ? false: true;
        }
        else if(name === "email")
        {
            inputErrors.emailErr= (emailRegex.test(value)) ? "":"invalid email";
            invalidFlags.submitEmailInvalid = (inputErrors.emailErr === "") ? false: true;
        }

    }
    const handleChange = e => {
        const {name, value} = e.target;
        // set errors when appropriate.
        handleErrors(name, value);
        // if any errors are activated, don't allow user to submit.
        invalidFlags.submitInvalid = (invalidFlags.submitUsernameInvalid || invalidFlags.submitPWInvalid || invalidFlags.submitEmailInvalid)
        setValues({...values, [name]:value})
    }
    
    const handleSubmit = async (e) => 
    {
        const response = await axios
                                .post('/api/users/register',values)
                                .then( res => {
                                    console.log(inputErrors.usernameErr)
                                    if(res.data.userNameErr || res.data.emailErr)
                                    {
                                        inputErrors.usernameErr = res.data.userNameErr;
                                        inputErrors.emailErr = res.data.emailErr;
                                    }
                                    console.log(inputErrors.usernameErr)
                                    console.log(inputErrors.emailErr)
                                })
                                .catch( (err) => console.log("Error:", err ) );

    }
    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    <TextField
                        label={"Username"}
                        name={"username"} 
                        type={"text"} 
                        placeholder={"Username.."} 
                        handleChange={handleChange} 
                        inputErr={inputErrors.usernameErr}
                    />
                    <TextField
                        label={"Password"}
                        name={"password"} 
                        type={"password"} 
                        placeholder={"Password.."} 
                        handleChange={handleChange} 
                        inputErr={inputErrors.passwordErr}
                    />
                    <TextField
                        label={"Email"}
                        name={"email"} 
                        type={"text"} 
                        placeholder={"Email.."} 
                        handleChange={handleChange} 
                        inputErr={inputErrors.emailErr}
                    />
                </div>
                <div>
                    <button onClick={handleSubmit} disabled={invalidFlags.submitInvalid} type="button" >Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
