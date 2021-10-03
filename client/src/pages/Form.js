import React,  { useState, useEffect } from 'react'
import FormCSS from "./Form.module.css"
import TextField from "../components/FormTextField"
// import {Text, TextInput} from 'react-native'
import axios from   "axios" 
import FormTextFieldCSS from "../components/FormTextField.module.css"
const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[A-Za-z]+$/
  );

const Form = () => {
    const [rerender, setRerender] = useState(false)
    const [values, setValues] = useState({username: '', password: '', email: '' })
    const [inputErrors, setInputErrors] = useState({ usernameErr: '', passwordErr: '', emailErr: ''})
    const [invalidFlags, setInvalidFlags] = useState({submitUsernameInvalid: true, submitPWInvalid: true, submitEmailInvalid: true, submitInvalid: true})
    
    // rerender when username error appears.
    useEffect( () => {
        setRerender(!rerender)
    }, [values.usernameErr])

    // handles input errors.
    const handleErrors = async (name, value) => {
        // handle client-side errors:
        if(name === "username")
        {
            inputErrors.usernameErr = 
                            (value.length < 3)  ? "minimum of 3 characters required": "";
            invalidFlags.submitUsernameInvalid = (inputErrors.usernameErr === "") ? false: true;
        }
        else if(name === "password")
        {
            inputErrors.passwordErr= (value.length < 6 ) ? "minimum of 6 characters required": "";
            invalidFlags.submitPWInvalid = (inputErrors.passwordErr === "") ? false: true;
        }
        else if(name === "email")
        {
            inputErrors.emailErr= (emailRegex.test(value)) ? "":"invalid email";
            invalidFlags.submitEmailInvalid = (inputErrors.emailErr === "") ? false: true;
        }
        // check whether username exists in database, if so show error.
        const response = await axios
                                    .get('/api/users/register', { params: {...values, [name]:value} })
                                    .then( res => {
                                        inputErrors.usernameErr = res.data.usernameErr;
                                        inputErrors.emailErr = res.data.emailErr;
                                        console.log(inputErrors.usernameErr)
                                        console.log(inputErrors.emailErr)

                                    })
                                    .catch(err => console.log(err))

    }
    const handleChange = async (e) => {
        // await console.log("TRIGGERED!")
        const {name, value} = await e.target;
        // await console.log("TRIGGERED!!!!!!!!!!!!!!!!!!!! name: ", name)
        // await console.log("TRIGGERED!!!!!!!!!!!!!!!!!!!! value: ", value)
        // update value to what it is.
        await setValues({...values, [name]:value})

        // await console.log("TRIGGERED!!!!!!!!!!!!!!!!!!!! username: ", values.username)
        // await console.log("TRIGGERED!!!!!!!!!!!!!!!!!!!! email: ", values.email)

        // set errors when appropriate.
        handleErrors(name, value);
        // if any errors are activated, don't allow user to submit.
        invalidFlags.submitInvalid = (invalidFlags.submitUsernameInvalid || invalidFlags.submitPWInvalid || invalidFlags.submitEmailInvalid)
    }
    
    const handleSubmit = async (e) => 
    {   
        if(!invalidFlags.submitInvalid) {
            console.log("submitted!")
            const response = await axios
                                    .post('/api/users/register',values)
                                    .then( res => {
                                        console.log("registered.")
                                        //return JWT here.
                                    })
                                    .catch( (err) => {
                                        inputErrors.userNameErr = err.response.data.usernameErr;
                                        inputErrors.emailErr = err.response.data.emailErr;});
        }
    }
    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    <label>Username</label>
                    <input
                        type= "text"
                        name= "username"
                        onBlur={handleChange}
                        placeholder="Username..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {inputErrors.usernameErr} </div>
                    <label>Password</label>
                    <input
                        type= "password"
                        name= "password"
                        onBlur={handleChange}
                        placeholder="Password..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {inputErrors.passwordErr} </div>
                    <label>Email</label>
                    <input
                        type= "text"
                        name= "email"
                        onBlur={handleChange}
                        placeholder="Email..."
                    />
                    <div className={FormTextFieldCSS.errMsgClass}> {inputErrors.emailErr} </div>
                </div>
                <div>
                    <button onClick={handleSubmit} type="button" >Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
