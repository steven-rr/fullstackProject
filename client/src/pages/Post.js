import {React,useEffect, useState, useContext} from 'react'
import {useParams, useHistory} from "react-router-dom"
import PostCSS from "./Post.module.css"
import axios from   "axios" 
import Page404 from "./Page404"
import Comment from "../components/Comment.js"
import {AuthContext} from "../App"
import { BiUpvote, BiDownvote, BiComment } from "react-icons/bi";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineMoreHoriz } from "react-icons/md";

const Post = () => {
    const [ individualPostData, setIndividualPostData] = useState({})
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [editPostContent, setEditPostContent] = useState(individualPostData.contentText)
    const [validFlag, setValidFlag] = useState(true)
    const {authState, setAuthState} = useContext(AuthContext)
    const [idxx, setIdx] = useState(0)
    const [todayTime, setTodayTime] = useState(new Date())
    const [moreDropdownOn, setMoreDropdown]   = useState(false)

    // rerender when blur is triggered.
    const rerender = e =>
    {
        setIdx(currentIndex=> currentIndex+1);
    }

    // use params allows me to fetch params 
    let {id } = useParams();

    // instantiate history.
    const history = useHistory();

    // on render, get individual post data from backend and display for the user.
    useEffect( () => {
        // scroll to top on render.
        window.scrollTo(0, 0)

        // gets the post information from the server.
        axios.get(`/api/posts/${id}`)
            .then( (response) =>{
                setIndividualPostData(response.data);
                console.log("post data from backend NEWEST: ", response.data)
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
    useEffect( () => {
        console.log("use effect comments:, ", comments);
    }, comments[comments.length])

    // handle onChange
    const commentOnChange= (e) => {
        setNewComment(e.target.value)
    }
    // handle onChange
    const editPostContentOnChange= (e) => {
        setEditPostContent(e.target.value)
    }
    
    // create comment on click with create comment button.
    const createComment = async () => {
        const newCommentToPost = {contentText: newComment, PostId: id}
        // post the new comment on the server.
        await axios
            .post('/api/comments',newCommentToPost)
            .then(  (res) => {
                const newCommentCreated=  res.data; //get json response and append to state.
                setComments([...comments, newCommentCreated])
                
                setNewComment("") //after adding a comment, clear the comment.
                rerender();
                console.log("SUCCESFULLY ENTERED COMMENT!!!");
                console.log(newCommentCreated);
                

            })
            .catch( (err) => {
                    console.log("error: ", err);
                });
    }

    const deleteComment = (commentId) => {
        console.log('clicked delete comment')

         // send delete request to backend.
         2
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
    const deletePost = () => {
        console.log("button clicked!");
        // send delete request to backend.
        axios
            .delete(`/api/posts/${id}`)
            .then( () => {
                // redirect to posts after deleting the post.
                history.push("/blog")
                
            })
            .catch ( () => {
                console.log("delete failed!");
            })
    }
    // like a post .
    const handleLike = (e) => {
        console.log("like clicked!" ) 
        axios  
            .post(`/api/likes/like`, {PostId: id})
            .then( (response)=> {
                setIndividualPostData( (currPost) => {
                    // look for post to modify like array.
                     
                    // if liked, increment like array size by 1. else , decrement it by 1.
                    if(response.data.liked)
                    {   
                        // if dislike exists, also remove it before adding on the like. 
                        if(response.data.dislikeExists)
                        {
                            const currentPostDislikes = currPost.Dislikes;
                            currentPostDislikes.pop();
                            return { ...currPost, Likes: [...currPost.Likes , 0 ], Dislikes: currentPostDislikes, liked: true, disliked: false}
                        }
                        // no dislike exists, simply like the post. 
                        else
                        {
                            return { ...currPost, Likes: [...currPost.Likes , 0 ], liked:true}
                        }

                    }
                    else
                    {
                        const currentPostLikes = currPost.Likes;
                        currentPostLikes.pop();
                        return{...currPost, Likes: currentPostLikes, liked: false}
                    }
                    // if liked, decrement dislikes if necessary.

                    
                    
                })
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
            .post(`/api/likes/dislike`, {PostId: id})
            .then( (response)=> {
                setIndividualPostData((currPost) => {
                    
                    // if liked, increment like array size by 1. else , decrement it by 1.
                    if(response.data.disliked)
                    {
                        // if like exists, also remove it before adding on the dislike
                        if(response.data.likeExists)
                        {
                            const currentPostLikes = currPost.Likes;
                            currentPostLikes.pop();    
                            return{...currPost, Likes: currentPostLikes,  Dislikes:[...currPost.Dislikes , 0 ], disliked: true, liked: false}          
                        }
                        else
                        {
                            return { ...currPost, Dislikes: [...currPost.Dislikes , 0 ], disliked: true}
                        }
                    }
                    else
                    {
                        const currentPostDislikes = currPost.Dislikes;
                        currentPostDislikes.pop();
                        return{...currPost, Dislikes: currentPostDislikes, disliked: false}
                    }
                    
                   
                })
            })
            .catch( (err) => {
                console.log(err);
            })
        e.stopPropagation()
    }
    const handleLoginFromPosts = (e) => {

        setAuthState( currentAuthState=> {
            return { ...currentAuthState, loginOn: !currentAuthState.loginOn}
        })
        e.stopPropagation()
    }
    const handleMoreClick = () => {
        setMoreDropdown(currState=>!currState)
    }
    const handleMoreBlur = () => {
        setMoreDropdown(false)
    }
    // // create post on click with create post button.
    // const createPost = async () => {
    //     console.log("attempting to submit!!!!", newPost)
    //     // post the new post on the server.
    //     await axios
    //         .post('/api/posts',newPost)
    //         .then(  (res) => {
    //             const newPostCreated=  res.data; //get json response and append to state.
    //             //after adding a comment, clear the post.
    //             console.log(" looks like i did something right with posts....")
    //             // set new state to empty.
    //             setNewPost( prevPost => {
    //                 return {...prevPost, title: "", contentText: "" , username: "admin"}})
    //             history.push("/blog");

    //         })
    //         .catch( (err) => {
    //                 console.log("error: ", err);
    //             });
    // }
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
    // if not a valid ID, render 404. else, render the post! 
    if(!validFlag)
    {
        return (<Page404/>)
    }
    else
    {
        var datePosted= new Date(individualPostData.createdAt)
        var dateStringPosted =postDateToDisplay(datePosted)

        return (
            <div className={PostCSS.postPageContainer}> 
                {/* display posts */}
                <div className={PostCSS.postBodyContainer}> 
                    {authState.authStatus 
                        ?
                        // do something
                        <div className={PostCSS.desktopLikesContainer}>
                            <div className={`${individualPostData.liked ? PostCSS.likeBackgroundClass_active: ""} ${PostCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e) }>
                                <BiUpvote className={PostCSS.likeClass} size="30px" />
                            </div>
                            <div className={`${ (individualPostData.liked || individualPostData.disliked) ? PostCSS.likeCounterClass_active: ""}`}> {`${(individualPostData.Likes && individualPostData.Dislikes) ? individualPostData.Likes.length - individualPostData.Dislikes.length : ""}`}</div>
                            <div className={`${individualPostData.disliked ? PostCSS.likeBackgroundClass_active: ""} ${PostCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e) }>
                                <BiDownvote className={PostCSS.likeClass} size="30px" />
                            </div>
                        </div>
                        :
                        // do something else.
                        <div className={PostCSS.desktopLikesContainer}>
                            <div className={`${individualPostData.liked ? PostCSS.likeBackgroundClass_active: ""} ${PostCSS.likeBackgroundClass}`} onClick={(e)=> handleLoginFromPosts(e)}>
                                <BiUpvote className={PostCSS.likeClass} size="30px" />
                            </div>
                            <div className={`${ (individualPostData.liked || individualPostData.disliked) ? PostCSS.likeCounterClass_active: ""}`}> {`${(individualPostData.Likes && individualPostData.Dislikes) ? individualPostData.Likes.length - individualPostData.Dislikes.length : ""}`} </div>
                            <div className={`${individualPostData.disliked ? PostCSS.likeBackgroundClass_active: ""} ${PostCSS.likeBackgroundClass}`} onClick={(e)=> handleLoginFromPosts(e)}>
                                <BiDownvote className={PostCSS.likeClass} size="30px" />
                            </div>
                        </div>  
                    }
                    
                    
                    <div className={PostCSS.postBodyContentContainer}>
                        <div className={PostCSS.authorClass}>Posted by {individualPostData.username} {dateStringPosted}  </div>
                        <div className={PostCSS.titleStyle}> {individualPostData.title}</div>
                        <div className={PostCSS.contentStyle}> {individualPostData.contentText}</div>
                        <textarea
                            className={PostCSS.createCommentField}
                            name="body" 
                            rows="14" 
                            cols="10" 
                            wrap="soft" 
                            placeholder={"Enter your thoughts here..." }
                            onChange={editPostContentOnChange}
                            value={editPostContent}
                            defaultValue= {individualPostData.contentText}
                        />
                        {/* <button onClick={createPost}> CANCEL </button> */}
                        {/* <button onClick={createPost}> SAVE </button> */}

                            
                        {/* Buttons */}
                        <div className={PostCSS.buttonListClass}> 
                            {/* upvotes buttons */}
                            <div className={PostCSS.mobileLikesContainer}>
                                {/* onClick={(e) => handleLike(e, value.id) } */}
                                <div className={`${individualPostData.liked ? PostCSS.likeBackgroundClass_active: ""} ${PostCSS.likeBackgroundClass}`} onClick={(e) => handleLike(e)} >
                                    <BiUpvote className={PostCSS.likeClass} size="30px" />
                                </div>
                                <div className={`${ (individualPostData.liked || individualPostData.disliked) ? PostCSS.likeCounterClass_active: ""}`}> {`${(individualPostData.Likes && individualPostData.Dislikes) ? individualPostData.Likes.length - individualPostData.Dislikes.length : ""}`}</div>
                                {/* onClick={(e) => handleDislike(e, value.id) } */}
                                <div className={`${individualPostData.disliked ? PostCSS.likeBackgroundClass_active: ""} ${PostCSS.likeBackgroundClass}`} onClick={(e) => handleDislike(e) }>
                                    <BiDownvote className={PostCSS.likeClass} size="30px" />
                                </div>
                            </div>

                            {/* comments button */}
                            <div className= {PostCSS.commentButtnElementBackgroundClass} > 
                                    <BiComment size="30px"/> 
                                    <div className={`${PostCSS.buttnDisplayText} ${PostCSS.commentButtnText}`} > {individualPostData.commentCounter}</div>
                            </div>
                            {/* delete button */}
                            {(authState.UserId === individualPostData.UserId) 
                            ?   
                            // onClick={(e)=> handleOnClickDelete(e, value.id)}
                            (<button className= {PostCSS.buttnElementBackgroundClass} >  
                                    <AiOutlineDelete  size="30px"/>
                                    <div className={PostCSS.buttnDisplayText}>Delete</div>     
                            </button>) 
                            : 
                            ""
                            }
                            {/* edit button */}
                            {(authState.UserId === individualPostData.UserId) 
                            ?   
                            //  onClick={(e) => handleEditClick(e)}
                            (<button className= {PostCSS.buttnElementBackgroundClass} > 
                                    <FiEdit2 size="30px"/>
                                    <div className={PostCSS.buttnDisplayText}>Edit</div>
                            </button>) 
                            : 
                            ""
                            }
                            {/* more button */}
                            <div className= {PostCSS.barButtnContainer} onBlur={(e)=> handleMoreBlur(e)}>
                                <button className= {PostCSS.moreButtnElementBackgroundClass} onClick={() => handleMoreClick()} > 
                                    <MdOutlineMoreHoriz size="30px"/>
                                </button>
                                <div className={`${moreDropdownOn ? "":PostCSS.deactivate} ${PostCSS.desktopBarDropDownMenu} `} > 
                                    <button className= {PostCSS.buttnElementBackgroundClass2} >  
                                            <AiOutlineDelete  size="30px"/>
                                            <div className={PostCSS.buttnDisplayText}>Delete</div>     
                                    </button>
                                    <button className= {PostCSS.buttnElementBackgroundClass2} > 
                                            <FiEdit2 size="30px"/>
                                            <div className={PostCSS.buttnDisplayText}>Edit</div>
                                    </button>
                                </div>
                            </div>
                            

                        </div>
                        {/* {(authState.UserId === individualPostData.UserId) ?   (<div><button className= {PostCSS.buttonClass} onClick={deletePost}> delete me</button><button className= {PostCSS.buttonClass}>  editpost</button></div>) : ""} */}
                    </div>
                    
                </div>
                {authState.authStatus
                ?
                    <div className={PostCSS.createCommentOuterContainer}>
                        <div className={PostCSS.createCommentContainer}>
                            <div className={`${authState.authStatus ? PostCSS.commentAuthor: PostCSS.deactivate}`}>Comment as {authState.username}</div> 
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
                            <button className={PostCSS.commentButtonClass} onClick ={createComment}> Comment </button>
                        </div>
                    </div>
                    :
                    <div className={PostCSS.createCommentOuterContainer}>
                        <div className={PostCSS.createCommentContainer}>
                            <textarea
                                className={PostCSS.createCommentField}
                                name="body" 
                                rows="14" 
                                cols="10" 
                                wrap="soft" 
                                placeholder="Login to Comment..." 
                                onClick={(e)=> handleLoginFromPosts(e)}
                                value={newComment}
                            /> 
                            <button className={PostCSS.buttonClass} onClick ={(e)=> handleLoginFromPosts(e)}> LOG IN!</button>
                        </div>
                    </div>
                }
                
                {/* display comments */}
                {comments.length != 0 
                ?
                <div className={PostCSS.commentsBodyContainer}>
                    {comments.map((value, index) =>{
                        if(value == null)
                        {
                            return 
                        }
                        if(value.parentId === null)
                        {
                            return (
                                <div className={PostCSS.commentBodyContainer}>
                                    <Comment
                                        key= {index}
                                        comment= {value}
                                        commentIdx= {index}
                                        comments = {comments} 
                                        setComments={setComments}
                                        onDeleteFromParent= {() => {}}
                                        MIN_LEVEL= {0}
                                        postID ={id}
                                    />
                                </div>
                            )
                        }
                        
                    })}
                </div>
                : 
                ""}
                
                
            </div>
        )
    }
    
}

export default Post
