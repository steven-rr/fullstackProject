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
    const [currentLocation  , setCurrentLocation]     = useState("Everywhere")
    const [currentAbbrev  , setCurrentAbbrev]         = useState("Everywhere")
    const [currentLocations  , setCurrentLocations]   = useState([])
    const [futureFlag, setFutureFlag]                 = useState([ true])
    const [todayTime, setTodayTime]                   = useState([new Date()])
    const [sortByLikesFlag, setSortByLikesFlag]       = useState(false)
    const [sortFromTodayFlag, setSortFromTodayFlag]   = useState(true)
    const [filterLocationOn, setFilterLocationOn]     = useState(false)

    // }
    //on render, get launch data from backend and display for the user.
    useEffect( async () => {
                await axios
                        .get("/api/launches/previous")
                        .then(  (response) =>{
                            setLaunchDataPrevious(response.data);
                        })
                        .catch( (err) => {
                            console.log("ERROR in Home.js: ", err)
                        })
                await axios 
                        .get("/api/launches/upcoming")
                        .then(  (response) =>{
                            setLaunchDataUpcoming(response.data);
                        })
                        .catch( (err) => {
                            console.log("ERROR in Home.js: ", err)
                        }) 
                
                console.log("ran first useeffect.")
    }, []);
    useEffect( async () => {
                await axios
                        .get("/api/launches/uniqueCountries")
                        .then( (response) => {
                            let countryCodeArray = [];
                            
                            for (var i = 0; i < response.data.length; i++) 
                            {   
                                countryCodeArray.push(response.data[i].countryName)
                            }
                            setCurrentLocations( prevState => {
                                return countryCodeArray
                            })


                        })
                        .catch( (err) => {
                            console.log("error in unique countries: ", err)
                        })
    }, [])
    useEffect ( () => {
                let time = setInterval( () => {
                    setTodayTime(new Date())
                }, 1000)
                console.log("ran second useeffect)")

    }, [])
    
 
    const toggleToFuture=  () => {
        setFutureFlag(true)
    } 
    const toggleToPast=  () => {
        setFutureFlag(false)
    } 
    const toggleSortFromTodayFlag = () => {
        if(sortFromTodayFlag)
        {
            launchDataPrevious.sort((a,b)=>a.launchSeconds - b.launchSeconds)
            launchDataUpcoming.sort((a,b)=>b.launchSeconds - a.launchSeconds)
        }
        else
        {
            launchDataPrevious.sort((a,b)=>b.launchSeconds - a.launchSeconds)
            launchDataUpcoming.sort((a,b)=>a.launchSeconds - b.launchSeconds)

        }
        setSortFromTodayFlag(!sortFromTodayFlag)
        setSortByLikesFlag(false)
    }
    const toggleSortByLikesFlag=  () => {
        
        // sort array
        if(sortByLikesFlag == false)
        {
            launchDataPrevious.sort((a,b)=> b.likeCounter - a.likeCounter)
            launchDataUpcoming.sort((a,b)=> b.likeCounter - a.likeCounter)
        }
        else
        {
            console.log("OFF!")
            console.log("off!", sortByLikesFlag)
        }
        // sort by likes
        setSortByLikesFlag(!sortByLikesFlag)
        setSortFromTodayFlag(true)

    } 
    const toggleFilterLocationFlag = () => {
        setFilterLocationOn(!filterLocationOn)
    }
    const handleFilterByLocation = (value) => {
        let countryCode;

        if(value == "USA")
        {
            countryCode = "USA" 
        }
        else if(value== "Kazakhstan")
        {
            countryCode = "KAZ"
        }
        else if(value== "China")
        {
            countryCode = "CHN"
        }
        else if(value== "Russia")
        {
            countryCode = "RUS"
        }
        else if(value== "India")
        {
            countryCode = "IND"
        }
        else if(value== "Iran")
        {
            countryCode = "IRN"
        }
        else if(value== "Unknown")
        {
            countryCode = "UNK"
        }
        else if(value =="Everywhere")
        {
            countryCode = "Everywhere"
        }
        else
        {
            countryCode = "NA"
        }
        setCurrentLocation(value)
        setCurrentAbbrev(countryCode)
        setFilterLocationOn(false)
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
            <div className= {HomeCSS.headerStyle}> {futureFlag ? "Upcoming Launches": "Previous Launches"}</div>
            <div className={HomeCSS.buttnBarContainer}>
                <div className={`${HomeCSS.buttnBarButtn} ${futureFlag ? HomeCSS.buttnBarButtn_active: ""}`} onClick={toggleToFuture}> Future </div>
                <div className={`${HomeCSS.buttnBarButtn} ${futureFlag ? "": HomeCSS.buttnBarButtn_active}`} onClick={toggleToPast}> Past </div>
                <div className={HomeCSS.locationButtnContainer}>
                    <div className={`${HomeCSS.buttnBarButtn}`} onClick={() => toggleFilterLocationFlag()} > {currentLocation} </div>
                    <div className={`${filterLocationOn ? "":HomeCSS.deactivate} ${HomeCSS.locationDropDownMenu} `}> 
                        
                        {currentLocations.map( (value, key) => {
                            return( <div key={key} className={HomeCSS.locationDropDownMenuElement} onClick={() => handleFilterByLocation(value)} > {value} </div>)
                        })}
                    </div>
                </div> 
                <div className={`${HomeCSS.buttnBarButtn} ${sortFromTodayFlag ? "": HomeCSS.buttnBarButtn_active}`} onClick={toggleSortFromTodayFlag} > Reverse Sort </div>
                <div className={`${HomeCSS.buttnBarButtn} ${sortByLikesFlag ? HomeCSS.buttnBarButtn_active:"" }`} onClick={toggleSortByLikesFlag}> Sort by Likes </div>
            </div>
            <div className={`${futureFlag ? HomeCSS.deactivate: HomeCSS.launchItemsContainer}`}> 
                {launchDataPrevious.map((value, key) =>{
                    if(value.countryCode == currentAbbrev || currentAbbrev == "Everywhere")
                    {
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
                                                <div> {(timeLeft.daysLeft) ? timeLeft.daysLeft : "--"}</div>
                                                <div className={HomeCSS.subtitleClass}> Days </div>
                                            </div>
                                            <div className={HomeCSS.timeElementClass}> : </div>
                                            <div className={HomeCSS.timeElementClass}> 
                                                <div> {(timeLeft.hoursLeft) ? timeLeft.hoursLeft:"--"}</div>
                                                <div className={HomeCSS.subtitleClass}> Hours </div>
                                            </div>
                                            <div className={HomeCSS.timeElementClass}> : </div>

                                            <div className={HomeCSS.timeElementClass}> 
                                                <div> {(timeLeft.minutesLeft) ? timeLeft.minutesLeft : "--"}</div>
                                                <div className={HomeCSS.subtitleClass}> Mins </div>
                                            </div>
                                            <div className={HomeCSS.timeElementClass}> : </div>

                                            <div className={HomeCSS.timeElementClass}> 
                                                <div> {(timeLeft.secondsLeft) ? timeLeft.secondsLeft : "--"}</div>
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
                    }
                    
                    
                })}
            </div> 
            <div className={`${futureFlag ? HomeCSS.launchItemsContainer: HomeCSS.deactivate}`}> 
                {launchDataUpcoming.map((value, key) =>{
                    if(value.countryCode == currentAbbrev || currentAbbrev == "Everywhere") 
                    {
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
                                                <div> {(timeLeft.daysLeft) ? timeLeft.daysLeft : "--"}</div>
                                                <div className={HomeCSS.subtitleClass}> Days </div>
                                            </div>
                                            <div className={HomeCSS.timeElementClass}> : </div>
                                            <div className={HomeCSS.timeElementClass}> 
                                                <div> {(timeLeft.hoursLeft) ? timeLeft.hoursLeft:"--"}</div>
                                                <div className={HomeCSS.subtitleClass}> Hours </div>
                                            </div>
                                            <div className={HomeCSS.timeElementClass}> : </div>

                                            <div className={HomeCSS.timeElementClass}> 
                                                <div> {(timeLeft.minutesLeft) ? timeLeft.minutesLeft : "--"}</div>
                                                <div className={HomeCSS.subtitleClass}> Mins </div>
                                            </div>
                                            <div className={HomeCSS.timeElementClass}> : </div>

                                            <div className={HomeCSS.timeElementClass}> 
                                                <div> {(timeLeft.secondsLeft) ? timeLeft.secondsLeft : "--"}</div>
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
                    }
                })}
            </div>
            <Footer/>
        </div>
    )
}

export default Home
