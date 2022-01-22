import React, { useState, useEffect } from 'react' 
import HomeCSS from "./Home.module.css"
import Button from "../components/Button.js"
import Footer from "../components/Footer"
import axios from   "axios" 
import {Link} from "react-router-dom"
import { MdArrowForwardIos } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";


const Home = () => {
    // store launch data in these variables.
    const [launchData, setLaunchData ]                = useState([])
    const [currentLocation  , setCurrentLocation]     = useState("Global")
    const [currentAbbrev  , setCurrentAbbrev]         = useState("Global")
    const [currentLocations  , setCurrentLocations]   = useState([])
    const [futureFlag, setFutureFlag]                 = useState("Y")
    
    const [showAllFlag, setShowAllFlag]                 = useState([false])
    const [todayTime, setTodayTime]                   = useState([new Date()])
    const [filterLocationOn, setFilterLocationOn]     = useState(false)

    const [timeDropdownOn, setTimeDropdown]           = useState(false)
    const [timingElementActive, setTimingElementActive] = useState("1")
    const [currentTimingName, setCurrentTimingName]   = useState("Future")
    const [orderDropdownOn, setOrderDropdown]           = useState(false)
    const [orderElementActive, setOrderingElementActive] = useState("1")
    const [currentOrderingName, setCurrentOrderingName]   = useState("Recent")


    // }
    //on render, get launch data from backend and display for the user.
    useEffect( async () => {
                await axios
                        .get("/api/launches/previous")
                        .then(  (response) =>{
                            
                            setLaunchData( (prevState) => {
                                return[...prevState, ...response.data]
                            })
                            

                        })
                        .catch( (err) => {
                            console.log("ERROR in Home.js: ", err)
                        })
                await axios 
                        .get("/api/launches/upcoming")
                        .then(  (response) =>{
                            setLaunchData( (prevState) => {
                                return[...prevState, ...response.data]
                            })

                            
                        })
                        .catch( (err) => {
                            console.log("ERROR in Home.js: ", err)
                        }) 
                console.log("launchDataGeneral!: " ,launchData)

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
    
 
    
    
    const handleOrderingClick = () => {
        setOrderDropdown(currState=>!currState)
    }
    const handleOrderingElementClick = (e) => {
        setOrderDropdown(false)
        setOrderingElementActive(e.currentTarget.dataset.div_id)
        // recent. 
        if(e.currentTarget.dataset.div_id == "1")
        {
            launchData.sort( (a,b) => {
                let todaySecs= todayTime/1000
                let deltaTimeB = Math.abs(b.launchSeconds - todaySecs)
                let deltaTimeA = Math.abs(a.launchSeconds - todaySecs)
                if(deltaTimeA > deltaTimeB)
                {
                    return 1;
                }
                else if(deltaTimeA < deltaTimeB)
                {
                    return -1;
                } 
                else
                {   
                    return 0;
                }
            })
            setCurrentOrderingName("Recent")
        }
        // distant
        else if (e.currentTarget.dataset.div_id == "2")
        {
            launchData.sort( (a,b) => {
                let todaySecs= todayTime/1000
                let deltaTimeB = Math.abs(b.launchSeconds - todaySecs)
                let deltaTimeA = Math.abs(a.launchSeconds - todaySecs)
                if(deltaTimeA < deltaTimeB)
                {
                    return 1;
                }
                else if(deltaTimeA > deltaTimeB)
                {
                    return -1;
                } 
                else
                {   
                    return 0;
                }
            })
            setCurrentOrderingName("Distant")
        }
        // oldest 
        else if(e.currentTarget.dataset.div_id == "3")
        {
            launchData.sort( (a,b) => a.launchSeconds - b.launchSeconds) 
            setCurrentOrderingName("Oldest")
        }
        // newest
        else if(e.currentTarget.dataset.div_id == "4")
        {
            launchData.sort( (a,b) => b.launchSeconds - a.launchSeconds) 
            setCurrentOrderingName("Newest")
        }
        else if(e.currentTarget.dataset.div_id == "5")
        {
            launchData.sort( (a,b)=> b.likeCounter - a.likeCounter ) 
            setOrderingElementActive(e.currentTarget.dataset.div_id)
            setCurrentOrderingName("Top")
        }
            
    }
   

    const handleTimingClick = () => {
        setTimeDropdown(currState=>!currState)
    }
    const handleTimingElementClick = (e) => {
        setTimingElementActive(e.currentTarget.dataset.div_id)
        setTimeDropdown(false)
        if(e.currentTarget.dataset.div_id == "1")
        {
            setFutureFlag("Y")
            setShowAllFlag(false)
            setCurrentTimingName("Future")
        }
        else if ( e.currentTarget.dataset.div_id == "2")
        {
            setFutureFlag("N")
            setShowAllFlag(false)
            setCurrentTimingName("Past")

        }
        else
        {   
            setShowAllFlag(true)
            setCurrentTimingName("All")

        }
    }

    const handleLocationClick = () => {
        setFilterLocationOn(!filterLocationOn)
    }
    const handleLocationElementClick = (value) => {
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
        else if(value =="Global")
        {
            countryCode = "Global"
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
            <div className= {HomeCSS.headerStyle}> { (showAllFlag) ? "All Launches": ( (futureFlag == "Y") ? "Future Launches" : "Previous Launches")}</div>
            {/* button bar */}
            <div className={HomeCSS.buttnBarContainer}>
                {/* future button */}
                <div className={HomeCSS.locationButtnContainer}>
                    <div className={`${HomeCSS.buttnBarButtn}` } onClick={() => handleTimingClick()}>
                        <div className={`${HomeCSS.buttnBar_text}  `} > {currentTimingName}  </div>
                        {/* <RiArrowDropDownLine size="40px" /> */}
                        <div className={HomeCSS.iconRotate}>
                            <MdArrowForwardIos />

                        </div>
                        
                    </div>
                    <div className={`${timeDropdownOn ? "":HomeCSS.deactivate} ${HomeCSS.locationDropDownMenu} `}> 
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (timingElementActive == "1" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`} data-div_id="1" onClick={(e) => handleTimingElementClick(e)}> Future </div>
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (timingElementActive == "2" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`} data-div_id="2" onClick={(e) => handleTimingElementClick(e)}> Past </div>
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (timingElementActive == "3" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`} data-div_id="3" onClick={(e) => handleTimingElementClick(e)}> All </div>

                    </div>
                </div>

                {/* ordering button */}
                <div className={HomeCSS.locationButtnContainer}>
                    <div className={`${HomeCSS.buttnBarButtn}` } onClick={() => handleOrderingClick()}>
                        <div className={`${HomeCSS.buttnBar_text}   `} >  {currentOrderingName}  </div>
                        <div className={HomeCSS.iconRotate}>
                            <MdArrowForwardIos />
                        </div>
                    </div>
                    <div className={`${orderDropdownOn ? "":HomeCSS.deactivate} ${HomeCSS.locationDropDownMenu} `}> 
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (orderElementActive == "1" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`}  data-div_id="1" onClick={(e) => handleOrderingElementClick(e)}> Recent </div>
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (orderElementActive == "2" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`}  data-div_id="2" onClick={(e) => handleOrderingElementClick(e)}> Distant </div>
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (orderElementActive == "3" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`}  data-div_id="3" onClick={(e) => handleOrderingElementClick(e)}> Oldest </div>
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (orderElementActive == "4" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`}  data-div_id="4" onClick={(e) => handleOrderingElementClick(e)}> Newest </div>
                        <div className={`${HomeCSS.locationDropDownMenuElement} ${ (orderElementActive == "5" ) ? HomeCSS.locationDropDownMenuElement_active : ""}`}  data-div_id="5" onClick={(e) => handleOrderingElementClick(e)}> Top </div>
                    </div>
                </div>
                {/* location button */}
                <div className={HomeCSS.locationButtnContainer}>
                    <div className={`${HomeCSS.buttnBarButtn}` } onClick={() => handleLocationClick()}>
                        <div> 
                            <MdOutlineLocationOn color="white" size="30px"/>
                        </div>
                        
                        <div className={`${HomeCSS.buttnBar_text} `}> {currentLocation} </div>
                    </div>

                    <div className={`${filterLocationOn ? "":HomeCSS.deactivate} ${HomeCSS.locationDropDownMenu} `}> 
                        
                        {currentLocations.map( (value, key) => {    
                            return( <div key={key} className={`${HomeCSS.locationDropDownMenuElement} ${(value == currentLocation) ? HomeCSS.locationDropDownMenuElement_active: ""}`} onClick={() => handleLocationElementClick(value)} > {value} </div>)
                        })}
                    </div>
                </div> 
            </div>
            <div className={HomeCSS.launchItemsContainer}> 

                {launchData.map((value, key) =>{
                    if( (value.countryCode == currentAbbrev || currentAbbrev == "Global") && ( (value.futureFlag == futureFlag) || showAllFlag ))
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
                                            <div> {`${value.futureFlag == "Y" ? "T-": "T+"}`}</div>
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
                                        <div className={HomeCSS.timeLeftStyle2}>  
                                            <div> {`${value.futureFlag == "Y" ? "T-": "T+"}`}</div>
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
                    }
                    
                    
                })}
            </div> 
            <Footer/>
        </div>
    )
}

export default Home
