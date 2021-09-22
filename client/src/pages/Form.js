import React,  { useState, useEffect } from 'react'
import FormCSS from "./Form.module.css"
import axios from   "axios" 

const Form = () => {

    const [values, setValues] = useState({username: '', password: '', email: '' })
    // useEffect( () => console.log("use Effect: " , values.username), [values.username])
    // useEffect( () => console.log("use Effect: " , values.password), [values.password])
    // useEffect( () => console.log("use Effect: " , values.email), [values.email])

    const handleChange = e => {
        const {name, value} = e.target;
        setValues({...values, [name]:value})
    }

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        const response = await axios
                                .post('/api/users',values)
                                .then( res => {
                                    console.log(res)
                                })
                                .catch( (err) => console.log("Error:", err ) );

    }
    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    <label>Username</label>
                    <input
                        type= "text"
                        name="username"
                        onChange={handleChange}
                        placeholder="Username..."
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        placeholder= "Password..." 
                    />
                    <label>Email</label>
                    <input
                        type= "text"
                        name="email"
                        onChange={handleChange}
                        placeholder="Email..."
                    />
                </div>
                <div>
                    <button onClick={handleSubmit}>Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
