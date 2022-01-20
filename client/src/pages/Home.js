import React, { useState, useEffect } from 'react' 
import HomeCSS from "./Home.module.css"
import Button from "../components/Button.js"
import Footer from "../components/Footer"
import axios from   "axios" 
import {Link} from "react-router-dom"

const Home = () => {
    // store launch data in these variables.
    const [launchDataPrevious, setLaunchDataPrevious] = useState([])
    const [launchDataUpcoming, setLaunchDataUpcoming] = useState([])
    const [futureFlag, setFutureFlag]                 = useState([ true])
    const [todayTime, setTodayTime]                   = useState([new Date()])
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
                console.log("ran first useeffect.")
    }, []);
    useEffect ( () => {
                let time = setInterval( () => {
                    setTodayTime(new Date())
                }, 1000)
                console.log("ran second useeffect)")
    }, [])

    const toggleFutureFlag=  () => {
        setFutureFlag(!futureFlag)
    } 

    const calcDeltaTime = (dateMission) => {
        // calc seconds difference first.
        var delta = Math.abs(dateMission - todayTime)/1000
        // defining parameters
        const secondsInADay = 60*60*24
        const secondsInAnHour = 60*60
        const secondsInAMinute = 60
        // calc days difference        
        var daysLeft = Math.floor(delta/secondsInADay)
        delta = delta - daysLeft*secondsInADay 

        // calc hours difference
        var hoursLeft= Math.floor(delta/secondsInAnHour)
        delta = delta - hoursLeft*secondsInAnHour

        // calc minutes difference
        var minutesLeft = Math.floor(delta/secondsInAMinute)
        delta = delta - minutesLeft*secondsInAMinute

        // calc seconds difference
        var secondsLeft = Math.floor(delta)

        // parse for user-friendly output: 
        if(daysLeft< 10)
        {
            daysLeft = "0" + daysLeft.toString()
        }
        if(hoursLeft < 10)
        {
            hoursLeft="0" + hoursLeft.toString()
        }
        if(minutesLeft < 10)
        {
            minutesLeft= "0" + minutesLeft.toString()
        }
        if(secondsLeft<10)
        {
            secondsLeft="0" + secondsLeft.toString()
        }
        const timeLeft ={daysLeft: daysLeft, hoursLeft: hoursLeft, minutesLeft: minutesLeft, secondsLeft: secondsLeft}
        return timeLeft
    }
    return (
        <div className={HomeCSS.homeContainer}>
            <div className= {HomeCSS.textStyle}> {futureFlag ? "Upcoming": "Previous"}</div>
            <div className={HomeCSS.buttonClass} onClick={toggleFutureFlag}> {futureFlag ? "See Previous Launches": "See Upcoming Launches"}</div>
            <div className={HomeCSS.buttonClass}> maybe sort by date</div>
            <div className={HomeCSS.buttonClass}> maybe filter by country</div>
            <div className={`${futureFlag ? HomeCSS.deactivate: ''}`}> 
                {launchDataPrevious.map((value, key) =>{
                    var currDate = new Date(value.launchDate) 
                    var timeLeft = calcDeltaTime(currDate)
                    const options = {timezone: 'EST'}
                    const currDateStr = currDate.toLocaleDateString('en-US' ,options) + ", " + currDate.toLocaleTimeString('en-US', options) + " EST"


                    if(value.imgURL)
                    {
                        return (
                            <div className={HomeCSS.launchItemContainer} key = {key}> 
                                <img className={HomeCSS.imgContainer} src={value.imgURL}/>
                                <div className={HomeCSS.textContainer}>
                                    <div className={HomeCSS.titleContainer}> 
                                        <div className={HomeCSS.titleStyle}>{value.title} </div>
                                        <div className={` ${(value.status == "Go" || value.status=="Success") ? HomeCSS.greenStatusStyle:HomeCSS.redStatusStyle} ${HomeCSS.statusStyle}`}> {value.status} </div>
                                    </div>
                                    {
                                        (value.locationName=="Unknown Location" ) 
                                        ?
                                        ( (value.countryCode != "UNK") ? (<div className={HomeCSS.locationNameStyle}>{value.countryCode}</div>) : "")
                                        :
                                        (<div className={HomeCSS.locationNameStyle}>{value.locationName}</div>) 
                                    }
                                    <div className={`${HomeCSS.padNameStyle} ${ (value.padName == "Unknown Pad") ? HomeCSS.deactivate: ""}`}>{value.padName}</div>
                                    {
                                        (value.mission_description)
                                        ?
                                        (<div className={HomeCSS.descriptionStyle}>{value.mission_description} </div>)
                                        :
                                        ( (value.vehicle_description) ? (<div className={HomeCSS.descriptionStyle}>{value.vehicle_description}</div>) : "")
                                    }   
                                    <div className={HomeCSS.timeLeftStyle2}>  
                                       <div> T+</div>
                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.daysLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Days </div>
                                        </div>
                                        <div className={HomeCSS.timeElementClass}> : </div>
                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.hoursLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Hours </div>
                                        </div>
                                        <div className={HomeCSS.timeElementClass}> : </div>

                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.minutesLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Mins </div>
                                        </div>
                                        <div className={HomeCSS.timeElementClass}> : </div>

                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.secondsLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Secs </div>
                                        </div>
                                    </div>
                                    <div> {currDateStr}</div>
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
                                <div className={HomeCSS.textContainer}>
                                    <div className={HomeCSS.titleContainer}> 
                                        <div className={HomeCSS.titleStyle}>{value.title} </div>
                                        <div className={` ${(value.status == "Go" || value.status=="Success") ? HomeCSS.greenStatusStyle : HomeCSS.redStatusStyle} ${HomeCSS.statusStyle}`}> {value.status} </div>
                                    </div>
                                    {
                                        (value.locationName=="Unknown Location" ) 
                                        ?
                                        ( (value.countryCode != "UNK") ? (<div className={HomeCSS.locationNameStyle}>{value.countryCode}</div>) : "")
                                        :
                                        (<div className={HomeCSS.locationNameStyle}>{value.locationName}</div>) 
                                    }
                                    <div className={`${HomeCSS.padNameStyle}  ${ (value.padName == "Unknown Pad") ? HomeCSS.deactivate: ""}`}>{value.padName}</div>
                                    {
                                        (value.mission_description)
                                        ?
                                        (<div className={HomeCSS.descriptionStyle}>{value.mission_description} </div>)
                                        :
                                        ( (value.vehicle_description) ? (<div className={HomeCSS.descriptionStyle}>{value.vehicle_description}</div>) : "")
                                    }   
                                    <div> {currDateStr}</div>
                                    <div className={HomeCSS.buttnContainer}> 
                                        {(value.vidURL == null) ? "":(<a className={HomeCSS.buttonClass} href ={value.vidURL}> Watch Video</a> )}  
                                        <Link to={`/blog/${value.postId}`} className={HomeCSS.buttonClass}>See Discussion</Link>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    
                })}
            </div> 
            <div className={`${futureFlag ? '': HomeCSS.deactivate}`}> 
                {launchDataUpcoming.map((value, key) =>{
                    var currDate = new Date(value.launchDate) 
                    var timeLeft = calcDeltaTime(currDate)
                    const options = {timezone: 'EST'}
                    const currDateStr = currDate.toLocaleDateString('en-US' ,options) + ", " + currDate.toLocaleTimeString('en-US', options) + " EST"

                    if(value.imgURL)
                    {
                        return (
                            <div className={HomeCSS.launchItemContainer} key = {key}> 
                                <img className={HomeCSS.imgContainer} src={value.imgURL}/>
                                <div className={HomeCSS.textContainer}>
                                    <div className={HomeCSS.titleContainer}> 
                                        <div className={HomeCSS.titleStyle}>{value.title} </div>
                                        <div className={` ${(value.status == "Go" || value.status=="Success") ? HomeCSS.greenStatusStyle:HomeCSS.redStatusStyle} ${HomeCSS.statusStyle}`}> {value.status} </div>
                                    </div> 
                                    {
                                        (value.locationName=="Unknown Location" ) 
                                        ?
                                        ( (value.countryCode != "UNK") ? (<div className={HomeCSS.locationNameStyle}>{value.countryCode}</div>) : "")
                                        :
                                        (<div className={HomeCSS.locationNameStyle}>{value.locationName}</div>) 
                                    }
                                    <div className={` ${HomeCSS.padNameStyle} ${ (value.padName == "Unknown Pad") ? HomeCSS.deactivate: ""}`}>{value.padName}</div>
                                    {
                                        (value.mission_description)
                                        ?
                                        (<div className={HomeCSS.descriptionStyle}>{value.mission_description} </div>)
                                        :
                                        ( (value.vehicle_description) ? (<div className={HomeCSS.descriptionStyle}>{value.vehicle_description}</div>) : "")
                                    }   
                                    <div className={HomeCSS.timeLeftStyle2}>  
                                       <div> T-</div>
                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.daysLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Days </div>
                                        </div>
                                        <div className={HomeCSS.timeElementClass}> : </div>
                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.hoursLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Hours </div>
                                        </div>
                                        <div className={HomeCSS.timeElementClass}> : </div>

                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.minutesLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Mins </div>
                                        </div>
                                        <div className={HomeCSS.timeElementClass}> : </div>

                                        <div className={HomeCSS.timeElementClass}> 
                                            <div> {timeLeft.secondsLeft}</div>
                                            <div className={HomeCSS.subtitleClass}> Secs </div>
                                        </div>
                                    </div>
                                    

                                    <div> {currDateStr}</div>
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
                                <div className={HomeCSS.textContainer}>
                                    <div className={HomeCSS.titleStyle}>{value.title} </div>
                                    <div className={` ${(value.status == "Go" || value.status=="Success") ? HomeCSS.greenStatusStyle:HomeCSS.redStatusStyle} ${HomeCSS.statusStyle}`}> {value.status} </div>
                                    {
                                        (value.locationName=="Unknown Location" ) 
                                        ?
                                        ( (value.countryCode != "UNK") ? (<div className={HomeCSS.locationNameStyle}>{value.countryCode}</div>) : "")
                                        :
                                        (<div className={HomeCSS.locationNameStyle}>{value.locationName}</div>) 
                                    }
                                    <div className={`${HomeCSS.padNameStyle} ${ (value.padName == "Unknown Pad") ? HomeCSS.deactivate: ""}`}>{value.padName}</div>
                                    {
                                        (value.mission_description)
                                        ?
                                        (<div className={HomeCSS.descriptionStyle}>{value.mission_description} </div>)
                                        :
                                        ( (value.vehicle_description) ? (<div className={HomeCSS.descriptionStyle}>{value.vehicle_description}</div>) : "")
                                    }   
                                    <div> {currDateStr}</div>
                                    <div className={HomeCSS.buttnContainer}> 
                                        {(value.vidURL == null) ? "":(<a className={HomeCSS.buttonClass} href ={value.vidURL}> Watch Video</a> )}  
                                        <Link to={`/blog/${value.postId}`} className={HomeCSS.buttonClass}>See Discussion</Link>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
            <Footer/>
        </div>
    )
}

export default Home
