const express= require('express');
const router = express.Router();
const fetch = require("node-fetch");
const { validateToken } = require('../JWT.js');
const {Likes} = require('../models');


// post a like
router.post("/", validateToken, async(request, response) => {
    const {PostId} = request.body;
    const UserId = request.user.id;
    
    const likeExists = await Likes.findOne({where: {PostId: PostId, UserId: UserId} })
    // if the like exists, destroy it (unliking). else, create the like 
    if(likeExists)
    {
        await Likes.destroy({where:  {UserId: UserId, PostId: PostId}})
        response.json({liked: false})
    }
    else
    {
        const newLike= {
            PostId: PostId, 
            UserId: UserId,
        };
        const newLikeCreated = await Likes.create(newLike)
        response.json({liked: true})
        
    }

    
})
module.exports = router;

