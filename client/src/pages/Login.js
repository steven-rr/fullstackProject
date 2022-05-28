import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from   "axios" 
import LoginCSS from "./Login.module.css"
import {useHistory, Link} from "react-router-dom"
import {AuthContext} from "../App"
import {GoogleLogin} from "react-google-login"
import rocketWallpaper from '../rocketWallpaper.png'
import { MdClose,MdOutlineClose } from "react-icons/md";

require('dotenv').config()

const Login = () => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)

    // instantiate history.
    const history = useHistory();

    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [values, setValues] = useState({username: '', password: ''})
    const [internalErrors, setInternalErrors] = useState({ usernameErr: '', passwordErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ usernameErr: '', passwordErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true , submitPWInvalid: true,submitInvalid: true})



    // rerender when blur is triggered.
    const handleKeydown = (e) => {
        if(e.keyCode === 13)
        {

            handleSubmit();
        }
    }
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
        if( name === "username")
        {   
            if(value.length >0)
            {
                internalErrors.usernameErr= "";
            }
        }
    }

    // on submit, check fields are nonempty. display any error present.
    const handleSubmitErrors = async () => {
        // check if username and password are filled out.
        if(values.username === "")
        {
            internalErrors.usernameErr = "Please enter a username."
        }
        if(values.password === "")
        {
            internalErrors.passwordErr = "Please enter a password."
        }

        // display errors 
        displayErrors.usernameErr = internalErrors.usernameErr;
        displayErrors.passwordErr = internalErrors.passwordErr;

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
                                    setValues( currentVals => {
                                        return {...currentVals, username: "", password: ""}})

                                    setAuthState( currentAuthState =>{ 
                                        return {...currentAuthState, username: res.data.username, UserId: res.data.id, authStatus: true}
                                        }); // set auth state is true when logging in.
                                    
                                    setAuthState( currentAuthState =>{ 
                                        return {...currentAuthState, loginOn: false}
                                        });
                                    window.location.reload();
                                    // history.push("/")
                                    console.log("updated auth state: " , authState)

                                })
                                .catch( (err) => {
                                    console.log("failed login.");
                                    console.log("error: ", err);

                                    
                                    if(err.response.data.usernameErr)
                                    {   
                                        internalErrors.usernameErr = err.response.data.usernameErr
                                    }
                                    if(err.response.data.passwordErr)
                                    {
                                        internalErrors.passwordErr = err.response.data.passwordErr
                                    }
                               
                                    displayErrors.usernameErr = internalErrors.usernameErr;
                                    displayErrors.passwordErr  = internalErrors.passwordErr;
                                    rerender();

                                });
        }
        else{
            console.log("not submitting !");
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
    // handle clicking on the X button in login page
    const handleLoginOff = () => {
        console.log("click login OFF")
        setAuthState( currentAuthState => {
            return { ...currentAuthState, loginOn: false}
        })
    }
    // google oath:
    const handleGoogleLoginFailure = () => {
        console.log("google sign in was unsuccesful!");
    }
    const handleGoogleLoginSuccess = async (googleData) => {
        console.log("google sign in was success.")
        console.log("googleData: " ,googleData)
        console.log("googleData token: " ,googleData.tokenId)
        const googleToken = googleData.tokenId;
        const response = await axios
                            .post('/api/users/googleoauth',{googleToken})
                            .then( res => {
                            
                                console.log("success all the way.", res.data)
                                setAuthState( currentAuthState =>{ 
                                    return {...currentAuthState, username: res.data.username, UserId: res.data.id, authStatus: true}
                                    }); // set auth state is true when logging in.

                                history.push("/")
                                console.log("updated auth state: " , authState)
                            })
                            .catch( (err) => {
                                    
                                console.log(" failured..." , err);
                            });
    }
    return (
        <div className={LoginCSS.loginContainer}>
            <div className={LoginCSS.rocketWallpaperOuterContainer}>
                <img className={LoginCSS.rocketWallpaperStyle} src= {rocketWallpaper}/>    
            </div>
            <div className={LoginCSS.loginContentContainer}>
                <button className={LoginCSS.XButtonClass} onClick={() => handleLoginOff()} type = "button"> <MdClose size="30px"/></button>
                <div className= {LoginCSS.loginWritingContainer}>
                    <div className={LoginCSS.textStyle}> Login</div>
                    <GoogleLogin 
                                clientId={process.env.REACT_APP_GOOGLE_OATH_CLIENT_ID}
                                buttonText="Log in with Google"
                                onSuccess={handleGoogleLoginSuccess}
                                onFailure={handleGoogleLoginFailure}
                                cookiePolicy={'single_host_origin'}
                            />
                    <div className={LoginCSS.orClass}>OR </div>
                    <form className= {LoginCSS.formClass}>
                        <div className={LoginCSS.inputsClass}>
                            <label>Username</label>
                            <input
                                type= "text"
                                name= "username"
                                onBlur={handleBlur}
                                onChange={handleUsername}
                                onKeyDown = {(e) => handleKeydown(e)}
                                placeholder="Username..."
                                value= {values.username}
                                className={LoginCSS.textareaStyle}
                            />
                            <div className={LoginCSS.errMsgClass}> {displayErrors.usernameErr} </div>

                            <label>Password</label>
                            <input
                                type= "password"
                                name= "password"
                                onBlur={handleBlur}
                                onChange={handlePassword}
                                onKeyDown = {(e) => handleKeydown(e)}
                                placeholder="Password..."
                                value= {values.password}
                                className={LoginCSS.textareaStyle}
                            />
                            <div className={LoginCSS.errMsgClass}> {displayErrors.passwordErr} </div>
                        </div>
                        <div className={LoginCSS.buttonContainer}>
                            <button className={LoginCSS.buttonClass} onClick={() => handleSubmit()} type = "button">Log In</button>
                            <div className= {LoginCSS.forgotUserinfoClass}> 
                                <div className={LoginCSS.leftTxt}> forgot </div>
                                <Link to ="/reset" className={LoginCSS.anchorForgotInfoClass}> password? </Link>
                                <div className={LoginCSS.middleTxt}> or</div>
                                <Link to ="/resetUsername" className={LoginCSS.anchorForgotInfoClass}> username?</Link>
                            </div>
                            <div> no account?  <Link to ="/form" className={LoginCSS.anchorForgotInfoClass} > sign up</Link></div>
                            {console.log("google oath: ",process.env.REACT_APP_GOOGLE_OATH_CLIENT_ID)}
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
