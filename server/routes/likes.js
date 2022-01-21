const express= require('express');
const router = express.Router();
const fetch = require("node-fetch");
const { validateToken } = require('../middleware/JWT.js');
const {Likes, Posts,LaunchesPrevious,LaunchesUpcoming} = require('../models');


// post a like
router.post("/", validateToken, async(request, response) => {
    const {PostId} = request.body;
    const UserId = request.user.id;
    
    // find out whether relevant launch exists in launchesprev. used for determining what to decrement or increment. 
    let launchPrev = await LaunchesPrevious.findOne({where: {postId: PostId} })

    // find out whether a like exists or not. 
    const likeExists = await Likes.findOne({where: {PostId: PostId, UserId: UserId} })

    // if the like exists, destroy it (unliking). else, create the like 
    if(likeExists)
    {
        await Likes.destroy({where:  {UserId: UserId, PostId: PostId}})
        // decrement likecounter in posts
        await Posts.decrement('likeCounter', { where: {id:PostId}});
        // increment likecounter in launches
        if(launchPrev)
        {
            await LaunchesPrevious.decrement('likeCounter', { where: {postId:PostId}});
        }
        else
        {
            await LaunchesUpcoming.decrement('likeCounter', { where: {postId:PostId}});
        }

        response.json({liked: false})
    }
    else
    {
        const newLike= {
            PostId: PostId, 
            UserId: UserId,
        };
        const newLikeCreated = await Likes.create(newLike)
        // increment likecounter in posts
        await Posts.increment('likeCounter', { where: {id:PostId}});
        // increment likecounter in launches
        if(launchPrev)
        {
            await LaunchesPrevious.increment('likeCounter', { where: {postId:PostId}});

        }
        else
        {
            await LaunchesUpcoming.increment('likeCounter', { where: {postId:PostId}});
        }
        response.json({liked: true})
        
    }

    
})
module.exports = router;

