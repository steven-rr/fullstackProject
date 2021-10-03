import React,  { useState, useEffect } from 'react'
import FormCSS from "./Form.module.css"
import TextField from "../components/FormTextField"
// import {Text, TextInput} from 'react-native'
import axios from   "axios" 
import FormTextFieldCSS from "../components/FormTextField.module.css"
const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const Form = () => {
    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [values, setValues] = useState({username: '', password: '', email: '' })
    const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true, submitPWInvalid: true, submitEmailInvalid: true, submitInvalid: true})
   
    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }


    // implements client-side and server-side error handling.
    const handleErrors = async (name, value) => {
        // handle client-side errors:
        if(name === "username")
        {
            inputErrors.usernameErr = 
                            (value.length < 3)  ? "minimum of 3 characters required": "";
        }
        else if(name === "password")
        {
            inputErrors.passwordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
        }
        else if(name === "email")
        {
            inputErrors.emailErr= (emailRegex.test(value)) ? "":"invalid email";
        }

        // handle server-side validation. only if value is nonempty.
        if(value)
        {    
            const valuesIn = {};
            valuesIn[name] = value;
            const response = await axios
                                    .get('/api/users/register', { params: valuesIn })
                                    .then( res => {
                                        console.log(res.data.msg)
                                    })
                                    .catch( (err) => {
                                        if(err.response.data.usernameErr)
                                         {   
                                            inputErrors.usernameErr = err.response.data.usernameErr
                                        }
                                        if(err.response.data.emailErr)
                                        {
                                            inputErrors.emailErr = err.response.data.emailErr
                                        }})
        }
        // determine if there are errors in any channels.
        invalidFlags.submitUsernameInvalid = (inputErrors.usernameErr === "") ? false: true;
        invalidFlags.submitPWInvalid = (inputErrors.passwordErr === "") ? false: true;
        invalidFlags.submitEmailInvalid = (inputErrors.emailErr === "") ? false: true;

        // rerender the errors.
        rerender();
    }
    const handleChange = async (e) => {
        const {name, value} = await e.target;
        // update value to what it is.
        setValues({...values, [name]:value})

        // set errors when appropriate.
        handleErrors(name, value);
        
        // if any errors are activated, don't allow user to submit.
        invalidFlags.submitInvalid = (invalidFlags.submitUsernameInvalid || invalidFlags.submitPWInvalid || invalidFlags.submitEmailInvalid)
    }
    
    const handleSubmit = async (e) => 
    {   
        if(!invalidFlags.submitInvalid) {
            console.log("submitted!")
            const response = await axios
                                    .post('/api/users/register',values)
                                    .then( res => {
                                        console.log("registered.")
                                    })
                                    .catch( err =>  console.log(err) );
        }
    }
    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    <label>Username</label>
                    <input
                        type= "text"
                        name= "username"
                        onBlur={handleChange}
                        placeholder="Username..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {inputErrors.usernameErr} </div>
                    <label>Password</label>
                    <input
                        type= "password"
                        name= "password"
                        onBlur={handleChange}
                        placeholder="Password..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {inputErrors.passwordErr} </div>
                    <label>Email</label>
                    <input
                        type= "text"
                        name= "email"
                        onBlur={handleChange}
                        placeholder="Email..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {inputErrors.emailErr} </div>
                </div>
                <div>
                    <button onClick={handleSubmit} type="button" >Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
