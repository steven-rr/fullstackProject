import React,  { useState, useEffect,useContext } from 'react'
import FormCSS from "./Form.module.css"
import TextField from "../components/FormTextField"
// import {Text, TextInput} from 'react-native'
import axios from   "axios" 
import {handleSubmit} from "./Login"
import FormTextFieldCSS from "../components/FormTextField.module.css"
import {useHistory} from "react-router-dom"
import {AuthContext} from "../App"
import rocketWallpaper from '../rocketWallpaper.png'
import { MdClose,MdOutlineClose } from "react-icons/md";

const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const Form = () => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)
    
    // instantiate history.
    const history = useHistory();

    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [values, setValues] = useState({username: '', password: '', email: '' })
    // const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [internalErrors, setInternalErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ usernameErr: '', passwordErr: '', emailErr:''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true, submitPWInvalid: true, submitEmailInvalid: true, submitInvalid: true})

    useEffect( () => {
        setValues( currentVals => {
            return {...currentVals, username: "", password: "", email: ""}})

        setInternalErrors( currentErrs => {
            return {...currentErrs, usernameErr: "", passwordErr: "", emailErr: ""}}) 
        
        setDisplayErrors( currentErrs => {
            return {...currentErrs, usernameErr: "", passwordErr: "", emailErr: ""}}) 
        
        setInvalidFlags( currentInvalidFlags => {
            return {...currentInvalidFlags, submitUsernameInvalid: true, submitPWInvalid: true, submitEmailInvalid: true,submitInvalid: true}}) 
    }, [authState.signUp])

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
                                        if(err.response.data.passwordErr)
                                        {
                                            internalErrors.passwordErr = err.response.data.passwordErr
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
    
    // attempt to login.
    const logIn = async () => {
        const valuesLogIn = {username: values.username, password: values.password};
        const response = await axios
                            .post('/api/users/login',valuesLogIn)
                            .then( res => {
                                setValues( currentVals => {
                                    return {...currentVals, username: "", password: "", email: ""}})

                                setAuthState( currentAuthState =>{ 
                                    return {...currentAuthState, username: res.data.username, UserId: res.data.id, authStatus: true}
                                    }); // set auth state is true when logging in.

                                history.push("/")
                                console.log("updated auth state: " , authState)

                            })
                            .catch( (err) => {
                                console.log("failed login.");
                                console.log("error: ", err);

                                if(err.response.data.error)
                                {   
                                    console.log("error: ", err.response.data.error);
                                }});

    }

    const handleSubmit = async (e) => 
    {   
        // run validation upon submission.
        const response = await axios
                            .get('/api/users/register', { params: values })
                            .then( res => {
                                console.log(res.data.msg)
                            })
                            .catch( (err) => {
                                if(err.response.data.usernameErr)
                                    {   
                                    internalErrors.usernameErr = err.response.data.usernameErr
                                }
                                if(err.response.data.passwordErr)
                                {
                                    internalErrors.passwordErr = err.response.data.passwordErr
                                }
                                if(err.response.data.emailErr)
                                {
                                    internalErrors.emailErr = err.response.data.emailErr
                                }})

        // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur(e);

        // if no errors, allow the user to register.
        if(!invalidFlags.submitInvalid) {
            console.log("submitted!")
            const response = await axios
                                    .post('/api/users/register',values)
                                    .then( res => {
                                        console.log("registered.")
                                        logIn();
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
    // rerender when blur is triggered.
    const handleKeydown = (e) => {
        if(e.keyCode === 13)
        {
            handleSubmit();
        }
    }
    // handle clicking on the X button in login page
    const handleSignUpOff = () => {
        console.log("click signup OFF")
        setAuthState( currentAuthState => {
            return { ...currentAuthState, signUp: false}
        })
        document.documentElement.style.overflow = "visible";

    }

    return (
        <div className={FormCSS.formContainer}>
            <div className={FormCSS.rocketWallpaperOuterContainer}>
                <img className={FormCSS.rocketWallpaperStyle} src= {rocketWallpaper}/>    
            </div>
            <div className={FormCSS.loginContentContainer}>
                <button className={FormCSS.XButtonClass} onClick={() => handleSignUpOff()} type = "button"> <MdClose size="30px"/></button>
                <div className={FormCSS.loginWritingContainer}>
                    <div className= {FormCSS.textStyle}>Create an Account to post! </div>
                    <form className= {FormCSS.formClass}>
                        <div className={FormCSS.inputsClass}>
                            <label>Username</label>
                            <input
                                type= "text"
                                name= "username"
                                onBlur={handleBlur}
                                onChange={handleUsername}
                                onKeyDown = {(e) => handleKeydown(e)}
                                placeholder="Username..."
                                value= {values.username}
                                className={FormCSS.textareaStyle}

                            />
                            <div className={FormCSS.errMsgClass}> {displayErrors.usernameErr} </div>
                            <label>Password</label>
                            <input
                                type= "password"
                                name= "password"
                                onBlur={handleBlur}
                                onChange={handlePassword}
                                onKeyDown = {(e) => handleKeydown(e)}
                                placeholder="Password..."
                                value= {values.password}
                                className={FormCSS.textareaStyle}
                            />
                            <div className={FormCSS.errMsgClass}> {displayErrors.passwordErr} </div>
                            <label>Email</label>
                            <input
                                type= "text"
                                name= "email"
                                onBlur={handleBlur}
                                onChange={handleEmail}
                                onKeyDown = {(e) => handleKeydown(e)}
                                placeholder="Email..."
                                value= {values.email}
                                className={FormCSS.textareaStyle}
                            />
                            <div className={FormTextFieldCSS.errMsgClass}> {displayErrors.emailErr} </div>
                        </div>
                        <div>
                            <button className={FormCSS.buttonClass} onClick={() => handleSubmit()} type="button" >Create Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Form
