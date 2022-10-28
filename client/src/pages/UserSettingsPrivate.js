import React , { useState, useEffect, useContext } from 'react'
import {useParams, Link} from "react-router-dom"
import axios from   "axios" 
import {AuthContext} from "../App"
import UserSettingsPrivateCSS from "./UserSettingsPrivate.module.css"

const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const UserSettingsPrivate = () => {
     // use params allows me to fetch params 
     let {UserId } = useParams();

     // auth state.
     const {authState, setAuthState} = useContext(AuthContext)

    //  use state:
    const [currentEmail , setCurrentEmail] = useState("") 
    const [changePW, setChangePW]=  useState(false); // used to rerender when necessary
    const [changeEmail, setChangeEmail]=  useState(false); // used to rerender when necessary
    const [values, setValues] = useState({oldPassword: '', newPassword: '',  newEmail: ''})
    const [internalErrors, setInternalErrors] = useState({ oldPasswordErr: '', newPasswordErr: '',  newEmailErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ oldPasswordErr: '', newPasswordErr: '',  newEmailErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({oldPasswordInvalid: true, newPasswordInvalid: true, newEmailInvalid: true, submitInvalid: false})
    const [index, setIndex]=  useState(0); // used to rerender when necessary

    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    //  on render, get private profile data from backend and display for the user.
    useEffect( async () => {
        const response = await axios
                            .get('/api/users/private/getEmail')
                            .then( res => {
                                console.log("email fetch success!", res.data.email)
                                setCurrentEmail(res.data.email);
                            })
                            .catch( (err) => {
                                console.log("fetch email failed ")
                                })
    }, [])

    // on toggle, display window.
    const toggleChangePW = () => {
        setAuthState( currentAuthState=> {
            return { ...currentAuthState, changePassword: !currentAuthState.changePassword}
        })
        console.log("changing password")
        setChangePW(!changePW)
        setValues( currentVals => {
            return {...currentVals, oldPassword: "", newPassword: ""}})
        setDisplayErrors ( currentDisplayErrs => {
            return {...currentDisplayErrs,oldPasswordErr: "", newPasswordErr: "" }
        })
        setInternalErrors ( currentInternalErrs => {
            return {...currentInternalErrs,oldPasswordErr: "", newPasswordErr: "" }
        })
    }
    // on toggle, display window.
    const toggleChangeEmail = () => {
        setAuthState( currentAuthState=> {
            return { ...currentAuthState, changeEmail: !currentAuthState.changeEmail}
        })
        console.log("changing email")
        setChangeEmail(!changeEmail)
        setValues( currentVals => {
            return {...currentVals, oldPassword: "", newEmail: ""}})
        setDisplayErrors ( currentDisplayErrs => {
            return {...currentDisplayErrs,oldPasswordErr: "", newEmailErr: "" }
        })
        setInternalErrors ( currentInternalErrs => {
            return {...currentInternalErrs,oldPasswordErr: "", newEmailErr: "" }
        })
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
                                        console.log("catch change password err: ", err.response.data);
                                        if(err.response.data.oldPasswordErr)
                                        {   
                                            internalErrors.oldPasswordErr = err.response.data.oldPasswordErr
                                            displayErrors.oldPasswordErr = err.response.data.oldPasswordErr
                                        }
                                        if(err.response.data.newPasswordErr)
                                        {
                                            internalErrors.newPasswordErr = err.response.data.newPasswordErr
                                            displayErrors.newPasswordErr = err.response.data.newPasswordErr
                                        }
                                        rerender();
                                    })
            }
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
        <div className={UserSettingsPrivateCSS.pageContainer}>
            {
            UserId == authState.UserId
            ? 
            <div>
                <div> 
                    <div className={UserSettingsPrivateCSS.textStyle}> {authState.username} </div>
                    <div>
                        <Link className= {UserSettingsPrivateCSS.buttonClass}  to = {`/user/${UserId}`} >posts</Link>
                        <Link className= {UserSettingsPrivateCSS.buttonClass}  to = {`/user/${UserId}/comments`}>comments</Link>
                        {(authState.UserId == UserId) ? (<><Link className= {UserSettingsPrivateCSS.buttonClass} to = {`/user/${UserId}/settings`}>user settings</Link></>) : ""}
                    </div>

                    <div className={UserSettingsPrivateCSS.formContainer}>
                        <div>  
                            <div> Email:</div> 
                            <div> {currentEmail} </div> <button className={UserSettingsPrivateCSS.smallButtonClass} onClick={ () => toggleChangeEmail()}> change </button>
                        </div>
                        <div>  
                            <div> password:  </div> 
                            <div> password must be at least 6 characters </div> <button className={UserSettingsPrivateCSS.smallButtonClass} onClick={ () => toggleChangePW()}> change</button> 
                        </div>
                    </div>
                </div>
                

                <div className={`${UserSettingsPrivateCSS.changePasswordContainer}  ${changePW ? '' : UserSettingsPrivateCSS.deactivate } `}> 
                    <div className= {UserSettingsPrivateCSS.changePasswordWindow}> 
                        <div className ={UserSettingsPrivateCSS.changePasswordHeader}>
                            <div className={UserSettingsPrivateCSS.textStyle}>change Password</div>
                            <button className={UserSettingsPrivateCSS.buttonClass} onClick={ () => toggleChangePW()}>X</button>
                        </div>
                        <div className={UserSettingsPrivateCSS.changePasswordBody}> 
                            <label>Old Password</label>
                            <input
                                type= "password"
                                name= "oldpassword"
                                onBlur={handleBlur}
                                onChange={handleOldPassword}
                                placeholder="Old Password..."
                                value= {values.oldPassword}
                            />
                            <div className={UserSettingsPrivateCSS.errMsgClass}> {displayErrors.oldPasswordErr} </div>
                            <label>New Password</label>
                            <input
                                type= "password"
                                name= "newpassword"
                                onBlur={handleBlur}
                                onChange={handleNewPassword}
                                placeholder="New Password..."
                                value= {values.newPassword}
                            />
                            <div className={UserSettingsPrivateCSS.errMsgClass}> {displayErrors.newPasswordErr} </div>
                            <button onClick={() => submitChangePW()} type = "button">Change Password</button>
                        </div>
                    </div>
                </div>

                <div className={`${UserSettingsPrivateCSS.changePasswordContainer}  ${changeEmail ? '' : UserSettingsPrivateCSS.deactivate } `}> 
                    <div className= {UserSettingsPrivateCSS.changePasswordWindow}> 
                        <div className ={UserSettingsPrivateCSS.changePasswordHeader}>
                            <div className={UserSettingsPrivateCSS.textStyle}>change Email</div>
                            <button className={UserSettingsPrivateCSS.buttonClass} onClick={ () => toggleChangeEmail()}>X</button>
                        </div>
                        <div className={UserSettingsPrivateCSS.changePasswordBody}> 
                            <label>Old Password</label>
                            <input
                                type= "password"
                                name= "oldpassword"
                                onBlur={handleBlur}
                                onChange={handleOldPassword}
                                placeholder="Old Password..."
                                value= {values.oldPassword}
                            />
                            <div className={UserSettingsPrivateCSS.errMsgClass}> {displayErrors.oldPasswordErr} </div>
                            <label>New Email</label>
                            <input
                                type= "text"
                                name= "email"
                                onBlur={handleBlur}
                                onChange={handleNewEmail}
                                placeholder="New Email..."
                                value= {values.newEmail}
                            />
                            <div className={UserSettingsPrivateCSS.errMsgClass}> {displayErrors.newEmailErr} </div>
                            <button onClick={() => submitChangeEmail()} type = "button">Change Email</button>
                        </div>
                    </div>
                </div>
            </div>
            :
            <div>
                Does not exist. Please log in.
            </div>}
        </div>
    )
}

export default UserSettingsPrivate
