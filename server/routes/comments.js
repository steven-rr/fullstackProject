const express= require('express');
const router = express.Router();
const {Comments, Posts,Likes, Dislikes}= require('../models');
const {Op} = require("sequelize")
const {validateToken, peekToken}=require("../middleware/JWT.js")

// get all comment data for a specific user. send to frontend.
router.get('/byUserId/:UserId', async (request, response) => {
    const UserId = request.params.UserId;
    const commentData = await Comments.findAll({
        where: {UserId: UserId}
    })

    // if comment data not found, return 404. else, return post data.
    if(!commentData)
    {
        response.status(404).json({msg: "no posts found!!!"})
    }
    else
    {
        response.json(commentData)
    }
})

// get comments of an individual post in database and send to frontend.
router.get('/:postId', peekToken, async (request, response) => {

    const postId = request.params.postId;
    const comments = await Comments.findAll( {where: {PostId: postId}, include: [{model: Likes} , {model: Dislikes}]})
    
    

    // if post data not found, return 404. else, return comment data.
    if(!comments)
    {
        response.status(404).json({msg: "post not found!!!"})

    }
    else
    {
        // loop through comments:
        for(let i =0; i< comments.length; i++)
        {
            comments[i].dataValues.hasBeenDeleted = false
            comments[i].dataValues.hasDescendants = false
        }
        console.log("here are comments:", comments)
        // if user exists, append comment array on whether user likes or dislikes.
        let commentIDsDisliked = [];
        let commentIDsLiked    = [];

        if(request.user)
        {
            const userLikes = await Likes.findAll({where: {UserId: request.user.id, CommentId: {[Op.not]: null} }})
            // find which comment ID's liked by user
            for(let i =0; i< userLikes.length;i ++)
            {
                commentIDsLiked.push(userLikes[i].dataValues.CommentId) 
                console.log ("hi!")
            }
            console.log("commentIDsLiked: ", commentIDsLiked)
            for(let i=0 ; i < commentIDsLiked.length; i++)
            {
                for(let j = 0; j < comments.length; j++)
                {
                    
                    if(commentIDsLiked[i] == comments[j].dataValues.id)
                    {
                        comments[j].dataValues.liked = true
                        
                    } 
                    else if(comments[j].dataValues.liked ==null)
                    {
                        comments[j].dataValues.liked = false
                    }

                }
            }
            // do the same for dislikes:
            const userDislikes = await Dislikes.findAll({where: {UserId: request.user.id, CommentId: {[Op.not]: null}}})

            for(let i =0; i< userDislikes.length;i ++)
            {
                commentIDsDisliked.push(userDislikes[i].dataValues.CommentId)
            }

            for(let i=0 ; i < commentIDsDisliked.length; i++)
            {
                for(let j = 0; j < comments.length; j++)
                {
                    
                    if(commentIDsDisliked[i] == comments[j].dataValues.id)
                    {
                        comments[j].dataValues.disliked = true;
                        break;
                    } 
                    else if(comments[j].dataValues.disliked == null)
                    {
                        comments[j].dataValues.disliked = false
                    }

                }
            }


        }

        response.json(comments)
    }
})


// append a newcomment from front end to backend sql server.
router.post("/",validateToken, async(request, response) => {

    const newComment  = request.body; // set contentText.
    newComment.PostId = parseInt(newComment.PostId);
    newComment.username = request.user.username; //set username from validateToken();
    newComment.UserId = request.user.id; // set userId from validateToken();
    newComment.parentId = null;
    const newCommentCreated = await Comments.create(newComment);
    newCommentCreated.dataValues.liked = false
    newCommentCreated.dataValues.disliked = false
    newCommentCreated.dataValues.Likes= []
    newCommentCreated.dataValues.Dislikes = []

    //increment comment counter.
    await Posts.increment('commentCounter', { where: {id:newComment.PostId}});

    //return response.
    response.json(newCommentCreated)
})

// delete a comment.
router.delete("/:commentId", validateToken, async(request,response) => {
    const commentId =request.params.commentId;
    // find comment:
    const individualCommentData = await Comments.findByPk(commentId)
    console.log("im in delete and here's the data: ", individualCommentData)
    // if user ID is the same as userID for comment, proceed. else, return forbidden.
    if(request.user.id === individualCommentData.UserId)
    {
        console.log("im in userid deleting")
        console.log("DELETEING THE FOLLOWING COMMENT: ", commentId)
        const commentDeleted = await Comments.destroy ({ where: {id: commentId} })
        if(!commentDeleted)
        {   
            console.log("uh oh, didn't find the comment.")
            response.status(404).json({msg: "comment not found!!!"})
        }
        else
        {
            // decrement comment counter after succesfully deleting
            await Posts.decrement('commentCounter', { where: {id:individualCommentData.PostId}});

            console.log("deleted succesfully.")
            //return response.
            response.json({msg: "success!"});
        }
    }
    else
    {
        console.log("forbidden! you are not the author of this comment.")
        response.status(404).json({msg: "forbidden! you are not the author of this comment."})
    }
    
})

// append a newreply from front end to backend sql server.
router.post("/reply",validateToken, async(request, response) => {

    const newReply  = request.body; // set contentText.
    console.log("newreply: ", newReply);
    newReply.username = request.user.username; //set username from validateToken();
    newReply.UserId = request.user.id; // set userId from validateToken();
    const newReplyCreated = await Comments.create(newReply);
    newReplyCreated.dataValues.liked = false
    newReplyCreated.dataValues.disliked = false
    newReplyCreated.dataValues.Likes= []
    newReplyCreated.dataValues.Dislikes = []

    response.json(newReplyCreated)
})


module.exports = router;
