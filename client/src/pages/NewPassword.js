import React, {useState, useEffect} from 'react'
import {useParams, useHistory} from "react-router-dom"
import NewPasswordCSS from "./NewPassword.module.css"
import axios from "axios"

const NewPassword = () => {
    const {token} = useParams()
    const [values, setValues] = useState({password: ''})
    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [internalErrors, setInternalErrors] = useState({ passwordErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ passwordErr:''})
    const [invalidFlags, setInvalidFlags] = useState({submitPasswordInvalid: true, submitInvalid: true})
    const [sessionActive, setSessionActive] = useState(false);
    // useeffect determines whter session is expired.
    useEffect( () => {
        axios.get("/api/users/resetpassword" , {params: token})
            .then( (response) =>{
                setSessionActive(true)
            })
            .catch( 
                setSessionActive(false)
            )
    } , [])

    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    // display errors to user on blur events.
    const handleBlur = async (e) => {
        // only set these displayerrors on blur!
        displayErrors.passwordErr = internalErrors.passwordErr;
    
        // rerender the errors.
        rerender();
    }


    // implements client-side and server-side error handling.
    const handleOnChangeErrors = async (name, value) => {
        // handle client-side errors:
        if(name === "password")
        {
            internalErrors.passwordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
        }
    }
    const handleSubmitErrors = async () => {
        // check if username and password are filled out.
        if(values.password === "")
        {
            internalErrors.passwordErr = "please enter a password."
        }
 
        // display errors 
        displayErrors.passwordErr = internalErrors.passwordErr;

        // determine if there are errors in any channels.
        invalidFlags.submitPasswordInvalid = (internalErrors.passwordErr === "") ? false: true;
        invalidFlags.submitInvalid = (invalidFlags.submitPasswordInvalid)
        // rerender any errors.
        rerender();
    }

    const handlePassword = async (e)=>{
        // update password state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, password: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        handleOnChangeErrors("password", e.target.value);
    }
    const handleSubmit = async (e) => 
    {
        // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur();
        // handle submit errors.
        handleSubmitErrors();

        console.log("hit submit!")
        // submitting invalid:
        if(!invalidFlags.submitInvalid){
            console.log("trying to submit!")
            const toSend= {password: values.password, token: token};
            const response = await axios
                                .post('/api/users/resetpassword',toSend)
                                .then( res => {
                                    setValues( currentVals => {
                                        return {...currentVals, password: ""}})

                                    console.log("password changed succesfully! " )

                                })
                                .catch( (err) => {
                                    internalErrors.passwordErr = "password reset link has expired or does not exist."
                                    displayErrors.passwordErr = internalErrors.passwordErr;
                                    rerender();
                                    console.log("failed reset password.");
                                    console.log("error: ", err);
                                })
        };

    }
    if(sessionActive)
    {
        return (
            <div className={NewPasswordCSS.pageContainer}>
                <div className={NewPasswordCSS.createPostHeaderContainer}> 
                    <div className={NewPasswordCSS.headerStyle}> Change your Password </div>
                </div>
                <form className= {NewPasswordCSS.formClass}>
                    <div className={NewPasswordCSS.inputsClass}>
                        <label>Password</label>
                        <input
                            type= "password"
                            name= "password"
                            onBlur={handleBlur}
                            onChange={handlePassword}
                            placeholder="Password..."
                        />
                        <div className={NewPasswordCSS.errMsgClass}> {displayErrors.passwordErr} </div>
                    </div>
                    <div>
                        <button className={NewPasswordCSS.buttonClass} onClick={() => handleSubmit()} type="button" > Change Password</button>
                    </div>
                </form>
            </div>
        )
    }
    else
    {
        return (
            <div className={NewPasswordCSS.pageContainer}>
                <div className={NewPasswordCSS.createPostHeaderContainer}> 
                    <div className={NewPasswordCSS.headerStyle}> Link has expired! </div>
                </div>
            </div>
        )
    }
}

export default NewPassword
