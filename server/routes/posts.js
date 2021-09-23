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
    await Posts.create(newPost);
    response.json(newPost)
})
module.exports = router;



