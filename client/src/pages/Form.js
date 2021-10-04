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
    // const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [internalErrors, setInternalErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ usernameErr: '', passwordErr: '', emailErr:''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true, submitPWInvalid: true, submitEmailInvalid: true, submitInvalid: true})
   
    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    // display errors to user on blur events.
    const handleBlur = async (e) => {
        // only set these displayerrors on blur!
        displayErrors.usernameErr = internalErrors.usernameErr;
        displayErrors.passwordErr = internalErrors.passwordErr;
        displayErrors.emailErr = internalErrors.emailErr;
    
        // rerender the errors.
        rerender();
    }

    // implements client-side and server-side error handling.
    const handleOnChangeErrors = async (name, value) => {
        // handle client-side errors:
        if(name === "username")
        {
            internalErrors.usernameErr = 
                            (value.length < 3)  ? "minimum of 3 characters required": "";
        }
        else if(name === "password")
        {
            internalErrors.passwordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
        }
        else if(name === "email")
        {
            internalErrors.emailErr= (emailRegex.test(value)) ? "":"invalid email";
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
                                            internalErrors.usernameErr = err.response.data.usernameErr
                                        }
                                        if(err.response.data.emailErr)
                                        {
                                            internalErrors.emailErr = err.response.data.emailErr
                                        }})
        }
        // determine if there are errors in any channels.
        invalidFlags.submitUsernameInvalid = (internalErrors.usernameErr === "") ? false: true;
        invalidFlags.submitPWInvalid = (internalErrors.passwordErr === "") ? false: true;
        invalidFlags.submitEmailInvalid = (internalErrors.emailErr === "") ? false: true;

         // if any errors are activated, don't allow user to submit.
         invalidFlags.submitInvalid = (invalidFlags.submitUsernameInvalid || invalidFlags.submitPWInvalid || invalidFlags.submitEmailInvalid)


    }
    
    
    const handleSubmit = async (e) => 
    {   
        // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur(e);

        // if no errors, allow the user to register.
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

    const handleUsername = async (e)=>{
        // update username state whenever user changes values of textfield.
        setValues( currentVals => {
           return {...currentVals, username: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        handleOnChangeErrors("username", e.target.value);
    }

    const handlePassword = async (e)=>{
        // update password state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, password: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        handleOnChangeErrors("password", e.target.value);
    }

    const handleEmail = async (e)=>{
        // update email state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, email: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        handleOnChangeErrors("email", e.target.value);
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
                        onBlur={handleBlur}
                        onChange={handleUsername}
                        placeholder="Username..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {displayErrors.usernameErr} </div>
                    <label>Password</label>
                    <input
                        type= "password"
                        name= "password"
                        onBlur={handleBlur}
                        onChange={handlePassword}
                        placeholder="Password..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {displayErrors.passwordErr} </div>
                    <label>Email</label>
                    <input
                        type= "text"
                        name= "email"
                        onBlur={handleBlur}
                        onChange={handleEmail}
                        placeholder="Email..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {displayErrors.emailErr} </div>
                </div>
                <div>
                    <button className={FormCSS.buttonClass} onClick={handleSubmit} type="button" >Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
