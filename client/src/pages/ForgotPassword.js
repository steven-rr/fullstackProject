import React, {useState, useContext} from 'react'
import {AuthContext} from "../App"
import ForgotPasswordCSS from "./ForgotPassword.module.css"
import axios from "axios"
import rocketWallpaper from '../rocketWallpaper.png'
import { MdClose,MdOutlineClose } from "react-icons/md";
const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );


const ForgotPassword = () => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)
    const [values, setValues] = useState({email: ''})
    const [index, setIndex]=  useState(0); // used to rerender when necessary
    const [internalErrors, setInternalErrors] = useState({ emailErr: ''})
    const [displayErrors, setDisplayErrors] = useState({ emailErr:''})
    const [invalidFlags, setInvalidFlags] = useState({submitEmailInvalid: true, submitInvalid: true})

    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIndex(currentIndex=> currentIndex+1);
    }

    // display errors to user on blur events.
    const handleBlur = async (e) => {
        // only set these displayerrors on blur!
        displayErrors.emailErr = internalErrors.emailErr;
    
        // rerender the errors.
        rerender();
    }


    // implements client-side and server-side error handling.
    const handleOnChangeErrors = async (name, value) => {
        // handle client-side errors:
        if(name === "email")
        {
            internalErrors.emailErr= (emailRegex.test(value)) ? "":"invalid email";
        }
    }
    const handleSubmitErrors = async () => {
        // check if username and password are filled out.
        if(values.email === "")
        {
            internalErrors.emailErr = "please enter an email."
        }
  

        // display errors 
        displayErrors.emailErr = internalErrors.emailErr;

        // determine if there are errors in any channels.
        invalidFlags.submitEmailInvalid = (internalErrors.emailErr === "") ? false: true;
        invalidFlags.submitInvalid = (invalidFlags.submitEmailInvalid)
        // rerender any errors.
        rerender();
    }

    const handleEmail = async (e)=>{
        // update email state whenever user changes values of textfield.
        setValues( currentVals => {
            return {...currentVals, email: e.target.value}})

        // keep track internally of all errors. only display errors on blur.
        handleOnChangeErrors("email", e.target.value);
    }
    const handleSubmit = async (e) => 
    {
        // in case user hits submit without blurring, handle blur async with submits.
        await handleBlur();
        // handle submit errors.
        handleSubmitErrors();
        // submitting invalid:
        if(!invalidFlags.submitInvalid){
            const response = await axios
                                .post('/api/users/forgotpassword',values)
                                .then( res => {
                                    setValues( currentVals => {
                                        return {...currentVals, email: ""}})

                                    console.log("email sent succesfully! " )

                                })
                                .catch( (err) => {
                                    console.log("failed reset password.");
                                    console.log("error: ", err);
                                })
        };

    }
    // handle clicking on the X button in login page
    const handlePageOff = () => {
        console.log("click login OFF")
        setAuthState( currentAuthState => {
            return { ...currentAuthState, forgotPass: false}
        })
        document.documentElement.style.overflow = "visible";

    }
    // rerender when blur is triggered.
    const handleKeydown = (e) => {
        if(e.keyCode === 13)
        {

            handleSubmit();
        }
    }
    return (
        <div className={ForgotPasswordCSS.pageContainer}>
            <div className={ForgotPasswordCSS.rocketWallpaperOuterContainer}>
                <img className={ForgotPasswordCSS.rocketWallpaperStyle} src= {rocketWallpaper}/>    
            </div>
            <div className={ForgotPasswordCSS.loginContentContainer}>
                <button className={ForgotPasswordCSS.XButtonClass} onClick={() => handlePageOff()} type = "button"> <MdClose size="30px"/></button>
                <div className= {ForgotPasswordCSS.loginWritingContainer}>
                    <div className={ForgotPasswordCSS.textStyle}> Reset your Password </div>
                    <form className= {ForgotPasswordCSS.formClass}>
                        <div className={ForgotPasswordCSS.inputsClass}>
                            <label>Email</label>
                            <input
                                type= "text"
                                name= "email"
                                onBlur={handleBlur}
                                onChange={handleEmail}
                                placeholder="Email..."
                                onKeyDown = {(e) => handleKeydown(e)}
                                value= {values.email}
                                className={ForgotPasswordCSS.textareaStyle}
                            />
                            <div className={ForgotPasswordCSS.errMsgClass}> {displayErrors.emailErr} </div>
                        </div>
                        <div>
                            <button className={ForgotPasswordCSS.buttonClass} onClick={() => handleSubmit()} type="button" > Send Reset Password Link</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
