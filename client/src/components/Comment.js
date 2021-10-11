import React from 'react'
import CommentCSS from "./Comment.module.css"
import {  Link} from 'react-router-dom'

// specifies max level to iterate over.
const REPLY_THREAD_WIDTH = 1;

// recursive component. takes in individual comment, and comments array.
const Comment = ({comment, comments, postID, MIN_LEVEL}) => {
    console.log("MIN_LEVEL: ", MIN_LEVEL) 
    const MAX_LEVEL = MIN_LEVEL + REPLY_THREAD_WIDTH
    console.log("MAX_LEVEL: ", MAX_LEVEL);

    // renders child comments recursively. base case is when i hit the max level.
    const nestedComments =  comments.map((commentChild, key) =>{ 
        if(commentChild.parentId === comment.id)
        {
            console.log("commentChildId, commentChildLevel: ", commentChild.id, commentChild.level)
            // if children will be in max level, stop recursion. else, continue recursion.
            if(commentChild.level >= MAX_LEVEL)
            {
                // iterate thru array. if comment has children, continue the thread.
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
                // else, no need to continue the thread.
                return(
                    <div  className = {CommentCSS.commentBodyContainer} >
                        <div className ={CommentCSS.commentText}> {commentChild.contentText} </div>
                        <div> posted by {commentChild.username}</div>
                    </div>
                )
                    
            }
            else
            {
                return (
                    <Comment 
                        key= {key}
                        comment={commentChild} 
                        comments={comments}
                        MIN_LEVEL={MIN_LEVEL}
                    />
                )
            }
        }
    });
    
        return (
            <div className = {CommentCSS.commentBodyContainer} >
                <div className ={CommentCSS.commentText}> {comment.contentText} </div>
                <div> posted by {comment.username}</div>
                {nestedComments}
                {/* {(authState.UserId === comment.UserId) ? (<><button className= {PostCSS.buttonClass} onClick={()=> deleteComment(value.id)} > delete comment</button></>) : ""} */}
            </div>
        )
    
    
    
}

export default Comment
