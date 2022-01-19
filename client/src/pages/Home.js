import React, { useState, useEffect } from 'react' 
import HomeCSS from "./Home.module.css"
import Button from "../components/Button.js"
import axios from   "axios" 
import {Link} from "react-router-dom"

const Home = () => {
    // store launch data in these variables.
    const [launchDataPrevious, setLaunchDataPrevious] = useState([])
    const [launchDataUpcoming, setLaunchDataUpcoming] = useState([])
    const [futureFlag, setFutureFlag]                 = useState([ true])
    //on render, get launch data from backend and display for the user.
    useEffect( async () => {
                await axios
                        .get("/api/launches/previous")
                        .then( (response) =>{
                            setLaunchDataPrevious(response.data);
                        })
                        .catch( (err) => {
                            console.log("ERROR in Home.js: ", err)
                        })
                await axios 
                        .get("/api/launches/upcoming")
                        .then( (response) =>{
                            setLaunchDataUpcoming(response.data);
                        })
                        .catch( (err) => {
                            console.log("ERROR in Home.js: ", err)
                        }) 
    }, []);

    const toggleFutureFlag=  () => {
        setFutureFlag(!futureFlag)
    } 


    return (
        <div className={HomeCSS.homeContainer}>
            <div className= {HomeCSS.textStyle}>Welcome to your server, Steven! </div>
            <div className= {HomeCSS.textStyle}> {futureFlag ? "Upcoming": "Previous"}</div>
            <div className={HomeCSS.buttonClass} onClick={toggleFutureFlag}> {futureFlag ? "See Previous Launches": "See Upcoming Launches"}</div>
            <div className={HomeCSS.buttonClass}> maybe sort by date</div>
            <div className={HomeCSS.buttonClass}> maybe filter by country</div>
            <div className={`${futureFlag ? HomeCSS.deactivate: ''}`}> 
                {launchDataPrevious.map((value, key) =>{
                    if(value.imgURL)
                    {
                        return (
                            <div className={HomeCSS.launchItemContainer} key = {key}> 
                                <img className={HomeCSS.imgContainer} src={value.imgURL}/>
                                <div className={HomeCSS.textContainer}>
                                    <div className={HomeCSS.titleStyle}>{value.title} </div>
                                    <div>{value.description} </div>
                                    <div> {value.launchDate}</div>
                                    <div className={HomeCSS.buttnContainer}> 
                                        {(value.vidURL == null) ? "":(<a className={HomeCSS.buttonClass} href ={value.vidURL}> Watch Video</a> )}  
                                        <Link to={`/blog/${value.postId}`} className={HomeCSS.buttonClass}>See Discussion</Link>
                                    </div>
                                </div>
                            </div>
                            
                        )
                    }
                    else
                    {
                        return ( 
                            <div className={HomeCSS.launchItemContainer} key = {key}> 
                                <div className={HomeCSS.titleStyle}>{value.title} </div>
                                <div>{value.description} </div>
                                <div> {value.launchDate}</div>
                                <div className={HomeCSS.buttnContainer}> 
                                    {(value.vidURL == null) ? "":(<a className={HomeCSS.buttonClass} href ={value.vidURL}> Watch Video</a> )}  
                                    <Link to={`/blog/${value.postId}`} className={HomeCSS.buttonClass}>See Discussion</Link>
                                </div>
                            </div>
                        )
                    }
                    
                })}
            </div> 
            <div className={`${futureFlag ? '': HomeCSS.deactivate}`}> 
                {launchDataUpcoming.map((value, key) =>{
                    if(value.imgURL)
                    {
                        return (
                            <div className={HomeCSS.launchItemContainer} key = {key}> 
                                <img className={HomeCSS.imgContainer} src={value.imgURL}/>
                                <div className={HomeCSS.textContainer}>

                                    <div className={HomeCSS.titleStyle}>{value.title} </div>
                                    <div>{value.description} </div>
                                    <div> {value.launchDate}</div>
                                    <div className={HomeCSS.buttnContainer}> 
                                        {(value.vidURL == null) ? "":(<a className={HomeCSS.buttonClass} href ={value.vidURL}> Watch Video</a> )}
                                        <Link to={`/blog/${value.postId}`}className={HomeCSS.buttonClass}>See Discussion</Link>
                                    </div>
                                </div>
                            </div>   
                        )
                    }
                    else
                    {
                        return ( 
                            <div className={HomeCSS.launchItemContainer} key = {key}> 
                                <div className={HomeCSS.titleStyle}>{value.title} </div>
                                <div>{value.description} </div>
                                <div> {value.launchDate}</div>
                                <div className={HomeCSS.buttnContainer}> 
                                    {(value.vidURL == null) ? "":(<a className={HomeCSS.buttonClass} href ={value.vidURL}> Watch Video</a> )}  
                                    <Link to={`/blog/${value.postId}`} className={HomeCSS.buttonClass}>See Discussion</Link>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    )
}

export default Home
