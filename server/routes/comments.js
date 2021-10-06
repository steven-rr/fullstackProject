const express= require('express');
const router = express.Router();
const {Comments}= require('../models');
const {validateToken}=require("../JWT.js")


// get comments of an individual post in database and send to frontend.
router.get('/:postId', async (request, response) => {
    const postId = request.params.postId;
    const comments = await Comments.findAll({where: {PostId: postId}})

    // if post data not found, return 404. else, return post data.
    if(!comments)
    {
        response.status(404).json({msg: "post not found!!!"})

    }
    else
    {
        response.json(comments)

    }
})


// append a newcomment from front end to backend sql server.
router.post("/",validateToken, async(request, response) => {

    const newComment  = request.body; // set contentText.
    newComment.username = request.user.username; //set username from validateToken();
    newComment.UserId = request.user.id; // set userId from validateToken();
    const newCommentCreated = await Comments.create(newComment);
    response.json(newCommentCreated)
})

// delete a comment.
router.delete("/:commentId", validateToken, async(request,response) => {
    const commentId =request.params.commentId;
    // find comment:
    const individualCommentData = await Comments.findByPk(commentId)

    // if user ID is the same as userID for comment, proceed. else, return forbidden.
    if(request.user.id === individualCommentData.UserId)
    {
        console.log("DELETEING THE FOLLOWING COMMENT: ", commentId)
        const commentDeleted = await Comments.destroy ({ where: {id: commentId} })
        if(!commentDeleted)
        {   
            console.log("uh oh, didn't find the comment.")
            response.status(404).json({msg: "comment not found!!!"})
        }
        else
        {
            console.log("deleted succesfully.")
            response.json({msg: "success!"});
        }
    }
    else
    {
        console.log("forbidden! you are not the author of this comment.")
        response.status(404).json({msg: "forbidden! you are not the author of this comment."})
    }
    
})

module.exports = router;
