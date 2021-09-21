import React from 'react'
import FormCSS from "./Form.module.css"

const Form = () => {
    return (
        <div className={FormCSS.formContainer}>
            <div className= {FormCSS.textStyle}>Create an Account, Steven! </div>
            <form className= {FormCSS.formClass}>
                <div className={FormCSS.inputsClass}>
                    <label>Username</label>
                    <input/>
                    <label>Password</label>
                    <input/>
                    <label>Email</label>
                    <input/>
                </div>
                <div>
                    <button>Create Account</button>
                </div>
            </form>
        </div>
    )
}

export default Form
