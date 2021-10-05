import React, { useState, useEffect } from 'react' 
import PostsCSS from "./Posts.module.css"
import axios from   "axios" 
import { Link, useHistory} from 'react-router-dom'

const Posts = () => {
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

            
                
            
    }
    return (
        <div className={PostsCSS.postsPageContainer}>
            <div className= {PostsCSS.textStyle}>Steven, check out these posts. </div>
            <Link to="/createpost">Create Post</Link>
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
                                <button className= {PostsCSS.buttonClass} onClick={()=> handleOnClickDelete(value.id)}> delete me</button>
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Posts
