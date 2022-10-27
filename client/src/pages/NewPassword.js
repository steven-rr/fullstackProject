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
    const [displayMsg, setDisplayMsg] = useState("")

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
        console.log("blurr errors:", values, internalErrors, invalidFlags)
        // only set these displayerrors on blur!
        // displayErrors.passwordErr = internalErrors.passwordErr;
        let passwordErr = internalErrors.passwordErr;
        setDisplayErrors( curr=> {
            return {...curr, passwordErr: passwordErr}
        })

       


        // rerender the errors.
        rerender();
        
    }
    // rerender when blur is triggered.
    const handleKeydown = (e) => {
        if(e.keyCode === 13)
        {   
            handleSubmit(e);
        }
    }

    // implements client-side and server-side error handling.
    const handleOnChangeErrors = async (name, value) => {
        // handle client-side errors:
        if(name === "password")
        {   
            setInternalErrors( curr=> {
                return {...curr, passwordErr: (value.length < 6 ) ? "minimum of 6 characters required": "" }
            })
            // internalErrors.passwordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
        }
        console.log("change errors:", values, internalErrors, invalidFlags)

    }
    const handleSubmitErrors = async () => {
        // check if username and password are filled out.
        if(values.password === "")
        {
            // internalErrors.passwordErr = "please enter a password."
            setInternalErrors( curr=> {
                return {...curr, passwordErr:  "please enter a password." }
            })
        }
 
        // display errors 
        // displayErrors.passwordErr = internalErrors.passwordErr;
        let passwordErr = internalErrors.passwordErr; 
        setDisplayErrors( curr=> {
            return {...curr, passwordErr: passwordErr}
        })


        // determine if there are errors in any channels.
        let passwordErrBool = !(passwordErr == "");
        console.log("password err from submit errs: ", passwordErrBool)
        setInvalidFlags( curr=> {
            return {...curr,submitPasswordInvalid:passwordErrBool}
        })
        
        // rerender any errors.
        rerender();
        let val = values;
        let ierrs = internalErrors;
        let iFlags = invalidFlags;
        console.log("submit errors:", val, ierrs, iFlags)

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
        e.preventDefault();

        // // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur();
        // // handle submit errors.
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
                                    setDisplayMsg(currentVal => currentVal = `Your password has been updated. Please login with your new password` ) 

                                    console.log("password changed succesfully! " )

                                })
                                .catch( (err) => {
                                    setInternalErrors( curr => {
                                        return {...curr, passwordErr: "password reset link has expired or does not exist."}
                                    })
                                    // internalErrors.passwordErr = "password reset link has expired or does not exist."
                                    let passwordErr = internalErrors.passwordErr;
                                    setDisplayErrors( curr => {
                                        return {...curr, passwordErr: passwordErr}
                                    })
                                    // displayErrors.passwordErr = internalErrors.passwordErr;
                                    rerender();
                                    setDisplayMsg(currentVal => currentVal = "The password provided has been denied by the server." ) 
                                    console.log("failed reset password.");
                                    console.log("error: ", err);
                                })
        };

    }
    const onSubmit = (e) => {
        e.preventDefault()
    }
    if(sessionActive)
    {
        return (
            <div className={NewPasswordCSS.pageContainer}>
                <div className={NewPasswordCSS.createPostHeaderContainer}> 
                    <div className={NewPasswordCSS.headerStyle}> Change your Password </div>
                </div>
                <form className= {NewPasswordCSS.formClass} onSubmit={(e) => onSubmit(e)}>
                    <div className={NewPasswordCSS.inputsClass}>
                        <label>Password</label>
                        <input
                            type= "password"
                            name= "password"
                            onBlur={handleBlur}
                            onChange={handlePassword}
                            onKeyDown = {(e) => handleKeydown(e)}
                            placeholder="Password..."
                            className={NewPasswordCSS.textareaStyle}
                        />
                        <div className={NewPasswordCSS.errMsgClass}> {displayErrors.passwordErr} </div>
                        <div className={NewPasswordCSS.errMsgClass}> {displayMsg} </div>
                    </div>
                    <div>
                        <button className={NewPasswordCSS.buttonClass} onClick={(e) => handleSubmit(e)} type="button" > Change Password</button>
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
