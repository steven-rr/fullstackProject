import React, { useState, useEffect } from 'react' 
import HomeCSS from "./Home.module.css"
import Button from "../components/Button.js"
import axios from   "axios" 
const Home = () => {

    // get function
    const get1 = async () => {
        const response = await axios
                            .get('/misc/getPreviousLaunches')
                            .then( res => {
                                console.log(res)
                                console.log(res.data)
                            })
                            .catch( (err) => console.log("Error:", err ) )
    } 

    //comment for now, this should be reading from my database, not from external API.
    // // on render, get posts from backend and display for the user.
    // useEffect( () => {
    //     axios.get("/api/launches").then( (response) =>{
    //         console.log(response.data.results)
    //     })
    // }, []);

    return (
        <div className={HomeCSS.homeContainer}>
            <div className= {HomeCSS.textStyle}>Welcome to your server, Steven! </div>
            
        </div>
    )
}

export default Home
