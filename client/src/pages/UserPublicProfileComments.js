import React, { useState, useEffect,useContext }from 'react'
import {useParams, Link} from "react-router-dom"
import UserPublicProfileCommentsCSS from "./UserPublicProfileComments.module.css"
import axios from   "axios" 
import {AuthContext} from "../App"

const UserPublicProfileComments = () => {
    // use params allows me to fetch params 
    let {UserId } = useParams();
    
    // auth state.
    const {authState, setAuthState} = useContext(AuthContext)

    // user public info
    const [userPublicInfo, setUserPublicInfo] = useState({username: ''})

    // all post data for user.
    const [postData, setPostData] = useState([])
    const [comments, setComments] = useState([])
    const [todayTime, setTodayTime] = useState(new Date())

    // on render, get individual profile data from backend and display for the user.
    useEffect( () => {
        // gets the public profile for user with UserId, from the server.
        axios.get(`/api/users/publicProfile/${UserId}`)
            .then( (response) =>{
                console.log(response.data.username)
                setUserPublicInfo( currentUserPublicInfo => {
                    return {...currentUserPublicInfo, username: response.data.username}});
                // setValidFlag(true)
            })
            .catch( err => {
                // setValidFlag(false);
                console.log("user doesnt exist!")
            }) 
        
        // gets all comments from the server.
        axios.get(`/api/comments/byUserId/${UserId}`)
            .then( (response) =>{
                console.log("comments: ", response.data);
                setComments(response.data);
            })
            .catch( err => {
                console.log("comments dont exist!")
            })

    } , [])
    // calc time posted to display on post body containers!!!
    const postDateToDisplay = (datePosted) => {
        //output 
        let result; 
        // parameters
        const secsInYear = 60*60*24*365;
        const secsInMonth = 60*60*24*30;
        const secsInDay = 60*60*24
        const secsInHour = 60*60
        const secsInMin = 60

        let timeDiff_secs = (todayTime.getTime() - datePosted.getTime()) / 1000.0
        let yearDiff = Math.floor(timeDiff_secs / secsInYear)
        let monthDiff = Math.floor(timeDiff_secs / secsInMonth)
        let daysDiff = Math.floor(timeDiff_secs / secsInDay)
        let hoursDiff = Math.floor(timeDiff_secs / secsInHour)
        let minutesDiff = Math.floor(timeDiff_secs / secsInMin)
        let secondsDiff = Math.floor(timeDiff_secs)
        
        if(yearDiff > 0)
        {
            result = `${yearDiff} years ago`
        }
        else if(monthDiff >0)
        {
            result = `${monthDiff} months ago`
        
        }
        else if (daysDiff >0)
        {
            result = `${daysDiff} days ago`
            
        }
        else if (hoursDiff >0)
        {
            result = `${hoursDiff} hours ago`
            
        }
        else if (minutesDiff >0)
        {
            result = `${minutesDiff} minutes ago`
            
        }
        else if(secondsDiff > 0)
        {
            result = `${secondsDiff} seconds ago`
        }
        else
        {
            result = "0 seconds ago"
        }     
        return result
    }
    

    return (
        <div className={UserPublicProfileCommentsCSS.profilePageContainer}>
            <div className={UserPublicProfileCommentsCSS.textStyle}> {userPublicInfo.username} </div>
            <div>
                <Link className= {UserPublicProfileCommentsCSS.buttonClass}  to = {`/user/${UserId}`} >posts</Link>
                <Link className= {UserPublicProfileCommentsCSS.buttonClass}  to = {`/user/${UserId}/comments`}>comments</Link>
                {(authState.UserId == UserId) ? (<><Link className= {UserPublicProfileCommentsCSS.buttonClass} to = {`/user/${UserId}/settings`}>user settings</Link></>) : ""}
            </div>
            <div className={UserPublicProfileCommentsCSS.commentsBodyContainer}>
                {comments.map((value, key) =>{
                    var datePosted= new Date(value.createdAt)
                    var dateStringPosted =postDateToDisplay(datePosted)
                    let linkToComment = `/blog/${value.PostId}`;
                    let toDisplay = []
                    if(value.contentText)
                    {
                
                        let substrings = value.contentText.split("\n")
                
                        for (let i=0; i < substrings.length; i++)
                        {
                            if(substrings[i] == "")
                            {
                                toDisplay.push(<div> <br></br></div>)
                            }
                            else
                            {
                                toDisplay.push(<div className={UserPublicProfileCommentsCSS.paragraphContent}><p className={UserPublicProfileCommentsCSS.paragraphContent_p}>{substrings[i]}</p></div>)
                            }
                        }
                    }
                    if(value.level > 5)
                    {
                        let num1 = Math.floor(value.level / 5);                        
                        linkToComment = `/blog/${value.PostId}/${value.id}/${5*num1}`;
                    }
                    return (
                        <Link className = {UserPublicProfileCommentsCSS.commentBodyContainer} to={linkToComment} key = {key}>
                            <div className={UserPublicProfileCommentsCSS.commentOuterContainer}>
                                <div className={UserPublicProfileCommentsCSS.commentAuthorContainer}>
                                    <div className={UserPublicProfileCommentsCSS.commentAuthor}> {value.username}</div>   
                                    <div className={UserPublicProfileCommentsCSS.commentTime}> &middot; {dateStringPosted}</div>
                                </div>
                                {/* <div className ={UserPublicProfileCommentsCSS.commentText}> {value.contentText} </div>
                                <div> posted by {value.username}</div> */}
                                <div className={UserPublicProfileCommentsCSS.commentText}> 
                                    {toDisplay} 
                            
                                 </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>      
    )
}

export default UserPublicProfileComments
