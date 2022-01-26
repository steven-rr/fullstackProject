import React , { useState } from 'react'
import CreatePostCSS from "./CreatePost.module.css"
import axios from   "axios" 
import { useHistory} from 'react-router-dom'


const CreatePost = () => {
    // instantiate history.
    const history = useHistory();

    // create post
    const [newPost, setNewPost] = useState({title: "", contentText: "", username: "admin"})
    // create post on click with create post button.
    const createPost = async () => {
        console.log("attempting to submit!!!!", newPost)
        // post the new post on the server.
        await axios
            .post('/api/posts',newPost)
            .then(  (res) => {
                const newPostCreated=  res.data; //get json response and append to state.
                //after adding a comment, clear the post.
                console.log(" looks like i did something right with posts....")
                // set new state to empty.
                setNewPost( prevPost => {
                    return {...prevPost, title: "", contentText: "" , username: "admin"}})
                history.push("/blog");

            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }
    // handle onChange
    const postTitleOnChange= (e) => {
        setNewPost( currentPost => {
            return {...currentPost, title: e.target.value}})
    }
    // handle onChange
    const postContentOnChange= (e) => {
        setNewPost( currentPost => {
            return {...currentPost, contentText: e.target.value}})
    }
    return (
        <div className={CreatePostCSS.createPostPageContainer}>
            <div className={CreatePostCSS.createPostHeaderContainer}> 
                <div className={CreatePostCSS.headerStyle}> Create a Post </div>
            </div>
            <div className={CreatePostCSS.createPostBodyContainer}>
                <textarea 
                    className={CreatePostCSS.titleField}
                    name="title" 
                    rows="1" 
                    cols="1" 
                    wrap="soft"
                    placeholder="Title..."
                    onChange={postTitleOnChange}
                    value={newPost.title}
                />
                
                <textarea  
                    className={CreatePostCSS.bodyField} 
                    name="body" 
                    rows="14" 
                    cols="10" 
                    wrap="soft" 
                    placeholder="Enter your thoughts here..." 
                    onChange={postContentOnChange}
                    value={newPost.contentText}
                />
                <button className={CreatePostCSS.buttonClass} onClick={createPost}> POST </button>
            </div>
        </div>
    )
}

export default CreatePost
