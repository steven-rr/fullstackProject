import React, {useState} from 'react'
import CommentCSS from "./Comment.module.css"
import {  Link} from 'react-router-dom'
import axios from   "axios" 

const ChildComment = ({comment, setComments, comments, postID, MAX_LEVEL, includeLink=false}) => {
    const [newChildReply, setNewChildReply] = useState("")
    const [childReplyFlag, setChildReplyFlag] = useState(false);

    const handleChildReply = (e) => {
        setChildReplyFlag(!childReplyFlag);
    }
    const childReplyOnChange= (e) => {
        setNewChildReply(e.target.value)
    }

    const handleSubmitChildReply = async (parentId, parentLevel) => {
        // increment level plus 1. 
        const newReplyToPost = {contentText: newChildReply, PostId: postID, parentId: parentId, level: parentLevel +1}
        // post the new reply on the server.
        await axios
            .post('/api/comments/reply',newReplyToPost)
            .then( res => {
                const newReplyCreated=  res.data; //get json response and append to state.                
                setComments([...comments, newReplyCreated])
                setNewChildReply("") //after adding a comment, clear the comment.
                setChildReplyFlag(false);
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }
    return(
        <div  className = {CommentCSS.commentBodyContainer} >
            <div className ={CommentCSS.commentText}> {comment.contentText} </div>
            <div> posted by {comment.username}</div>
            <div>
                <button onClick={() => handleChildReply()}> reply </button>
                {/* {(authState.UserId === comment.UserId) ? (<><button className= {PostCSS.buttonClass} onClick={()=> deleteComment(value.id)} > delete comment</button></>) : ""} */}
            </div>
            <div className={`${childReplyFlag ? CommentCSS.enableCommentField: "" } ${CommentCSS.replyField}`}>
                <textarea
                    className={CommentCSS.createCommentField}
                    name="body" 
                    rows="14" 
                    cols="10" 
                    wrap="soft" 
                    placeholder="Enter your thoughts here..." 
                    onChange={childReplyOnChange}
                    value={newChildReply}
                /> 
                <button onClick={() => handleSubmitChildReply(comment.id, comment.level)}> submit reply</button>
            </div>
            <Link className={`${CommentCSS.linkClass} ${includeLink ? CommentCSS.enableLink: ""} `}to={`/blog/${postID}/${comment.id}/${MAX_LEVEL}`}> continue this thread...</Link>            

        </div>
    )
}

export default ChildComment
