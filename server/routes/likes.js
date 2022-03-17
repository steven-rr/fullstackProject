const express= require('express');
const router = express.Router();
const fetch = require("node-fetch");
const { validateToken } = require('../middleware/JWT.js');
const {Dislikes, Likes, Posts,LaunchesPrevious,LaunchesUpcoming, Comments} = require('../models');


// post a like
router.post("/like", validateToken, async(request, response) => {
    const {PostId} = request.body;
    const UserId = request.user.id;
    
    // find out whether relevant launch exists in launchesprev. used for determining what to decrement or increment. 
    let launchPrev = await LaunchesPrevious.findOne({where: {postId: PostId} })

    // find out whether a like exists or not. 
    const likeExists = await Likes.findOne({where: {PostId: PostId, UserId: UserId} })
    const dislikeExists = await Dislikes.findOne({where: {PostId: PostId, UserId: UserId} })
    // if the like exists, destroy it (unliking). 
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
    // else, create the like and increment counters. if dislike exists, destroy any dislikes and increment counter..
    else
    {
        const newLike= {
            UserId: UserId,
            PostId: PostId 
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

        // if a dislike exists , destroy it and increment counter back up on both tables. 
        if(dislikeExists)
        {
            await Dislikes.destroy({where:  {UserId: UserId, PostId: PostId}})
            await Posts.increment('likeCounter', { where: {id:PostId}});
            if(launchPrev)
            {
                // if dislike exist, we destroyed it so increment the likeCounter. 
                if(dislikeExists)
                {
                    await LaunchesPrevious.increment('likeCounter', { where: {postId:PostId}});
                }
            }
            else
            {
                // if dislike exist, we destroyed it so increment the likeCounter. 
                if(dislikeExists)
                {
                    await LaunchesPrevious.increment('likeCounter', { where: {postId:PostId}});
                }
            }
        }



        response.json({liked: true, dislikeExists: dislikeExists})
        
    }
})

// post a dislike
router.post("/dislike", validateToken, async(request, response) => {
    const {PostId} = request.body;
    const UserId = request.user.id;
    
    // find out whether relevant launch exists in launchesprev. used for determining what to decrement or increment. 
    let launchPrev = await LaunchesPrevious.findOne({where: {postId: PostId} })

    // find out whether a like exists or not. 
    const dislikeExists = await Dislikes.findOne({where: {PostId: PostId, UserId: UserId} })
    const likeExists = await Likes.findOne({where: {PostId: PostId, UserId: UserId} })

    console.log(dislikeExists)
    // if the dislikelike exists, destroy it (unliking). 
    if(dislikeExists)
    {
        await Dislikes.destroy({where:  {UserId: UserId, PostId: PostId}})
        // increment likecounter in posts after removing dislike
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

        response.json({disliked: false})
    }
    // else, create the dislike. if a like exists, destroy it and decrement counter. 
    else
    {
        console.log("creating new dislike...")
        const newDislike= {
            PostId: PostId, 
            UserId: UserId,
        };
        const newDislikeCreated = await Dislikes.create(newDislike)
        // decrement likecounter in posts
        await Posts.decrement('likeCounter', { where: {id:PostId}});
        // decrement likecounter in launches
        if(launchPrev)
        {
            await LaunchesPrevious.decrement('likeCounter', { where: {postId:PostId}});

        }
        else
        {
            await LaunchesUpcoming.decrement('likeCounter', { where: {postId:PostId}});
        }

        // if a like exists , destroy it and decrement counter back down on both tables. 
        if(likeExists)
        {
            await Likes.destroy({where:  {UserId: UserId, PostId: PostId}})
            await Posts.decrement('likeCounter', { where: {id:PostId}});
            if(launchPrev)
            {
                await LaunchesPrevious.decrement('likeCounter', { where: {postId:PostId}});
            }
            else
            {
                await LaunchesUpcoming.decrement('likeCounter', { where: {postId:PostId}});
            }

        }
        response.json({disliked: true, likeExists: likeExists})
        
    }

    
})

// post a like, for backend.
router.post("/likeComment", validateToken, async(request, response) => {
    const {CommentId} = request.body;
    const UserId = request.user.id;
    
    // find out whether relevant launch exists in launchesprev. used for determining what to decrement or increment. 
    let launchPrev = await Comments.findOne({where: {id: CommentId} })

    // find out whether a like exists or not. 
    const likeExists = await Likes.findOne({where: {CommentId: CommentId, UserId: UserId} })
    const dislikeExists = await Dislikes.findOne({where: {CommentId: CommentId, UserId: UserId} })
    // if the like exists, destroy it (unliking). 
    if(likeExists)
    {
        await Likes.destroy({where:  {UserId: UserId, CommentId: CommentId}})
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
    // else, create the like and increment counters. if dislike exists, destroy any dislikes and increment counter..
    else
    {
        const newLike= {
            UserId: UserId,
            PostId: PostId 
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

        // if a dislike exists , destroy it and increment counter back up on both tables. 
        if(dislikeExists)
        {
            await Dislikes.destroy({where:  {UserId: UserId, PostId: PostId}})
            await Posts.increment('likeCounter', { where: {id:PostId}});
            if(launchPrev)
            {
                // if dislike exist, we destroyed it so increment the likeCounter. 
                if(dislikeExists)
                {
                    await LaunchesPrevious.increment('likeCounter', { where: {postId:PostId}});
                }
            }
            else
            {
                // if dislike exist, we destroyed it so increment the likeCounter. 
                if(dislikeExists)
                {
                    await LaunchesPrevious.increment('likeCounter', { where: {postId:PostId}});
                }
            }
        }



        response.json({liked: true, dislikeExists: dislikeExists})
        
    }
})


module.exports = router;

