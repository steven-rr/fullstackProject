import React, {useState,useEffect, useContext, useRef, useCallback} from 'react'
import CommentCSS from "./Comment.module.css"
import {  Link} from 'react-router-dom'
import TextArea from "../components/TextArea.js"
import axios from   "axios" 
import { BiUpvote, BiDownvote,BiComment } from "react-icons/bi";
import { BsArrowsAngleExpand } from "react-icons/bs";
import {AuthContext} from "../App"
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { MdOutlineMoreHoriz } from "react-icons/md";


const ChildComment = ({comment, commentIdx,setComments, comments, setIndividualPostData,postID, onDeleteFromParent, MAX_LEVEL, includeLink=false}) => {
    const [newChildReply, setNewChildReply] = useState("")
    const [replyFlag, setReplyFlag] = useState(false);

    const {authState, setAuthState} = useContext(AuthContext)
    const [childReplyFlag, setChildReplyFlag] = useState(false);
    const [visible, setVisible] = useState(true);
    const [editFlag, setEditflag] = useState(false)
    const commentBarRef = useRef();
    const [moreDropdownOn, setMoreDropdown]   = useState(false)

    const [todayTime, setTodayTime] = useState(new Date())

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

    // new from here on out:
    const handleVisibleToggle = (e) => {
        setVisible(!visible);
    }
    const handleReply = (e) => {
        setReplyFlag(!replyFlag);
    }
    const handleLoginFromPosts = (e) => {

        setAuthState( currentAuthState=> {
            return { ...currentAuthState, loginOn: !currentAuthState.loginOn}
        })
        e.stopPropagation()
    }
    const handleEditClick = () => {
        console.log("clicked edit click!")
        setEditflag(true)
    }

    const handleMoreClick = () => {
        setMoreDropdown(currState=>!currState)
    }
    const handleMoreBlur = () => {
        setMoreDropdown(false)
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
    // handle submit reply
    const handleSubmitReply2 = async (editPostContentIn) => {
        // increment level plus 1. 
        const newReplyToPost = {contentText: editPostContentIn, PostId: postID, parentId: comment.id, level: comment.level +1}
        // post the new reply on the server.
        await axios
            .post('/api/comments/reply',newReplyToPost)
            .then( res => {
                const newReplyCreated=  res.data; //get json response and append to state.                
                setComments([...comments, newReplyCreated])
                setNewChildReply("") //after adding a comment, clear the comment.
                setReplyFlag(false);
                comment.hasDescendants = true
                
            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }
    // handle save edit post 2.
    const handleSaveEditPost2 = async (editPostContentIn) => {
        const editedPost = {contentText: editPostContentIn, id: comment.id}
        await axios 
            .post(`/api/comments/editContentText`, editedPost)
            .then( (res) => {
                console.log("edit post: ", res.data)
                setComments(comments.map( (currComment) => {
                    // look for post to modify like array.
                    console.log("currcommentID: ", currComment.id, "commentID: ", comment.id)
                    if(currComment.id === comment.id) 
                    {      
                        currComment.contentText = editPostContentIn
                    }
                    return currComment;
                    
                }))
                return true                
            })
            .catch ( () => {
                console.log("edit post failed!");
                return false
            })
    }
    let toDisplay = []
    if(comment.contentText)
    {

        let substrings = comment.contentText.split("\n")

        for (let i=0; i < substrings.length; i++)
        {
            if(substrings[i] == "")
            {
                toDisplay.push(<div> <br></br></div>)
            }
            else
            {
                toDisplay.push(<div className={CommentCSS.paragraphContent}><p className={CommentCSS.paragraphContent_p}>{substrings[i]}</p></div>)
            }
        }
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
                // if no parents and going to delete, decrement counter. 
                if(comment.parentId == null)
                {
                    setIndividualPostData( (currPost) => {
                        return { ...currPost, commentCounter: currPost.commentCounter - 1}

                    })
                }   
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
           // if no parents and going to delete, decrement counter. 
           if(comment.parentId == null)
           {
               setIndividualPostData( (currPost) => {
                   return { ...currPost, commentCounter: currPost.commentCounter - 1}

               })
           }
           deleteComment(comment.id)
       }
       
       onDeleteFromParent()

   }
    // calc time posted to display on post body containers!!!
    const postDateToDisplay = (datePosted) => {
        //output 
        let result; 
        // parameters
        const secsInYear = 60*60*24*365;
        const secsInMonth = 60*60*24*30;
        const secsInDay = 60*60*24
        const secsInHour = 60*60
        const secsInMin = 60

        let timeDiff_secs = (todayTime.getTime() - datePosted.getTime()) / 1000.0
        let yearDiff = Math.floor(timeDiff_secs / secsInYear)
        let monthDiff = Math.floor(timeDiff_secs / secsInMonth)
        let daysDiff = Math.floor(timeDiff_secs / secsInDay)
        let hoursDiff = Math.floor(timeDiff_secs / secsInHour)
        let minutesDiff = Math.floor(timeDiff_secs / secsInMin)
        let secondsDiff = Math.floor(timeDiff_secs)
        
        if(yearDiff > 0)
        {
            result = `${yearDiff} years ago`
        }
        else if(monthDiff >0)
        {
            result = `${monthDiff} months ago`
        
        }
        else if (daysDiff >0)
        {
            result = `${daysDiff} days ago`
            
        }
        else if (hoursDiff >0)
        {
            result = `${hoursDiff} hours ago`
            
        }
        else if (minutesDiff >0)
        {
            result = `${minutesDiff} minutes ago`
            
        }
        else if(secondsDiff > 0)
        {
            result = `${secondsDiff} seconds ago`
        }
        else
        {
            result = "0 seconds ago"
        }     
        return result
    }
    var datePosted= new Date(comment.createdAt)
    var dateStringPosted =postDateToDisplay(datePosted)

    return(
      <div>
      {
          comment.hasBeenDeleted 
          ?
            ""
          :
          <div className={CommentCSS.commentOuterContainer}>
          <div className={`${ visible ? CommentCSS.borderOuterClass: CommentCSS.deactivate}`} onClick={() =>handleVisibleToggle()}>
              <div className={CommentCSS.borderClass}></div>
          </div> 
          <div className = {`${visible ? CommentCSS.commentBodyContainer: CommentCSS.deactivate}`}>
              <div className={CommentCSS.commentAuthorContainer}>
                  <div className={CommentCSS.commentAuthor}> {comment.username}</div>   
                  <div className={CommentCSS.commentTime}> &middot; {dateStringPosted}</div>
              </div>
              {!editFlag 
                  ? 
                  <div className={CommentCSS.commentText}> 
                      {toDisplay} 
                  </div>
                  :
                  <div className={CommentCSS.textAreaOuterContainer}>
                      <TextArea
                          defaultVal={comment.contentText}
                          handleSave={handleSaveEditPost2}
                          editFlag={editFlag}
                          setEditflag={setEditflag}
                          key = {1}
                      />
                  </div>
              }
              <div className={CommentCSS.commentButtnContainer} ref={commentBarRef}>

                  <div className={CommentCSS.mobileLikesContainer}>
                      <div className={`${comment.liked ? CommentCSS.likeBackgroundClass_active: ""}  ${CommentCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e) }>
                          <BiUpvote className={CommentCSS.likeClass} size="30px" />
                      </div>
                      <div className={`${ (comment.liked || comment.disliked) ? CommentCSS.likeCounterClass_active: ""}`}> {comment.Likes.length - comment.Dislikes.length} </div>

                      <div className={`${comment.disliked ? CommentCSS.likeBackgroundClass_active: ""} ${CommentCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e)}>
                          <BiDownvote className={CommentCSS.likeClass} size="30px" />
                      </div>
                  </div>

                  {/* reply button */}
                  {authState.authStatus
                  ?
                  <div className={`${CommentCSS.replyClass}`} onClick={() => handleReply()}>
                      <BiComment size="26px"/> 
                      <div>Reply</div>
                  </div>
                  :
                  <div className={`${CommentCSS.replyClass}`} onClick={(e) => handleLoginFromPosts(e)}>
                      <BiComment size="26px"/> 
                      <div>Reply</div>
                  </div>
                  }

                  
                  {/* delete button */}
                  {(authState.UserId === comment.UserId) 
                  ? 
                  (<button className= {`${CommentCSS.buttnElementBackgroundClass}`} onClick={()=> handleDeleteComment()}>  
                          <AiOutlineDelete  size="30px"/>
                          <div>Delete</div>     
                  </button>) 
                  : 
                  ""}
                  
                  {/* edit button */}
                  {(authState.UserId === comment.UserId) 
                      ?   
                      (<button className= {`${CommentCSS.buttnElementBackgroundClass}`} onClick={handleEditClick}> 
                              <FiEdit2 size="30px"/>
                              <div>Edit</div>
                      </button>) 
                      : 
                      ""
                  }
                  {/* more button: */}

                  {(authState.UserId === comment.UserId) 
                      ?   
                      (<div tabIndex="0" className= {CommentCSS.barButtnContainer} onBlur={(e)=> handleMoreBlur(e)}>
                          <button className= {CommentCSS.moreButtnElementBackgroundClass} onClick={() => handleMoreClick()} > 
                              <MdOutlineMoreHoriz size="30px"/>
                          </button>
                          <div className={`${moreDropdownOn ? "":CommentCSS.deactivate} ${CommentCSS.desktopBarDropDownMenu} `} > 
                              <button className= {CommentCSS.buttnElementBackgroundClass2} onMouseDown={()=> handleDeleteComment()} >  
                                      <AiOutlineDelete  size="30px"/>
                                      <div>Delete</div>     
                              </button>
                              <button className= {CommentCSS.buttnElementBackgroundClass2} onMouseDown={handleEditClick}> 
                                      <FiEdit2 size="30px"/>
                                      <div >Edit</div>
                              </button>
                          </div>
                      </div>) 
                      : 
                      ""
                  }
                  
                  
              </div>
              {replyFlag
                  ?
                  <div className={CommentCSS.replyEnableCommentField}>
                      <div className={`${ CommentCSS.replyBorderOuterClass}`} >
                          <div className={CommentCSS.replyBorderClass}></div>
                      </div> 
                      <div className={CommentCSS.replyTextAreaOuterContainer}>
                          <TextArea
                              defaultVal={""}
                              handleSave={handleSubmitReply2}
                              editFlag={replyFlag}
                              setEditflag={setReplyFlag}
                              key = {2}
                          />
                      </div>
                  </div>
                  :
                  ""
              }
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
          <Link className={`${CommentCSS.linkClass} ${includeLink ? CommentCSS.enableLink: ""} `}to={`/blog/${postID}/${comment.id}/${MAX_LEVEL}`}> continue this thread...</Link>            
      </div>
      }


      </div>
    )
}

export default ChildComment
