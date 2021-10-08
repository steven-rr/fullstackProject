import React, { useState, useEffect, useContext } from 'react' 
import PostsCSS from "./Posts.module.css"
import axios from   "axios" 
import { Link, useHistory} from 'react-router-dom'
import {AuthContext} from "../App"

const Posts = () => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)

    // instantiate history.
    const history = useHistory();
    
    // use state.
    const [postData, setPostData] = useState([])

    // on render, get posts from backend and display for the user.
    useEffect( () => {
        axios.get("/api/posts").then( (response) =>{
            setPostData(response.data);
        })
    }, []);

    const handleOnClickComments = () => {
        console.log("button clicked!");
    }
    const handleOnClickDelete = (id) => {
        console.log("button clicked!");
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

            
                
            
    }
    return (
        <div className={PostsCSS.postsPageContainer}>
            <div className= {PostsCSS.textStyle}>Steven, check out these posts. </div>
            {authState.authStatus ? (<><Link to="/createpost">Create Post</Link> </>) : <Link to="/login">Create Post</Link>}
            
            <div className={PostsCSS.postsBodyContainer}>
                {postData.map((value, key) =>{
                    return (
                        <div className={PostsCSS.postContainer} key = {key}>
                            <Link  className={PostsCSS.postLinkClass}  to={`/blog/${value.id}`}> 
                                <div className = {PostsCSS.postTitle}>{value.title} </div>
                                <div className = {PostsCSS.postContent}>{value.contentText} </div>
                                <div className = {PostsCSS.postContent}>{value.username} </div>
                            </Link>
                            <div className={PostsCSS.buttonListClass}> 
                                <Link to = {`/blog/${value.id}`} className= {PostsCSS.buttonClass} > comments </Link>
                                {(authState.UserId === value.UserId) ?   (<div><button className= {PostsCSS.buttonClass} onClick={()=> handleOnClickDelete(value.id)}> delete me</button><button> editpost</button></div>) : ""}
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Posts
