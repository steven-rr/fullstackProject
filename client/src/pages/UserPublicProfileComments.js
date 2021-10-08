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
                    return (
                        <Link className = {UserPublicProfileCommentsCSS.commentBodyContainer} to={`/blog/${value.PostId}`} key = {key}>
                            <div className ={UserPublicProfileCommentsCSS.commentText}> {value.contentText} </div>
                            <div> posted by {value.username}</div>
                        </Link>
                    )
                })}
            </div>
        </div>      
    )
}

export default UserPublicProfileComments
