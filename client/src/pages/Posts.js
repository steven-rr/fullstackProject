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
            console.log("GETTING POSTS!!!!: " ,response.data);

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
    // like a post .
    const handleLike = (PostId) => {
        console.log("like clicked!" ) 
        axios  
            .post(`/api/likes/`, {PostId: PostId})
            .then( (response)=> {
                setPostData(postData.map( (post) => {
                    // look for post to modify like array.
                    if(post.id === PostId) 
                    {   
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.liked)
                        {
                            return { ...post, Likes: [...post.Likes , 0 ]}
                        }
                        else
                        {
                            const currentPostLikes = post.Likes;
                            currentPostLikes.pop();
                            return{...post, Likes: currentPostLikes}
                        }
                        
                    }
                    else
                    {
                        return post;
                    }
                }))
                console.log(response.data)})
            .catch( (err) => {
                console.log(err);
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
                                {(authState.UserId === value.UserId) ?   (<><button className= {PostsCSS.buttonClass} onClick={()=> handleOnClickDelete(value.id)}> delete me</button></>) : ""}
                                {(authState.UserId === value.UserId) ?   (<button> editpost</button>) : ""}
                                {(authState.authStatus) ?   (<button onClick={() => handleLike(value.id) }> like</button>) : ""}
                                <div> likes: {value.Likes.length}</div>
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Posts
