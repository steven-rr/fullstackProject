import {React,useEffect, useState, useContext, useRef} from 'react'
import TextAreaCSS from "./TextArea.module.css"


const TextArea = ({defaultVal,  handleSave = (contentIn) => true, editFlag, setEditflag}) => {
    const [textAreaHeight, setTextAreaHeight] = useState("auto");
    const [parentHeight, setParentHeight] = useState("auto");
    const [editPostContent, setEditPostContent] = useState(defaultVal)
    // const [editFlag, setEditflag] = useState(true)

	const textAreaRef = useRef();

    // on render set parent height:
    useEffect( () => {
        if(textAreaRef.current)
        {
            setParentHeight("auto")
            setTextAreaHeight("auto")
            setParentHeight(`${textAreaRef.current.scrollHeight + 58}px`);
            setTextAreaHeight(`${textAreaRef.current.scrollHeight+ 58}px`);
            console.log("useEffect for textarea activated. 2", textAreaRef.current.scrollHeight)

        }
        console.log("useEffect for textarea activated. 1")
    }, [editFlag, editPostContent])

    useEffect( ()=> {
        setEditPostContent(defaultVal)
    }, defaultVal)

    const editPostContentOnChange= (e) => {
        setTextAreaHeight("auto");
        setEditPostContent(e.target.value)
    }
    const handleEditCancel = () => {
        setEditPostContent(defaultVal)
        setEditflag(false)
    }
    const handleSaveEditPost = async () => {
        let succeded = handleSave(editPostContent)
        succeded ? setEditflag(false) : setEditflag(true)
    }
    console.log("text area current value: ", editPostContent)
    return (
        
        <div className={TextAreaCSS.createCommentFieldContainer}>
            <textarea
                className={TextAreaCSS.createCommentField}
                name="body" 
                ref={textAreaRef}
                style= {{
                    height:textAreaHeight,
                }}
                wrap="soft" 
                cols="10" 
                placeholder={"Enter your thoughts here..." }
                onChange={editPostContentOnChange}
                value={editPostContent}
            />
            <button className={TextAreaCSS.editPostButtonClass} onClick={handleEditCancel}> CANCEL </button>
            <button className={TextAreaCSS.editPostButtonClass} onClick={handleSaveEditPost}> SAVE </button>
        </div>
       
    )
}

export default TextArea

