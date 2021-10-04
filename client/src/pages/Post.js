import {React,useEffect, useState} from 'react'
import {useParams} from "react-router-dom"
import PostCSS from "./Post.module.css"
import axios from   "axios" 
import Page404 from "./Page404"


const Post = () => {
    const [individualPostData, setIndividualPostData] = useState({title: '', contentText: '', username: ''})
    const [validFlag, setValidFlag] = useState(false)

    // use params allows me to fetch params 
    let {id } = useParams();

    // on render, get individual post data from backend and display for the user.
    useEffect( () => {
        axios.get(`/api/posts/${id}`)
            .then( (response) =>{
                setIndividualPostData(response.data);
                setValidFlag(true)
            })
            .catch( err => {
                setValidFlag(false);
            })
    }, []);

    // if not a valid ID, render 404. else, render the post! 
    if(!validFlag)
    {
        return (<Page404/>)
    }
    else
    {
        return (
            <div className={PostCSS.postContainer}> 
                <div className={PostCSS.textStyle}> {`Welcome to post ${id}`} </div>
                <div className={PostCSS.textStyle}> {individualPostData.title}</div>
            </div>
        )
    }
    
}

export default Post
