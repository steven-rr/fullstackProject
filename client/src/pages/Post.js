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
                console.log("all comments: ",comments);
                const newCommentCreated=  res.data;
                console.log("newcommentcreated", newCommentCreated);
                setComments(...comments, ...newCommentCreated)
                
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
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
                    <input
                        type = "text"
                        placeholder= "comment"
                        autoComplete= "off"
                        onChange ={commentOnChange}
                        value = {newComment}
                    /> 
                    <button onClick ={createComment}> create comment!</button>
                </div>
                
                <div className={PostCSS.commentsBodyContainer}>
                    {comments.map((value, key) =>{
                        return (
                                <div className = {PostCSS.commentBodyContainer} key = {key}>
                                    <div className ={PostCSS.commentText}> {value.contentText} </div>
                                </div>
                        )
                    })}
                </div>
            </div>
        )
    }
    
}

export default Post
