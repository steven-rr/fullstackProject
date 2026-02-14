import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from   "axios" 
import ChangePasswordCSS from "./ChangePassword.module.css"
import {useHistory, Link} from "react-router-dom"
import {AuthContext} from "../App"
import {GoogleLogin} from "react-google-login"
import rocketWallpaper from '../rocketWallpaper.png'
import { MdClose,MdOutlineClose } from "react-icons/md";
const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const ChangePassword = () => {
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
    const handlePasswordOff = () => {
        console.log("click changeEmail OFF")
        setAuthState( currentAuthState => {
            return { ...currentAuthState, changePassword: false}
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
    // update state of new password when value of new password changes.
    const handleNewPassword = async (e)=>{
        // update password state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, newPassword: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        console.log("handling new password", e.target.value)
        handleOnChangeErrors("newPassword", e.target.value);
        console.log("internalErrs", internalErrors)

    }
    const submitChangePW = async () =>
    {
        console.log("submitting change PW.")
        if(!invalidFlags.submitInvalid)
        {
            const response = await axios
                                    .put('/api/users/private/changepassword', {oldPassword: values.oldPassword, newPassword: values.newPassword})
                                    .then( res => {
                                        console.log("success change password: ", res.data.msg)
                                    })
                                    .catch( (err) => {
                                        const errorData = err?.response?.data || {};
                                        console.log("catch change password err: ", errorData);
                                        if(errorData.oldPasswordErr)
                                        {   
                                            internalErrors.oldPasswordErr = errorData.oldPasswordErr
                                            displayErrors.oldPasswordErr = errorData.oldPasswordErr
                                        }
                                        if(errorData.newPasswordErr)
                                        {
                                            internalErrors.newPasswordErr = errorData.newPasswordErr
                                            displayErrors.newPasswordErr = errorData.newPasswordErr
                                        }
                                        rerender();
                                    })
            }
    }
    return (
        <div className={ChangePasswordCSS.loginContainer}>
            <button className={ChangePasswordCSS.XButtonClass} onClick={() => handlePasswordOff()} type = "button"> <MdClose size="30px" /></button>
            <div className= {ChangePasswordCSS.loginWritingContainer}>
                    <div className={ChangePasswordCSS.textStyle}> Change Password </div>
                    <form className= {ChangePasswordCSS.formClass}>
                        <div className={ChangePasswordCSS.inputsClass}>
                            <label>Old Password</label>
                            <input
                                type= "password"
                                name= "oldpassword"
                                onBlur={handleBlur}
                                onChange={handleOldPassword}
                                placeholder="Password..."
                                value= {values.oldPassword}
                                className={ChangePasswordCSS.textareaStyle}
                            />
                            <div className={ChangePasswordCSS.errMsgClass}> {displayErrors.oldPasswordErr} </div>
                            <label>New Password</label>
                            <input
                                type= "text"
                                name= "email"
                                onBlur={handleBlur}
                                onChange={handleNewPassword}
                                placeholder="New Password..."
                                value= {values.newPassword}
                                className={ChangePasswordCSS.textareaStyle}
                            />
                            <div className={ChangePasswordCSS.errMsgClass}> {displayErrors.newPasswordErr} </div>

                        </div>
                        <button onClick={() => submitChangePW()} type = "button">Change Password</button>

                    </form>
                </div>
        </div>
    )
}

export default ChangePassword
