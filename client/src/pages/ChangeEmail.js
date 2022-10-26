import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from   "axios" 
import ChangeEmailCSS from "./ChangeEmail.module.css"
import {useHistory, Link} from "react-router-dom"
import {AuthContext} from "../App"
import {GoogleLogin} from "react-google-login"
import rocketWallpaper from '../rocketWallpaper.png'
import { MdClose,MdOutlineClose } from "react-icons/md";
import { set } from 'express/lib/application'
const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

require('dotenv').config()

const ChangeEmail = () => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)

    // instantiate history.
    const history = useHistory();

    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [values, setValues] = useState({oldPassword: '', newPassword: '',  newEmail: ''})
    const [internalErrors, setInternalErrors] = useState({ oldPasswordErr: '', newPasswordErr: '',  newEmailErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ oldPasswordErr: '', newPasswordErr: '',  newEmailErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({oldPasswordInvalid: true, newPasswordInvalid: true, newEmailInvalid: true, submitInvalid: false})

    useEffect( () => {
    
    }, [])

    // handle clicking on the X button in login page
    const handleChangeEmailOff = () => {
        console.log("click changeEmail OFF")
        setAuthState( currentAuthState => {
            return { ...currentAuthState, changeEmail: false}
        })
        document.documentElement.style.overflow = "visible";

    }
    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    // display errors to user on blur events.
    const handleBlur = async () => {
        // only set these displayerrors on blur!
        displayErrors.oldPasswordErr = internalErrors.oldPasswordErr;
        displayErrors.newPasswordErr = internalErrors.newPasswordErr;
        displayErrors.newEmailErr = internalErrors.newEmailErr;

        // rerender the errors.
        rerender();
        console.log(displayErrors);
    }
    const handleOnChangeErrors = async (name, value) => {
        if(name === "oldPassword")
        {
            internalErrors.oldPasswordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
        }
        if(name === "newPassword")
        {
            internalErrors.newPasswordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
        }
        else if(name === "newEmail")
        {
            internalErrors.newEmailErr= (emailRegex.test(value)) ? "":"invalid email";
        }
        // determine if there are errors in any channels.
        invalidFlags.oldPasswordInvalid = (internalErrors.oldPasswordErr === "") ? false: true;
        invalidFlags.newPasswordInvalid = (internalErrors.newPasswordErr === "") ? false: true;
        invalidFlags.newEmailInvalid    = (internalErrors.newEmailErr    === "") ? false: true;

         // if any errors are activated, don't allow user to submit.
         invalidFlags.submitInvalid = (invalidFlags.oldPasswordInvalid || invalidFlags.newPasswordInvalid || invalidFlags.newEmailInvalid)

    }
    // update state of old password when value of old password changes.
    const handleOldPassword = async (e)=>{
        // update password state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, oldPassword: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        console.log("handling old password", e.target.value)
        handleOnChangeErrors("oldPassword", e.target.value);
        console.log("internalErrs", internalErrors)

    }
    // update state of new email when value of new email changes.
    const handleNewEmail = async (e)=>{
        // update email state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, newEmail: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        console.log("handling new email", e.target.value)
        handleOnChangeErrors("newEmail", e.target.value);
        console.log("internalErrs", internalErrors)

    }
    const submitChangeEmail = async () =>
    {
        console.log("attempting change Email.")
        if(!invalidFlags.submitInvalid)
        {
            const response = await axios
                                    .put('/api/users/private/changeemail', {oldPassword: values.oldPassword, newEmail: values.newEmail})
                                    .then( res => {
                                        console.log("success change email: ", res.data.msg)
                                    })
                                    .catch( (err) => {
                                        console.log("catch change email err: ", err.response.data);
                                        if(err.response.data.oldPasswordErr)
                                            {   
                                            internalErrors.oldPasswordErr = err.response.data.oldPasswordErr
                                            displayErrors.oldPasswordErr = err.response.data.oldPasswordErr

                                        }
                                        if(err.response.data.newEmailErr)
                                        {
                                            internalErrors.newEmailErr = err.response.data.newEmailErr
                                            displayErrors.newEmailErr = err.response.data.newEmailErr

                                        }
                                        rerender();
                                    })
        }
    }
    return (
        <div className={ChangeEmailCSS.loginContainer}>
            <button className={ChangeEmailCSS.XButtonClass} onClick={() => handleChangeEmailOff()} type = "button"> <MdClose size="30px"/></button>
            <div className= {ChangeEmailCSS.loginWritingContainer}>
                    <div className={ChangeEmailCSS.textStyle}> Change Email </div>
                    <form className= {ChangeEmailCSS.formClass}>
                        <div className={ChangeEmailCSS.inputsClass}>
                            <label>Password</label>
                            <input
                                type= "password"
                                name= "oldpassword"
                                onBlur={handleBlur}
                                onChange={handleOldPassword}
                                placeholder="Password..."
                                value= {values.oldPassword}
                                className={ChangeEmailCSS.textareaStyle}
                            />
                            <div className={ChangeEmailCSS.errMsgClass}> {displayErrors.oldPasswordErr} </div>
                            <label>New Email</label>
                            <input
                                type= "text"
                                name= "email"
                                onBlur={handleBlur}
                                onChange={handleNewEmail}
                                placeholder="New Email..."
                                value= {values.newEmail}
                                className={ChangeEmailCSS.textareaStyle}
                            />
                            <div className={ChangeEmailCSS.errMsgClass}> {displayErrors.newEmailErr} </div>

                        </div>
                        <button onClick={() => submitChangeEmail()} type = "button">Change Email</button>

                    </form>
                </div>
        </div>
    )
}

export default ChangeEmail
