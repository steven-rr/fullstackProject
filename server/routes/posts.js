const express= require('express');
const router = express.Router();
const {Posts}= require('../models');

// instantiate a member.
router.get('/', async (request, response) => {
    const post = {
        title: "bob",
        contentText: "it's working!",
        username: "karinsteve",
    }
    await Posts.create(post);
    response.json(post);
})

module.exports = router;


