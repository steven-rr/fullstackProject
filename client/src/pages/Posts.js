import React, { useState, useEffect } from 'react' 
import PostsCSS from "./Posts.module.css"
import axios from   "axios" 

const Posts = () => {
    const [postData, setPostData] = useState([])

    // on render, get posts from backend and display for the user.
    useEffect( () => {
        axios.get("/api/posts").then( (response) =>{
            setPostData(response.data);
        })
    }, []);

    // send a new post from frontend to backend. TODO: dont hardcode a fakepost.
    const createPost = async (e) => {
        const fakePost = {
            title: "Evergrand about to go bankrupt!",
            contentText: "Apparently Evergrand is about to go bankrupt, which is not really the best news. It might affect the US economy. We have gathered this intel from Meet Patel during the dayjob.",
            username: "stevenrr"
        };
        // const fakePost = {
        //     title: "WoW may come back",
        //     contentText: "WoW actually may come back to a store near you. Experience the latest version of the classic MMORPG. It was obviously better than Runescape, let's be frank!",
        //     username: "adcompanyX"
        // };
        const response = await axios
                                .post('/api/posts',fakePost)
                                .then( res => {
                                    console.log(res)
                                })
                                .catch( (err) => console.log("Error:", err ) )
    }
    return (
        <div>
            <div className= {PostsCSS.textStyle}>Steven, check out these posts. </div>
            <button onClick = {createPost}>Create Post</button>
            {postData.map((value, key) =>{
                return (
                    <div> 
                        <div>{value.title} </div>
                        <div>{value.contentText} </div>
                        <div>{value.username} </div>
                    </div>
                    
                )
            })}
        </div>
    )
}

export default Posts
