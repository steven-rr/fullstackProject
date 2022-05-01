import React, {useState,useEffect, useContext} from 'react'
import CommentCSS from "./Comment.module.css"
import {  Link} from 'react-router-dom'
import axios from   "axios" 
import ChildComment from "./ChildComment"
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { BsArrowsAngleExpand } from "react-icons/bs";
import {AuthContext} from "../App"

// specifies max level to iterate over.
const REPLY_THREAD_WIDTH = 10;

// recursive component. takes in individual comment, and comments array. 
// basic algo: if not in the max level yet, keep recursively generating comments. when in max level, if children, link to continue thread.
const Comment = ({comment,commentIdx, setComments, comments, postID, onDeleteFromParent, MIN_LEVEL}) => {
    const [newReply, setNewReply] = useState("")
    const [replyFlag, setReplyFlag] = useState(false);
    const [visible, setVisible] = useState(true);
    const [idx, setIdx] = useState(0);
    const {authState, setAuthState} = useContext(AuthContext)

    useEffect( () => {
        setComments(comments);
        hasDescendantRefresh();
    }, []);

    // console.log("MIN_LEVEL: ", MIN_LEVEL) 
    const MAX_LEVEL = MIN_LEVEL + REPLY_THREAD_WIDTH
    // console.log("MAX_LEVEL: ", MAX_LEVEL);
    
    const handleReply = (e) => {
        setReplyFlag(!replyFlag);
    }
    const handleVisibleToggle = (e) => {
        setVisible(!visible);
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
                comment.hasDescendants = true
                
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }
    // like a post .
    const handleLike = (e) => {
        console.log("like clicked!" ) 
        axios  
            .post(`/api/likes/likeComment`, {CommentId: comment.id})
            .then( (response)=> {
                setComments(comments.map( (currComment) => {
                    // look for post to modify like array.
                    if(currComment.id === comment.id) 
                    {   
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.liked)
                        {   
                            // if dislike exists, also remove it before adding on the like. 
                            if(response.data.dislikeExists)
                            {
                                const currentCommentDislikes = currComment.Dislikes;
                                currentCommentDislikes.pop();
                                return { ...currComment, Likes: [...currComment.Likes , 0 ], Dislikes: currentCommentDislikes, liked: true, disliked: false}
                            }
                            // no dislike exists, simply like the post. 
                            else
                            {
                                return { ...currComment, Likes: [...currComment.Likes , 0 ], liked:true}
                            }

                        }
                        else
                        {
                            const currentCommentLikes = currComment.Likes;
                            currentCommentLikes.pop();
                            return{...currComment, Likes: currentCommentLikes, liked: false}
                        }
                        // if liked, decrement dislikes if necessary.

                    }
                    else
                    {
                        return currComment;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
        // prevent post from linking.
        e.stopPropagation()
    }
    // dislike a post .
    const handleDislike = (e) => {
        console.log("dislike clicked!" ) 
        axios  
            .post(`/api/likes/dislikeComment`, {CommentId: comment.id})
            .then( (response)=> {
                setComments(comments.map( (currComment) => {
                    // look for post to modify like array.
                    if(currComment.id === comment.id) 
                    {      
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.disliked)
                        {
                            // if like exists, also remove it before adding on the dislike
                            if(response.data.likeExists)
                            {
                                const currentCommentLikes = currComment.Likes;
                                currentCommentLikes.pop();    
                                return{...currComment, Likes: currentCommentLikes,  Dislikes:[...currComment.Dislikes , 0 ], disliked: true, liked: false}          
                            }
                            else
                            {
                                return { ...currComment, Dislikes: [...currComment.Dislikes , 0 ], disliked: true}
                            }
                        }
                        else
                        {
                            const currentCommentDislikes = currComment.Dislikes;
                            currentCommentDislikes.pop();
                            return{...currComment, Dislikes: currentCommentDislikes, disliked: false}
                        }
                    }
                    else
                    {
                        return currComment;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
        e.stopPropagation()
    }

    const deleteComment = (commentId) => {
        console.log("deleteing comment with commentID of:", comment.commentId)
         // send delete request to backend.
         axios
            .delete(`/api/comments/${commentId}`)
            .then( (response) => {
                console.log("im in here! yay.")
                // rerender page by resetting commentData data. 
                axios.get(`/api/comments/${commentId}`)
                    .then( (response) =>{
                        console.log("made it in")
                        console.log("comments: ", response.data);
                        setComments(comments.filter( (currComment) => currComment.id != commentId))
                        console.log("AFTER DLEETING: ", comments)
                    })
                    .catch( err => {
                        console.log("comments dont exist!")
                    })
             
            })
            .catch ( () => {
                console.log("delete failed!");
            })

    } 
    // iterate thru children and find if at least one has not been deleted. set has descendant flag appropriately.
    const hasDescendantRefresh = () => {
        let hasDescendantIsTrue = false
        for(let i =0; i<comments.length; i ++)
        {
            if(comments[i].parentId == comment.id)
            {
                if(comments[i].hasBeenDeleted == false || comments[i].hasDescendants == true)
                {
                    hasDescendantIsTrue = true
                }
            }
        }

        comment.hasDescendants = hasDescendantIsTrue
        setComments(comments)
    }
    // delete parent if children no longer have ancestors. also check for this comment's parent as well.
    const onDeleteParent = () => {
        console.log("handling on delete parent , where parent is  the following:" , comment)
        hasDescendantRefresh()
        if(comment.hasBeenDeleted)
        {
            
            // if has no descendants should be deleted! *** CHECK THIS LOGIC****. (should on DeleteFromParent be outside?)
            if(!comment.hasDescendants)
            {
                deleteComment(comment.id)
                onDeleteFromParent()
            }
        }
    }
    // handle logic for when user CLICKS "delete comment"
    const handleDeleteComment = async () => {
         
         // send hasBeenDeleted request to backend.
         await axios
            .post(`/api/comments/hasBeenDeleted/${comment.id}`)
            .then( res => {
                comment.hasBeenDeleted = true
                let newComments = [...comments]
                newComments[commentIdx] =  comment
                setComments(newComments)
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });

        // if no descendants, this comment should be deleted!
        console.log("handling delete comment for the following:" , comment)
        if(!comment.hasDescendants)
        {
            deleteComment(comment.id)
        }
        
        onDeleteFromParent()

    }
    // render children recursively until i hit max level. base case is when i hit the max level.
    const nestedComments =  comments.map((commentChild, key) =>{ 
        if(commentChild == null) {
            return 
        }
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
                        commentIdx = {key}
                        setComments={setComments}
                        comments={comments}
                        onDeleteFromParent= {onDeleteParent}
                        MIN_LEVEL={MIN_LEVEL}
                        postID ={postID}
                    />
                )
            }
        }
    });
    
        return (
            <div>
            {
                comment.hasBeenDeleted
                ?
                <div> 
                    <div> This comment has been deleted by the User! </div>
                    {nestedComments}
                </div>
                :
                <div className={CommentCSS.commentOuterContainer}>
                    <div className={`${ visible ? CommentCSS.borderOuterClass: CommentCSS.deactivate}`} onClick={() =>handleVisibleToggle()}>
                        <div className={CommentCSS.borderClass}></div>
                    </div> 
                    <div className = {`${visible ? CommentCSS.commentBodyContainer: CommentCSS.deactivate}`}>
                        <div className={CommentCSS.commentAuthorContainer}>
                            <div className={CommentCSS.commentAuthor}> {comment.username}</div>   
                            <div className={CommentCSS.commentTime}> &middot; 12 hr ago</div>
                        </div>
                        <div className ={CommentCSS.commentText}> {comment.contentText} </div>
                        <div className={CommentCSS.commentButtnContainer}>

                            <div className={CommentCSS.mobileLikesContainer}>
                                <div className={`${comment.liked ? CommentCSS.likeBackgroundClass_active: ""}  ${CommentCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e) }>
                                    <BiUpvote className={CommentCSS.likeClass} size="30px" />
                                </div>
                                <div className={`${ (comment.liked || comment.disliked) ? CommentCSS.likeCounterClass_active: ""}`}> {comment.Likes.length - comment.Dislikes.length} </div>

                                <div className={`${comment.disliked ? CommentCSS.likeBackgroundClass_active: ""} ${CommentCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e)}>
                                    <BiDownvote className={CommentCSS.likeClass} size="30px" />
                                </div>
                            </div>
                            <button onClick={() => handleReply()}> reply </button>
                        
                            {(authState.UserId === comment.UserId) ? (<><button className= {CommentCSS.buttonClass} onClick={()=> handleDeleteComment()} > delete comment</button></>) : ""}

                        </div>
                        <div className={`${replyFlag ? CommentCSS.enableCommentField: "" } ${CommentCSS.replyField}`}>
                            {/* <div className={`${ true ? CommentCSS.borderOuterClass: CommentCSS.borderOuterClass}`} >
                                <div className={CommentCSS.borderClass}></div>
                            </div>  */}
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
                    <div className = {`${visible ? CommentCSS.deactivate: CommentCSS.invisContainer}`}>
                        <div className={CommentCSS.iconExpandClass} onClick={() =>handleVisibleToggle()} >
                            <BsArrowsAngleExpand color="red"/>
                        </div>

                        
                        <div className={CommentCSS.commentAuthorContainer}>
                            <div className={CommentCSS.commentAuthor}> {comment.username}</div>   
                            <div className={CommentCSS.commentTime}> &middot; 12 hr ago</div>
                        </div>
                    </div>
                </div>
            }
             </div>
            
        )
    
    
    
}

export default Comment
