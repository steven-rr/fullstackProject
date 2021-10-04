import React, { useState, useEffect } from 'react' 
import PostsCSS from "./Posts.module.css"
import axios from   "axios" 
import { Link} from 'react-router-dom'

const Posts = () => {
    const [postData, setPostData] = useState([])

    // on render, get posts from backend and display for the user.
    useEffect( () => {
        axios.get("/api/posts").then( (response) =>{
            setPostData(response.data);
        })
    }, []);

    return (
        <div className={PostsCSS.postsPageContainer}>
            <div className= {PostsCSS.textStyle}>Steven, check out these posts. </div>
            <Link to="/createpost">Create Post</Link>
            <div className={PostsCSS.postsBodyContainer}>
                {postData.map((value, key) =>{
                    return (
                        <Link className={PostsCSS.postContainer} key = {key} to={`/blog/${value.id}`}> 
                            <div className = {PostsCSS.postTitle}>{value.title} </div>
                            <div className = {PostsCSS.postContent}>{value.contentText} </div>
                            <div className = {PostsCSS.postContent}>{value.username} </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default Posts
