import React, { useState, useEffect } from 'react'
import axios from   "axios" 
import LoginCSS from "./Login.module.css"

const Login = () => {
    const [values, setValues] = useState({username: '', password: '', email: '' })
    const [inputErrors, setInputErrors] = useState({ loginErr: ''})

    const handleChange = e => {
        const {name, value} = e.target;
        setValues({...values, [name]:value})
    }

    const handleSubmit = async (e) => 
    {
        const response = await axios
                                .post('/api/users/login',values)
                                .then( res => {
                                    if(res.data.error)
                                    {
                                        inputErrors.loginErr = res.data.error;
                                        console.log(res.data.error)
                                    }
                                    console.log(res)
                                })
                                .catch( (err) => console.log("Error:", err ) );

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
                        onChange={handleChange}
                        placeholder="Username..."
                    />
                    <label>Password</label>
                    <input
                        type= "password"
                        name= "password"
                        onChange={handleChange}
                        placeholder="Password..."
                    />
                    <div className={LoginCSS.errMsgClass}> {inputErrors.loginErr} </div>
                </div>
                <div>
                    <button onClick={handleSubmit} type = "button">Login</button>
                </div>
            </form>
        </div>
    )
}

export default Login
