import React, { useState, useEffect, useContext }from 'react'
import {useParams, Link} from "react-router-dom"
import UserPublicProfileCSS from "./UserPublicProfile.module.css"
import axios from   "axios" 
import {AuthContext} from "../App"

const UserPublicProfile = () => {
    // use params allows me to fetch params 
    let {UserId } = useParams();
    // auth state.
    const {authState, setAuthState} = useContext(AuthContext)

    // user public info
    const [userPublicInfo, setUserPublicInfo] = useState({username: ''})

    // all post data for user.
    const [postData, setPostData] = useState([])

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

        })
        .catch( err => {
            console.log("failure.. user post data")

            // setValidFlag(false);
        })
    } , [])
       

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
                    return (
                        <div className={UserPublicProfileCSS.postContainer} key = {key}>
                            <Link  className={UserPublicProfileCSS.postLinkClass}  to={`/blog/${value.id}`}> 
                                <div className = {UserPublicProfileCSS.postTitle}>{value.title} </div>
                                <div className = {UserPublicProfileCSS.postContent}>{value.contentText} </div>
                                <div className = {UserPublicProfileCSS.postContent}>{value.username} </div>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>      
    )
}

export default UserPublicProfile
