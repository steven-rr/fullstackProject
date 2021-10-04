const express= require('express');
const router = express.Router();
const {Posts}= require('../models');

// get all posts in database and send to frontend.
router.get('/', async (request, response) => {
    const postData = await Posts.findAll()
    response.json(postData)
})

// append a newpost from front end to backend.
router.post("/", async(request, response) => {
    const {title, contentText,username}  = request.body;
    const newPost = {
        title: title,
        contentText: contentText,
        username: username
    };
    const newPostCreated= await Posts.create(newPost);
    response.json(newPostCreated)
})

// get individual post data in database and send to frontend.
router.get('/:id', async (request, response) => {
    const id = request.params.id;
    const individualPostData = await Posts.findByPk(id)

    // if post data not found, return 404. else, return post data.
    if(!individualPostData)
    {
        response.status(404).json({msg: "post not found!!!"})

    }
    else
    {
        response.json(individualPostData)

    }
})

module.exports = router;



