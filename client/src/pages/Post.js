import React from 'react'
import {useParams} from "react-router-dom"
import PostCSS from "./Post.module.css"

const Post = () => {
    let {id } = useParams();  
    return (
        <div className={PostCSS.postContainer}> 
            <div className={PostCSS.textStyle}> {`Welcome to post ${id}`} </div>
        </div>
    )
}

export default Post
