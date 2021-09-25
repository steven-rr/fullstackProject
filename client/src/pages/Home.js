import React from 'react'
import HomeCSS from "./Home.module.css"
import Button from "../components/Button.js"
import axios from   "axios" 
const Home = () => {

    // get function
    const get1 = async () => {
        const response = await axios
                            .get('/misc/weather')
                            .then( res => {
                                console.log(res)
                                console.log(res.data)
                            })
                            .catch( (err) => console.log("Error:", err ) )
    } 

    return (
        <div className={HomeCSS.homeContainer}>
            <div className= {HomeCSS.textStyle}>Welcome to your server, Steven! </div>
            <div className={HomeCSS.buttnContainer}>
                <Button
                    name= "GET"
                    onClick = {get1}
                />
                <Button
                    name= "POST"
                />
                <Button
                    name= "PUT/PATCH"
                />
                <Button
                    name= "DELETE"
                />
            </div>
        </div>
    )
}

export default Home
