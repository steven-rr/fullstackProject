import React, { useState, useEffect, useContext }from 'react'
import {useParams, Link ,useHistory} from "react-router-dom"
import UserPublicProfileCSS from "./UserPublicProfile.module.css"
import axios from   "axios" 
import {AuthContext} from "../App"
import PostsCSS from "./Posts.module.css"
import { BiUpvote, BiDownvote,BiComment } from "react-icons/bi";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { MdArrowForwardIos } from "react-icons/md";
import { MdOutlineMoreHoriz } from "react-icons/md";
const UserPublicProfile = () => {
    // use params allows me to fetch params 
    let {UserId } = useParams();
    // instantiate history.
    const history = useHistory();
    // auth state.
    const {authState, setAuthState} = useContext(AuthContext)

    // user public info
    const [userPublicInfo, setUserPublicInfo] = useState({username: ''})

    // all post data for user.
    const [postData, setPostData] = useState([])
    const [moreDropdownOn, setMoreDropdown]   = useState([])
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
        
        // gets the post information from the server.
        axios.get(`/api/posts/byUserId/${UserId}`)
        .then( (response) =>{
            console.log("success! user post data")
            setPostData(response.data);
            console.log(response.data);
            // set more dropdown:
            let moredropdownOut = []
            for (let i=0; i < response.data.length; i++)
            {
                moredropdownOut.push(false)
            }
            setMoreDropdown(moredropdownOut)
            })
        .catch( err => {
            console.log("failure.. user post data")

            // setValidFlag(false);
        })
        
    } , [])
    // handle post onclick
    const handlePostOnClick = (id) => {
        console.log("post clicked!")
        history.push(`/blog/${id}`)
    }
    // like a post .
    const handleLike = (e, PostId) => {
        console.log("like clicked!" ) 
        axios  
            .post(`/api/likes/like`, {PostId: PostId})
            .then( (response)=> {
                setPostData(postData.map( (post) => {
                    // look for post to modify like array.
                    if(post.id === PostId) 
                    {   
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.liked)
                        {   
                            // if dislike exists, also remove it before adding on the like. 
                            if(response.data.dislikeExists)
                            {
                                const currentPostDislikes = post.Dislikes;
                                currentPostDislikes.pop();
                                return { ...post, Likes: [...post.Likes , 0 ], Dislikes: currentPostDislikes, liked: true, disliked: false}
                            }
                            // no dislike exists, simply like the post. 
                            else
                            {
                                return { ...post, Likes: [...post.Likes , 0 ], liked:true}
                            }

                        }
                        else
                        {
                            const currentPostLikes = post.Likes;
                            currentPostLikes.pop();
                            return{...post, Likes: currentPostLikes, liked: false}
                        }
                        // if liked, decrement dislikes if necessary.

                    }
                    else
                    {
                        return post;
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
    const handleDislike = (e, PostId) => {
        console.log("dislike clicked!" ) 
        axios  
            .post(`/api/likes/dislike`, {PostId: PostId})
            .then( (response)=> {
                setPostData(postData.map( (post) => {
                    // look for post to modify like array.
                    if(post.id === PostId) 
                    {      
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.disliked)
                        {
                            // if like exists, also remove it before adding on the dislike
                            if(response.data.likeExists)
                            {
                                const currentPostLikes = post.Likes;
                                currentPostLikes.pop();    
                                return{...post, Likes: currentPostLikes,  Dislikes:[...post.Dislikes , 0 ], disliked: true, liked: false}          
                            }
                            else
                            {
                                return { ...post, Dislikes: [...post.Dislikes , 0 ], disliked: true}
                            }
                        }
                        else
                        {
                            const currentPostDislikes = post.Dislikes;
                            currentPostDislikes.pop();
                            return{...post, Dislikes: currentPostDislikes, disliked: false}
                        }
                    }
                    else
                    {
                        return post;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
        e.stopPropagation()
    }
    const handleLoginFromPosts = (e) => {

        setAuthState( currentAuthState=> {
            return { ...currentAuthState, loginOn: !currentAuthState.loginOn}
        })
        e.stopPropagation()
    }
    const handleOnClickDelete = (e, id) => {
        console.log("delete clicked!");
        // send delete request to backend.
        axios
            .delete(`/api/posts/${id}`)
            .then( () => {
                // rerender page by resetting post data. 
                axios.get("/api/posts").then( (response) =>{
                    setPostData(response.data);
                })
            })
            .catch ( () => {
                console.log("delete failed!");
            })
        e.stopPropagation();
    }
    const handleEditClick = (e, postID) => {
        console.log("edit clicked!")
        history.push(`/blog/${postID}/true`)
        e.stopPropagation();
    }
    const handleMoreBlur = (e,idx) => {
        setMoreDropdown(moreDropdownOn.map( (currMoreDropDown, key) => {
            // look for post to modify like array.
            if(key === idx) 
            {     
                currMoreDropDown = false
            }
            return currMoreDropDown;
        }))
        e.stopPropagation();

    }
    const handleMoreClick = (e, idx) => {
        // setMoreDropdown(currState=>!currState)
        console.log("moreDropDown:",moreDropdownOn, idx)
        setMoreDropdown(moreDropdownOn.map( (currMoreDropDown, key) => {
            // look for post to modify like array.
            if(key === idx) 
            {     
                currMoreDropDown = !currMoreDropDown
            }
            return currMoreDropDown;
        }))
        e.stopPropagation();

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
        <div className={UserPublicProfileCSS.profilePageContainer}>
            <div className={UserPublicProfileCSS.textStyle}> {userPublicInfo.username} </div>
            <div>
                <Link className= {UserPublicProfileCSS.buttonClass} to = {`/user/${UserId}`} >posts</Link>
                <Link className= {UserPublicProfileCSS.buttonClass} to = {`/user/${UserId}/comments`}>comments</Link>
                {(authState.UserId == UserId) ? (<><Link className= {UserPublicProfileCSS.buttonClass} to = {`/user/${UserId}/settings`}>user settings</Link></>) : ""}

            </div>
            <div className={UserPublicProfileCSS.postsBodyContainer}>
                {postData.map((value, key) =>{

                    let str = value.createdAt;
                    var datePosted= new Date(str)
                    var dateStringPosted = postDateToDisplay(datePosted)
                    console.log("this is the userpost data for profile: ", value)
                    return (
                        <div className={UserPublicProfileCSS.postContainer}  onClick= {()=>handlePostOnClick(value.id)}  key = {key}>
                            {/* likes */}
                                
                            {authState.authStatus 
                                    ?
                                    // do something
                                    <div className={PostsCSS.desktopLikesContainer}>
                                        <div className={`${value.liked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e,value.id) }>
                                            <BiUpvote className={PostsCSS.likeClass} size="40px" />
                                        </div>
                                        <div className={`${ (value.liked || value.disliked) ? PostsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div>
                                        <div className={`${value.disliked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e,value.id) }>
                                            <BiDownvote className={PostsCSS.likeClass} size="40px" />
                                        </div>
                                    </div>
                                    :
                                    // do something else.
                                    <div className={PostsCSS.desktopLikesContainer}>
                                        <div className={`${value.liked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={(e)=> handleLoginFromPosts(e)}>
                                            <BiUpvote className={PostsCSS.likeClass} size="40px" />
                                        </div>
                                        <div className={`${ (value.liked || value.disliked) ? PostsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div>
                                        <div className={`${value.disliked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={(e)=> handleLoginFromPosts(e)}>
                                            <BiDownvote className={PostsCSS.likeClass} size="40px" />
                                        </div>
                                    </div>  
                                    }
                                {/* <div className={PostsCSS.postContentClass}> */}
                                    {/* Text */}
                                    {/* <Link  className={PostsCSS.postMainTextClass}  to={`/blog/${value.id}`}>  */}
                                {/* content */}
                                <div className={PostsCSS.postContentClass} >
                                    {/* Text */}
                                    <div  className={PostsCSS.postMainTextClass}  > 
                                        <div className = {PostsCSS.postAuthor}>{`Posted by ${value.username} ${dateStringPosted}`} </div>
                                        <div className = {PostsCSS.postTitle}>
                                            {value.title.length > 300 ? value.title.substring(0, 300) + "..." : value.title} 
                                        </div>
                                        <div className = {PostsCSS.postContent}>
                                            {value.contentText.length > 800 ? value.contentText.substring(0,800) + "..." : value.contentText} 
                                        </div>

                                    </div>
                                    {/* Buttons */}
                                    <div className={PostsCSS.buttonListClass}> 
                                        {/* upvotes buttons */}
                                        <div className={PostsCSS.mobileLikesContainer}>
                                            <div className={`${value.liked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e, value.id) }>
                                                <BiUpvote className={PostsCSS.likeClass} size="40px" />
                                            </div>
                                            <div className={`${ (value.liked || value.disliked) ? PostsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div>
                                            <div className={`${value.disliked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e, value.id) }>
                                                <BiDownvote className={PostsCSS.likeClass} size="40px" />
                                            </div>
                                        </div>

                                        {/* comments button */}
                                        <Link to = {`/blog/${value.id}`} className= {PostsCSS.commentButtnElementBackgroundClass} > 
                                                <BiComment size="30px"/> 
                                                <div className={PostsCSS.buttnDisplayTextShort}> {value.commentCounter} </div>
                                                <div className={PostsCSS.buttnDisplayTextLong}> {value.commentCounter} comments</div>
                                        </Link>
                                        {/* delete button */}
                                        {(authState.UserId === value.UserId) 
                                        ?   
                                        (<button className= {PostsCSS.buttnElementBackgroundClass} onClick={(e)=> handleOnClickDelete(e, value.id)}>  
                                                <AiOutlineDelete  size="30px"/>
                                                <div className={PostsCSS.buttnDisplayTextLong}>Delete Post </div>     
                                        </button>) 
                                        : 
                                        ""
                                        }
                                        {/* edit button */}
                                        {(authState.UserId === value.UserId) 
                                        ?   
                                        (<button className= {PostsCSS.buttnElementBackgroundClass} onClick={(e) => handleEditClick(e, value.id)} > 
                                                <FiEdit2 size="30px"/>
                                                <div className={PostsCSS.buttnDisplayTextLong}> Edit Post</div>
                                        </button>) 
                                        : 
                                        ""
                                        }
                                        {/* more button: */}
                                        {(authState.UserId === value.UserId) 
                                        ?
                                        (<div tabIndex="0" className= {PostsCSS.moreBarButtnContainer} onBlur={(e)=> handleMoreBlur(e, key)}>
                                            <button className= {PostsCSS.moreButtnElementBackgroundClass} onClick={(e) => handleMoreClick(e, key)} > 
                                                <MdOutlineMoreHoriz size="30px"/>
                                            </button>
                                            <div className={`${moreDropdownOn[key] ? "":PostsCSS.deactivate} ${PostsCSS.desktopMoreBarDropDownMenu} `} > 
                                                <button className= {PostsCSS.buttnElementBackgroundClass2} onMouseDown={(e)=> handleOnClickDelete(e, value.id)} >  
                                                        <AiOutlineDelete  size="30px"/>
                                                        <div className={PostsCSS.buttnDisplayTextShort}>Delete</div>     
                                                </button>
                                                
                                                <button className= {PostsCSS.buttnElementBackgroundClass2} onMouseDown={(e) => handleEditClick(e, value.id)}> 
                                                        <FiEdit2 size="30px"/>
                                                        <div className={PostsCSS.buttnDisplayTextShort}>Edit</div>
                                                </button>
                                            </div>
                                        </div>)
                                        :
                                        ""
                                        }
                                        
                                        
                                    </div>
                                </div>
                        </div>
                    )
                })}
            </div>
        </div>      
    )
}

export default UserPublicProfile
