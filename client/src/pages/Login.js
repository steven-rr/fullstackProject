import React, { useState, useEffect } from 'react'
import axios from   "axios" 
import LoginCSS from "./Login.module.css"
import {useHistory} from "react-router-dom"

const Login = () => {
    // instantiate history.
    const history = useHistory();

    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [values, setValues] = useState({username: '', password: ''})
    const [internalErrors, setInternalErrors] = useState({ usernameErr: '', passwordErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ usernameErr: '', passwordErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true , submitPWInvalid: true,submitInvalid: true})

    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    // display errors to user on blur events.
    const handleBlur = async () => {
        // only set these displayerrors on blur!
        displayErrors.usernameErr = internalErrors.usernameErr;
        displayErrors.emailErr = internalErrors.emailErr;
    
        // rerender the errors.
        rerender();
    }

    // implements client-side form validation onChange. internal errors are not displayed to user until blur. 
    const handleOnChangeErrors = async (name, value) => {
        // handle client-side form validation:
        if(name === "username")
        {
            internalErrors.usernameErr = 
                            (value.length < 3)  ? "minimum of 3 characters required": "";
        }
        if( name === "password")
        {   
            if(value.length >0)
            {
                internalErrors.passwordErr= "";
            }
        }
    }

    // on submit, check fields are nonempty. display any error present.
    const handleSubmitErrors = async () => {

        // check if username and password are filled out.
        if(values.username === "")
        {
            internalErrors.usernameErr = "please enter a username."
        }
        if(values.password === "")
        {
            internalErrors.passwordErr = "please enter a password."
        }

        // display errors 
        displayErrors.usernameErr = internalErrors.usernameErr;
        displayErrors.emailErr = internalErrors.emailErr;

        // determine if there are errors in any channels.
        invalidFlags.submitUsernameInvalid = (internalErrors.usernameErr === "") ? false: true;
        invalidFlags.submitPWInvalid = (internalErrors.passwordErr === "") ? false: true;
        invalidFlags.submitInvalid = (invalidFlags.submitUsernameInvalid || invalidFlags.submitPWInvalid || invalidFlags.submitEmailInvalid)
        
        // rerender any errors.
        rerender();
    }


    const handleSubmit = async (e) => 
    {
        // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur();

        // handle submit errors. fields must be nonempty for submit.
        await handleSubmitErrors();

        // if no errors, allow the attempt to log in.
        if(!invalidFlags.submitInvalid){
            const response = await axios
                                .post('/api/users/login',values)
                                .then( res => {
                                    console.log(res.data.msg)
                                    setValues( currentVals => {
                                        return {...currentVals, username: "", password: ""}})
                                    history.push("/")
                                })
                                .catch( (err) => {
                                    if(err.response.data.error)
                                    {   
                                        console.log("error: ", err.response.data.error);
                                    }});
        }
        else{
            console.log("not submitting!");
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
    return (
        <div className={LoginCSS.loginContainer}>
            <div className={LoginCSS.textStyle}> Login, Steven! </div>
            <form className= {LoginCSS.formClass}>
                <div className={LoginCSS.inputsClass}>
                    <label>Username</label>
                    <input
                        type= "text"
                        name= "username"
                        onBlur={handleBlur}
                        onChange={handleUsername}
                        placeholder="Username..."
                        value= {values.username}
                    />
                    <div className={LoginCSS.errMsgClass}> {displayErrors.usernameErr} </div>

                    <label>Password</label>
                    <input
                        type= "password"
                        name= "password"
                        onBlur={handleBlur}
                        onChange={handlePassword}
                        placeholder="Password..."
                        value= {values.password}
                    />
                    <div className={LoginCSS.errMsgClass}> {displayErrors.passwordErr} </div>
                </div>
                <div>
                    <button className={LoginCSS.buttonClass} onClick={() => handleSubmit()} type = "button">Login</button>
                </div>
            </form>
        </div>
    )
}

export default Login
