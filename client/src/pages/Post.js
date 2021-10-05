import {React,useEffect, useState} from 'react'
import {useParams} from "react-router-dom"
import PostCSS from "./Post.module.css"
import axios from   "axios" 
import Page404 from "./Page404"


const Post = () => {
    const [individualPostData, setIndividualPostData] = useState({title: '', contentText: '', username: ''})
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [validFlag, setValidFlag] = useState(false)

    // use params allows me to fetch params 
    let {id } = useParams();

    // on render, get individual post data from backend and display for the user.
    useEffect( () => {
        // gets the post information from the server.
        axios.get(`/api/posts/${id}`)
            .then( (response) =>{
                setIndividualPostData(response.data);
                setValidFlag(true)
            })
            .catch( err => {
                setValidFlag(false);
                console.log("post page doesnt exist!")
            })
        // gets all comments from the server.
        axios.get(`/api/comments/${id}`)
            .then( (response) =>{
                console.log("comments: ", response.data);
                setComments(response.data);
            })
            .catch( err => {
                console.log("comments dont exist!")
            })
    }, []);

    // handle onChange
    const commentOnChange= (e) => {
        setNewComment(e.target.value)
    }
    // create comment on click with create comment button.
    const createComment = async () => {
        const newCommentToPost = {contentText: newComment, PostId: id}
        // post the new comment on the server.
        await axios
            .post('/api/comments',newCommentToPost)
            .then( res => {
                const newCommentCreated=  res.data; //get json response and append to state.
                setComments([...comments, newCommentCreated])
                setNewComment("") //after adding a comment, clear the comment.
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }

    const deleteComment = (commentId) => {
        console.log('clicked delete comment')

         // send delete request to backend.
         axios
            .delete(`/api/comments/${commentId}`)
            .then( () => {
                // rerender page by resetting commentData data. 
                axios.get(`/api/comments/${id}`)
                    .then( (response) =>{
                        console.log("comments: ", response.data);
                        setComments(response.data);
                    })
                    .catch( err => {
                        console.log("comments dont exist!")
                    })
             
            })
            .catch ( () => {
                console.log("delete failed!");
            })

    } 
    // if not a valid ID, render 404. else, render the post! 
    if(!validFlag)
    {
        return (<Page404/>)
    }
    else
    {
        return (
            <div className={PostCSS.postPageContainer}> 
                <div className={PostCSS.postBodyContainer}>
                    <div className={PostCSS.titleStyle}> {`Welcome to post ${id}`} </div>
                    <div className={PostCSS.titleStyle}> {individualPostData.title}</div>
                    <div className={PostCSS.contentStyle}> {individualPostData.contentText}</div>
                </div>
                <div className={PostCSS.createCommentContainer}>
                    <textarea
                        className={PostCSS.createCommentField}
                        name="body" 
                        rows="14" 
                        cols="10" 
                        wrap="soft" 
                        placeholder="Enter your thoughts here..." 
                        onChange={commentOnChange}
                        value={newComment}
                    /> 
                    <button className={PostCSS.buttonClass} onClick ={createComment}> CREATE COMMENT!</button>
                </div>
                
                <div className={PostCSS.commentsBodyContainer}>
                    {comments.map((value, key) =>{
                        return (
                                <div className = {PostCSS.commentBodyContainer} key = {key}>
                                    <div className ={PostCSS.commentText}> {value.contentText} </div>
                                    <div> posted by {value.username}</div>
                                    <button className= {PostCSS.buttonClass} onClick={()=> deleteComment(value.id)}> delete comment</button>
                                </div>
                        )
                    })}
                </div>
            </div>
        )
    }
    
}

export default Post
