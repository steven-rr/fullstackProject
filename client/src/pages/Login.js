import React, { useState, useEffect } from 'react'
import axios from   "axios" 
import LoginCSS from "./Login.module.css"

const Login = () => {
    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [values, setValues] = useState({username: '', password: ''})
    const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: ''})
    // const [internalErrors, setInternalErrors] = useState({ usernameErr: '', passwordErr: ''})

    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true , submitPWInvalid: true,submitInvalid: true})

    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    // implements client-side handling for blur.
    const handleBlurErrors = async (name, value) => {
        console.log("hit!")
        // handle client-side errors:
        if(name === "username")
        {
            inputErrors.usernameErr = 
                            (value.length < 3)  ? "minimum of 3 characters required": "";
        }
        if( name === "password")
        {   
            if(value.length >0)
            {
                inputErrors.passwordErr= "";
            }
        }
    
        // rerender the errors.
        rerender();
    }

    // implements handling of blurs.
    const handleBlur = e => {
        const {name, value} = e.target;
        setValues({...values, [name]:value})

        // set errors when appropriate.
        handleBlurErrors(name, value);

    }
    // handling on change.

    // implements submit errors:
    const handleSubmitErrors = async () => {

        // check if username and password are filled out.
        if(values.username === "")
        {
            inputErrors.usernameErr = "please enter a username."
        }
        if(values.password === "")
        {
            inputErrors.passwordErr = "please enter a password."
        }

        // determine if there are errors in any channels.
        invalidFlags.submitUsernameInvalid = (inputErrors.usernameErr === "") ? false: true;
        invalidFlags.submitPWInvalid = (inputErrors.passwordErr === "") ? false: true;
        invalidFlags.submitInvalid = (invalidFlags.submitUsernameInvalid || invalidFlags.submitPWInvalid || invalidFlags.submitEmailInvalid)
        
        // rerender any errors.
        rerender();
    }


    const handleSubmit = async (e) => 
    {
        // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur(e);
        // handle submit errors
        await handleSubmitErrors();
        // if no errors, allow the attempt to log in.
        if(!invalidFlags.submitInvalid){
            const response = await axios
                                .post('/api/users/login',values)
                                .then( res => {
                                    console.log(res.data.msg)
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
                        placeholder="Username..."
                    />
                    <div className={LoginCSS.errMsgClass}> {inputErrors.usernameErr} </div>

                    <label>Password</label>
                    <input
                        type= "password"
                        name= "password"
                        onBlur={handleBlur}
                        placeholder="Password..."
                    />
                    <div className={LoginCSS.errMsgClass}> {inputErrors.passwordErr} </div>
                </div>
                <div>
                    <button className={LoginCSS.buttonClass }onClick={handleSubmit} type = "button">Login</button>
                </div>
            </form>
        </div>
    )
}

export default Login
