const express= require('express');
const router = express.Router();
const {Comments}= require('../models');


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
router.post("/", async(request, response) => {
    const newComment  = request.body;

    const newCommentCreated = await Comments.create(newComment);
    response.json(newCommentCreated)
})

module.exports = router;
