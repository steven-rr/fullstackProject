import React, { useState, useEffect, useContext } from 'react' 
import PostsCSS from "./Posts.module.css"
import axios from   "axios" 
import { Link, useHistory} from 'react-router-dom'
import {AuthContext} from "../App"
// import { MdArrowForwardIos } from "react-icons/md";
import { BiUpvote, BiDownvote,BiComment } from "react-icons/bi";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";

import { MdArrowForwardIos } from "react-icons/md";



const Posts = () => {
    // grabbing setAuthState.
    const {authState, setAuthState} = useContext(AuthContext)
    const [todayTime, setTodayTime] = useState(new Date())
    
    // instantiate history.
    const history = useHistory();
    
    // use state.
    const [postData, setPostData] = useState([])
    const [dropdownOn, setDropdown]           = useState(false)
    const [dropdownElementActive, setDropdownElementActive] = useState("1")
    const [currentOrderingName, setCurrentOrderingName]   = useState("Top")


    // on render, get posts from backend and display for the user.
    useEffect( () => {
        axios.get("/api/posts").then( (response) =>{
            // when i receive post data, sort by likes.
            setPostData( (prevState)=>{
                let stateSorted = response.data
                stateSorted.sort( (a,b) => {
                    let likesOfA =  a.likeCounter
                    let likesOfB =  b.likeCounter
                    if(likesOfA < likesOfB)
                    {
                        return 1;
                    }
                    else if(likesOfA > likesOfB)
                    {
                        return -1;
                    } 
                    else
                    {   
                        return 0;
                    }
                })
                return stateSorted;
            });
            
        })
    }, []);

    const handleLoginFromPosts = () => {

        setAuthState( currentAuthState=> {
            return { ...currentAuthState, loginOn: !currentAuthState.loginOn}
        })
    }

    const handleOnClickComments = () => {
        console.log("button clicked!");
    }
    const handleOnClickDelete = (id) => {
        console.log("button clicked!");
        // send delete request to backend.
        axios
            .delete(`/api/posts/${id}`)
            .then( () => {
                // rerender page by resetting post data. 
                axios.get("/api/posts").then( (response) =>{
                    setPostData(response.data);
                })
            })
            .catch ( () => {
                console.log("delete failed!");
            })
    }
    // like a post .
    const handleLike = (PostId) => {
        console.log("like clicked!" ) 
        axios  
            .post(`/api/likes/like`, {PostId: PostId})
            .then( (response)=> {
                setPostData(postData.map( (post) => {
                    // look for post to modify like array.
                    if(post.id === PostId) 
                    {   
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.liked)
                        {   
                            // if dislike exists, also remove it before adding on the like. 
                            if(response.data.dislikeExists)
                            {
                                const currentPostDislikes = post.Dislikes;
                                currentPostDislikes.pop();
                                return { ...post, Likes: [...post.Likes , 0 ], Dislikes: currentPostDislikes, liked: true, disliked: false}
                            }
                            // no dislike exists, simply like the post. 
                            else
                            {
                                return { ...post, Likes: [...post.Likes , 0 ], liked:true}
                            }

                        }
                        else
                        {
                            const currentPostLikes = post.Likes;
                            currentPostLikes.pop();
                            return{...post, Likes: currentPostLikes, liked: false}
                        }
                        // if liked, decrement dislikes if necessary.

                    }
                    else
                    {
                        return post;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
    }
    // dislike a post .
    const handleDislike = (PostId) => {
        console.log("dislike clicked!" ) 
        axios  
            .post(`/api/likes/dislike`, {PostId: PostId})
            .then( (response)=> {
                setPostData(postData.map( (post) => {
                    // look for post to modify like array.
                    if(post.id === PostId) 
                    {      
                        // if liked, increment like array size by 1. else , decrement it by 1.
                        if(response.data.disliked)
                        {
                            // if like exists, also remove it before adding on the dislike
                            if(response.data.likeExists)
                            {
                                const currentPostLikes = post.Likes;
                                currentPostLikes.pop();    
                                return{...post, Likes: currentPostLikes,  Dislikes:[...post.Dislikes , 0 ], disliked: true, liked: false}          
                            }
                            else
                            {
                                return { ...post, Dislikes: [...post.Dislikes , 0 ], disliked: true}
                            }
                        }
                        else
                        {
                            const currentPostDislikes = post.Dislikes;
                            currentPostDislikes.pop();
                            return{...post, Dislikes: currentPostDislikes, disliked: false}
                        }
                    }
                    else
                    {
                        return post;
                    }
                }))
            })
            .catch( (err) => {
                console.log(err);
            })
    }

    // dropdowns:
    const handleDropdownBlur = (e) => {

        if(e.currentTarget.dataset.div_id == "1" || e.currentTarget.dataset.div_id == "4")
        {
            console.log("setting dropdown to false.")
            setDropdown(false)

        }
    }
    const handleOrderingElementClick = (e) => {
        console.log("CLICK ORDERING ELEMENT!")
        setDropdownElementActive(e.currentTarget.dataset.div_id)
        setDropdown(false)
        // top 
        if(e.currentTarget.dataset.div_id == "1")
        {
            console.log("top!")
            setCurrentOrderingName("Top")
            postData.sort( (a,b) => {
                let likesOfA =  a.likeCounter
                let likesOfB =  b.likeCounter
                if(likesOfA < likesOfB)
                {
                    return 1;
                }
                else if(likesOfA > likesOfB)
                {
                    return -1;
                } 
                else
                {   
                    return 0;
                }
            })
        }
        // newest
        else if ( e.currentTarget.dataset.div_id == "2")
        {
            console.log("newest!")
            setCurrentOrderingName("Newest")
            postData.sort( (a,b) => {
                if(b.timePosted_seconds > a.timePosted_seconds)
                {
                    return 1;
                }
                else if(b.timePosted_seconds < a.timePosted_seconds)
                {
                    return -1;
                } 
                else
                {   
                    return 0;
                }
            })
        } 
        // oldest
        else if(e.currentTarget.dataset.div_id == "3")
        {   
            console.log("oldest!")
            setCurrentOrderingName("Oldest")
            postData.sort( (a,b) => {
                if(b.timePosted_seconds < a.timePosted_seconds)
                {
                    return 1;
                }
                else if(b.timePosted_seconds > a.timePosted_seconds)
                {
                    return -1;
                } 
                else
                {   
                    return 0;
                }
            })
        }
        // contraversial 
        else if(e.currentTarget.dataset.div_id == "4")
        {
            console.log("contraversial!")
            setCurrentOrderingName("Contraversial")
            postData.sort( (a,b) => {
                let commentsOfA =  a.commentCounter
                let commentsOfB =  b.commentCounter
                if(commentsOfA < commentsOfB)
                {
                    return 1;
                }
                else if(commentsOfA > commentsOfB)
                {
                    return -1;
                } 
                else
                {   
                    return 0;
                }
            })
        }
    
    }
    const handleOrderingClick = () => {
        setDropdown(currState=>!currState)
    }
    // calc time posted to display on post body containers!!!
    const postDateToDisplay = (datePosted) => {
        //output 
        let result; 
        // parameters
        const secsInYear = 60*60*24*365;
        const secsInMonth = 60*60*24*30;


        // check first if post divisible by years:
        let yearDiff = todayTime.getFullYear() - datePosted.getFullYear()
        let monthDiff = todayTime.getMonth() - datePosted.getMonth()
        let daysDiff = todayTime.getDate() - datePosted.getDate()
        let hoursDiff = todayTime.getHours() - datePosted.getHours()
        let minutesDiff = todayTime.getMinutes() - datePosted.getMinutes()
        let secondsDiff = Math.floor(todayTime.getSeconds() - datePosted.getSeconds())
        
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
    return (
        <div className={PostsCSS.postsPageContainer}>
            
            {/* create post button */}
            {authState.authStatus ? 
                <div className={PostsCSS.createPostContainer}>
                    <Link to="/createpost" className={`${PostsCSS.linkCreatePostField}  `}>
                        Create Post
                    </Link> 
                </div>
                : 
                <div className={PostsCSS.createPostContainer}>
                    <div className={`${PostsCSS.linkCreatePostField}  `} onClick={()=> handleLoginFromPosts()}>
                        Create Post
                    </div>
                </div>
            }
            
            {/* sorting buttons */}
            {/* <div className={PostsCSS.buttonClass}>
                
                Sort by.. 
            </div> */}
            {/* future button */}
            <div className={PostsCSS.buttnBarContainer}>
                <div tabIndex="0" className={PostsCSS.barButtnContainer} data-div_id="1"  onBlur={(e)=> handleDropdownBlur(e)}>
                    <div className={`${PostsCSS.buttnBarButtn}` } onMouseDown={() => handleOrderingClick()}>
                        <div className={`${PostsCSS.buttnBar_text}  `} > {currentOrderingName}  </div>
                        <div className={PostsCSS.iconRotate}>
                            <MdArrowForwardIos />
                        </div>
                        
                    </div>
                    <div className={`${dropdownOn ? "":PostsCSS.deactivate} ${PostsCSS.desktopBarDropDownMenu} `}   > 
                        <div className={`${PostsCSS.barDropDownMenuElement} ${ (dropdownElementActive == "1" ) ? PostsCSS.barDropDownMenuElement_active : ""}`} data-div_id="1" onMouseDown={(e) => handleOrderingElementClick(e)}> Top </div>
                        <div className={`${PostsCSS.barDropDownMenuElement} ${ (dropdownElementActive == "2" ) ? PostsCSS.barDropDownMenuElement_active : ""}`} data-div_id="2" onMouseDown={(e) => handleOrderingElementClick(e)}> Newest </div>
                        <div className={`${PostsCSS.barDropDownMenuElement} ${ (dropdownElementActive == "3" ) ? PostsCSS.barDropDownMenuElement_active : ""}`} data-div_id="3" onMouseDown={(e) => handleOrderingElementClick(e)}> Oldest </div>
                        <div className={`${PostsCSS.barDropDownMenuElement} ${ (dropdownElementActive == "4" ) ? PostsCSS.barDropDownMenuElement_active : ""}`} data-div_id="4" onMouseDown={(e) => handleOrderingElementClick(e)}> Controversial </div>
                    </div>
                </div>
            </div>

            {/* display all posts */}
            <div className={PostsCSS.postsBodyContainer}>
                {postData.map((value, key) =>{
                    let str = value.createdAt;

                    var datePosted= new Date(str)
                    var dateStringPosted = postDateToDisplay(datePosted)

                    return (
                            
                        <div className={PostsCSS.postContainer} key = {key}>
                            {/* likes */}
                            
                                {authState.authStatus 
                                ?
                                // do something
                                <div className={PostsCSS.likesContainer}>
                                    <div className={`${value.liked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={() => handleLike(value.id) }>
                                        <BiUpvote className={PostsCSS.likeClass} size="40px" />
                                    </div>
                                    <div className={`${ (value.liked || value.disliked) ? PostsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div>
                                    <div className={`${value.disliked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={() => handleDislike(value.id) }>
                                        <BiDownvote className={PostsCSS.likeClass} size="40px" />
                                    </div>
                                </div>
                                :
                                // do something else.
                                <div className={PostsCSS.likesContainer}>
                                    <div className={`${value.liked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={()=> handleLoginFromPosts()}>
                                        <BiUpvote className={PostsCSS.likeClass} size="40px" />
                                    </div>
                                    <div className={`${ (value.liked || value.disliked) ? PostsCSS.likeCounterClass_active: ""}`}> {value.Likes.length - value.Dislikes.length} </div>
                                    <div className={`${value.disliked ? PostsCSS.likeBackgroundClass_active: ""} ${PostsCSS.likeBackgroundClass}`} onClick={()=> handleLoginFromPosts()}>
                                        <BiDownvote className={PostsCSS.likeClass} size="40px" />
                                    </div>
                                </div>  
                                }
                                
                            {/* content */}
                            <div className={PostsCSS.postContentClass}>
                                {/* Text */}
                                <Link  className={PostsCSS.postMainTextClass}  to={`/blog/${value.id}`}> 
                                    <div className = {PostsCSS.postAuthor}>{`Posted by ${value.username} ${dateStringPosted}`} </div>
                                    <div className = {PostsCSS.postTitle}>
                                        {value.title.length > 300 ? value.title.substring(0, 300) + "..." : value.title} 
                                    </div>
                                    <div className = {PostsCSS.postContent}>
                                        {value.contentText.length > 800 ? value.contentText.substring(0,800) + "..." : value.contentText} 
                                    </div>

                                </Link>
                                {/* Buttons */}
                                <div className={PostsCSS.buttonListClass}> 
                                    {/* <Link to = {`/blog/${value.id}`} className= {PostsCSS.buttonClass} > comments <BiComment/> </Link> */}
                                    <Link to = {`/blog/${value.id}`} className= {PostsCSS.buttnElementBackgroundClass} > 
                                            <BiComment size="30px"/> 
                                            <div > {value.commentCounter} comments</div>
                                    </Link>
                                    {(authState.UserId === value.UserId) 
                                    ?   
                                    (<button className= {PostsCSS.buttnElementBackgroundClass} onClick={()=> handleOnClickDelete(value.id)}>  
                                            <AiOutlineDelete  size="30px"/>
                                            <div >Delete Post </div>     
                                    </button>) 
                                    : 
                                    ""
                                    }
                                    {(authState.UserId === value.UserId) 
                                    ?   
                                    (<button className= {PostsCSS.buttnElementBackgroundClass}> 
                                            <FiEdit2 size="30px"/>
                                            <div > Edit Post</div>
                                    </button>) 
                                    : 
                                    ""
                                    }
                                    
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Posts
