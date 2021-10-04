import React from 'react'
import CreatePostCSS from "./CreatePost.module.css"

const CreatePost = () => {
    return (
        <div className={CreatePostCSS.createPostPageContainer}>
            <div className={CreatePostCSS.createPostHeaderContainer}> 
                <div className={CreatePostCSS.headerStyle}> Create a Post </div>
            </div>
            <div className={CreatePostCSS.createPostBodyContainer}>
                <input 
                    className={CreatePostCSS.titleField}
                    type= "text"
                    name= "title"
                    placeholder="Title..."
                />
                {/* <input 
                    className={CreatePostCSS.bodyField}
                    type= "text"
                    name= "title"
                    placeholder="Text..."
                /> */}
                <textarea  className={CreatePostCSS.bodyField} name="text" rows="14" cols="10" wrap="soft" placeholder="Enter your thoughts here..."> </textarea>

            </div>
        </div>
    )
}

export default CreatePost
