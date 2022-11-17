import React, { useState, useEffect,useContext }from 'react'
import {useParams, Link, useHistory} from "react-router-dom"
import UserPublicProfileCommentsCSS from "./UserPublicProfileComments.module.css"
import { BiUpvote, BiDownvote,BiComment } from "react-icons/bi";
import axios from   "axios" 
import {AuthContext} from "../App"

const UserPublicProfileComments = () => {
    // use params allows me to fetch params 
    let {UserId } = useParams();
    
    // instantiate history
    const history = useHistory();

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
                setComments(response.data);
            })
            .catch( err => {
                console.log("comments dont exist!")
            })

    } , [])

    // like a post .
    const handleLike = (e, comment) => {
        e.stopPropagation()
        console.log("like clicked!" ) 
        axios  
            .post(`/api/likes/likeComment`, {CommentId: comment.id})
            .then( (response)=> {
                setComments(comments.map( (currComment) => {
                    // look for post to modify like array.
                    if(currComment.id === comment.id) 
                    {   
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.liked)
                        {   
                            // if dislike exists, also remove it before adding on the like. 
                            if(response.data.dislikeExists)
                            {
                                const currentCommentDislikes = currComment.Dislikes;
                                currentCommentDislikes.pop();
                                return { ...currComment, Likes: [...currComment.Likes , 0 ], Dislikes: currentCommentDislikes, liked: true, disliked: false}
                            }
                            // no dislike exists, simply like the post. 
                            else
                            {
                                return { ...currComment, Likes: [...currComment.Likes , 0 ], liked:true}
                            }

                        }
                        else
                        {
                            const currentCommentLikes = currComment.Likes;
                            currentCommentLikes.pop();
                            return{...currComment, Likes: currentCommentLikes, liked: false}
                        }
                        // if liked, decrement dislikes if necessary.

                    }
                    else
                    {
                        return currComment;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
        // prevent post from linking.
        e.stopPropagation()
    }
    // dislike a post .
    const handleDislike = (e, comment) => {
        console.log("dislike clicked!" ) 
        axios  
            .post(`/api/likes/dislikeComment`, {CommentId: comment.id})
            .then( (response)=> {
                setComments(comments.map( (currComment) => {
                    // look for post to modify like array.
                    if(currComment.id === comment.id) 
                    {      
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.disliked)
                        {
                            // if like exists, also remove it before adding on the dislike
                            if(response.data.likeExists)
                            {
                                const currentCommentLikes = currComment.Likes;
                                currentCommentLikes.pop();    
                                return{...currComment, Likes: currentCommentLikes,  Dislikes:[...currComment.Dislikes , 0 ], disliked: true, liked: false}          
                            }
                            else
                            {
                                return { ...currComment, Dislikes: [...currComment.Dislikes , 0 ], disliked: true}
                            }
                        }
                        else
                        {
                            const currentCommentDislikes = currComment.Dislikes;
                            currentCommentDislikes.pop();
                            return{...currComment, Dislikes: currentCommentDislikes, disliked: false}
                        }
                    }
                    else
                    {
                        return currComment;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
        e.stopPropagation()
    }

    const handleCommentClick = (e, linkToComment)=>{
        history.push(linkToComment)

    }
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
                {comments.map((value, index) =>{
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
                        <div className = {UserPublicProfileCommentsCSS.commentBodyContainer} onClick={(e) => handleCommentClick(e, linkToComment)} key={value.id}>
                            <div className={UserPublicProfileCommentsCSS.commentOuterContainer} key={value.id}>
                                <div className={UserPublicProfileCommentsCSS.commentAuthorContainer}>
                                    <div className={UserPublicProfileCommentsCSS.commentAuthor}> {value.username}</div>   
                                    <div className={UserPublicProfileCommentsCSS.commentTime}> &middot; {dateStringPosted}</div>
                                </div>
                                {/* <div className ={UserPublicProfileCommentsCSS.commentText}> {value.contentText} </div>
                                <div> posted by {value.username}</div> */}
                                <div className={UserPublicProfileCommentsCSS.commentText}> 
                                    {toDisplay} 
                            
                                 </div>
                                <div className={UserPublicProfileCommentsCSS.commentButtnContainer} key={value.id}>
                                    <div className={UserPublicProfileCommentsCSS.mobileLikesContainer}>
                                        <div className={`${value.liked ? UserPublicProfileCommentsCSS.likeBackgroundClass_active: ""}  ${UserPublicProfileCommentsCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e, value) }>
                                            <BiUpvote className={UserPublicProfileCommentsCSS.likeClass} size="30px" />
                                        </div>
                                        <div className={`${ (value.liked || value.disliked) ? UserPublicProfileCommentsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div>

                                        <div className={`${value.disliked ? UserPublicProfileCommentsCSS.likeBackgroundClass_active: ""} ${UserPublicProfileCommentsCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e, value)}>
                                            <BiDownvote className={UserPublicProfileCommentsCSS.likeClass} size="30px" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>      
    )
}

export default UserPublicProfileComments
