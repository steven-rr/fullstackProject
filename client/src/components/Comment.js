import React, {useState,useEffect} from 'react'
import CommentCSS from "./Comment.module.css"
import {  Link} from 'react-router-dom'
import axios from   "axios" 
import ChildComment from "./ChildComment"
import { BiUpvote, BiDownvote } from "react-icons/bi";

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
    
    const handleReply = (e) => {
        setReplyFlag(!replyFlag);
    }
    
    // handle onChange
    const commentOnChange= (e) => {
        setNewReply(e.target.value)
    }
    
    // handle submit reply
    const handleSubmitReply = async () => {
        // increment level plus 1. 
        const newReplyToPost = {contentText: newReply, PostId: postID, parentId: comment.id, level: comment.level +1}
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
     // like a post .
    //  const handleLike = (e) => {
    //     console.log("like clicked!" ) 
    //     axios  
    //         .post(`/api/likes/likeComment`, {CommentId: comment.id})
    //         .then( (response)=> {
    //             setIndividualPostData( (currComment) => {
    //                 // look for post to modify like array.
                     
    //                 // if liked, increment like array size by 1. else , decrement it by 1.
    //                 if(response.data.liked)
    //                 {   
    //                     // if dislike exists, also remove it before adding on the like. 
    //                     if(response.data.dislikeExists)
    //                     {
    //                         const currentPostDislikes = currPost.Dislikes;
    //                         currentPostDislikes.pop();
    //                         return { ...currPost, Likes: [...currPost.Likes , 0 ], Dislikes: currentPostDislikes, liked: true, disliked: false}
    //                     }
    //                     // no dislike exists, simply like the post. 
    //                     else
    //                     {
    //                         return { ...currPost, Likes: [...currPost.Likes , 0 ], liked:true}
    //                     }

    //                 }
    //                 else
    //                 {
    //                     const currentPostLikes = currPost.Likes;
    //                     currentPostLikes.pop();
    //                     return{...currPost, Likes: currentPostLikes, liked: false}
    //                 }
    //                 // if liked, decrement dislikes if necessary.

                    
                    
    //             })
    //         })
    //         .catch( (err) => {
    //             console.log(err);
    //         })
    //     // prevent post from linking.
    //     e.stopPropagation()
    // }
    // dislike a post .
    // const handleDislike = (e) => {
    //     console.log("dislike clicked!" ) 
    //     axios  
    //         .post(`/api/likes/dislike`, {PostId: id})
    //         .then( (response)=> {
    //             setIndividualPostData((currPost) => {
                    
    //                 // if liked, increment like array size by 1. else , decrement it by 1.
    //                 if(response.data.disliked)
    //                 {
    //                     // if like exists, also remove it before adding on the dislike
    //                     if(response.data.likeExists)
    //                     {
    //                         const currentPostLikes = currPost.Likes;
    //                         currentPostLikes.pop();    
    //                         return{...currPost, Likes: currentPostLikes,  Dislikes:[...currPost.Dislikes , 0 ], disliked: true, liked: false}          
    //                     }
    //                     else
    //                     {
    //                         return { ...currPost, Dislikes: [...currPost.Dislikes , 0 ], disliked: true}
    //                     }
    //                 }
    //                 else
    //                 {
    //                     const currentPostDislikes = currPost.Dislikes;
    //                     currentPostDislikes.pop();
    //                     return{...currPost, Dislikes: currentPostDislikes, disliked: false}
    //                 }
                    
                   
    //             })
    //         })
    //         .catch( (err) => {
    //             console.log(err);
    //         })
    //     e.stopPropagation()
    // }

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
                        return (
                            <ChildComment 
                                comment= {commentChild}
                                setComments={setComments}
                                comments = {comments} 
                                postID ={postID}
                                MAX_LEVEL ={MAX_LEVEL}
                                includeLink={true}
                            />
                        )
                    }
                }
                // else, children have no more children. no need to continue the thread with a link.
                return (
                    <ChildComment 
                        comment= {commentChild}
                        setComments={setComments}
                        comments = {comments} 
                        postID ={postID}
                        MAX_LEVEL ={MAX_LEVEL}
                    />
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
                <div className={CommentCSS.commentAuthorContainer}>
                    <div className={CommentCSS.commentAuthor}> {comment.username}</div>   
                    <div className={CommentCSS.commentTime}> &middot; 12 hr ago</div>
                </div>
                <div className ={CommentCSS.commentText}> {comment.contentText} </div>
                <div className={CommentCSS.commentButtnContainer}>

                    <div className={CommentCSS.mobileLikesContainer}>
                        <div className={`${CommentCSS.likeBackgroundClass}`} >
                            <BiUpvote className={CommentCSS.likeClass} size="30px" />
                        </div>
                        {/* <div className={`${ (value.liked || value.disliked) ? PostsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div> */}
                        <div> 0 </div>

                        <div className={`${CommentCSS.likeBackgroundClass}`}>
                            <BiDownvote className={CommentCSS.likeClass} size="30px" />
                        </div>
                    </div>
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
