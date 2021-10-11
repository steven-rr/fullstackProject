import React, {useState,useEffect} from 'react'
import CommentCSS from "./Comment.module.css"
import {  Link} from 'react-router-dom'
import axios from   "axios" 

// specifies max level to iterate over.
const REPLY_THREAD_WIDTH = 10;

// recursive component. takes in individual comment, and comments array. 
// basic algo: if not in the max level yet, keep recursively generating comments. when in max level, if children, link to continue thread.
const Comment = ({comment, setComments, comments, postID, MIN_LEVEL}) => {
    const [newReply, setNewReply] = useState("")
    const [replyFlag, setReplyFlag] = useState(false);
    const [idx, setIdx] = useState(0);
    useEffect( () => {
        setComments(comments);
    }, []);

    // console.log("MIN_LEVEL: ", MIN_LEVEL) 
    const MAX_LEVEL = MIN_LEVEL + REPLY_THREAD_WIDTH
    // console.log("MAX_LEVEL: ", MAX_LEVEL);
    const rerender= (e) => {
        setIdx(currentIdx => currentIdx + 1);
    }
    const handleReply = (e) => {
        setReplyFlag(!replyFlag);
    }
    // handle onChange
    const commentOnChange= (e) => {
        setNewReply(e.target.value)
    }
    // handle submit reply
    const handleSubmitReply = async () => {
        const newReplyToPost = {contentText: newReply, PostId: postID, parentId: comment.id}
        // post the new reply on the server.
        await axios
            .post('/api/comments/reply',newReplyToPost)
            .then( res => {
                const newReplyCreated=  res.data; //get json response and append to state.                
                setComments([...comments, newReplyCreated])
                setNewReply("") //after adding a comment, clear the comment.
                setReplyFlag(false);
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }
    // render children recursively until i hit max level. base case is when i hit the max level.
    const nestedComments =  comments.map((commentChild, key) =>{ 
        if(commentChild.parentId === comment.id)
        {
            // console.log("commentChildId, commentChildLevel: ", commentChild.id, commentChild.level)
            // if children are in max level, render the children and stop recursion. else, continue recursion.
            if(commentChild.level >= MAX_LEVEL)
            {
                // iterate thru comments. if children at the max level have more children, include link to continue the thread.
                for(let i =0; i<comments.length; i++)
                {
                    if(comments[i].parentId == commentChild.id)
                    {
                        return(
                            <div  className = {CommentCSS.commentBodyContainer} >
                                <div className ={CommentCSS.commentText}> {commentChild.contentText} </div>
                                <div> posted by {commentChild.username}</div>
                                <Link key={key} to={`/blog/${postID}/${commentChild.id}/${MAX_LEVEL}`}> continue this thread...</Link>            
                            </div>
                        )
                    }
                }
                // else, children have no more children. no need to continue the thread.
                return(
                    <div  className = {CommentCSS.commentBodyContainer} >
                        <div className ={CommentCSS.commentText}> {commentChild.contentText} </div>
                        <div> posted by {commentChild.username}</div>
                    </div>
                )
                    
            }
            else // continue recursion if not at max level.
            {
                return (
                    <Comment 
                        key= {key}
                        comment={commentChild} 
                        setComments={setComments}
                        comments={comments}
                        MIN_LEVEL={MIN_LEVEL}
                        postID ={postID}
                    />
                )
            }
        }
    });
    
        return (
            <div className = {CommentCSS.commentBodyContainer} >
                <div className ={CommentCSS.commentText}> {comment.contentText} </div>
                <div> posted by {comment.username}</div>
                <div>
                    <button onClick={() => handleReply()}> reply </button>
                   
                    {/* {(authState.UserId === comment.UserId) ? (<><button className= {PostCSS.buttonClass} onClick={()=> deleteComment(value.id)} > delete comment</button></>) : ""} */}

                </div>
                <div className={`${replyFlag ? CommentCSS.enableCommentField: "" } ${CommentCSS.replyField}`}>
                    <textarea
                        className={CommentCSS.createCommentField}
                        name="body" 
                        rows="14" 
                        cols="10" 
                        wrap="soft" 
                        placeholder="Enter your thoughts here..." 
                        onChange={commentOnChange}
                        value={newReply}
                    /> 
                    <button onClick={handleSubmitReply}> submit reply</button>
                </div>
                {nestedComments}
                
            </div>
        )
    
    
    
}

export default Comment
