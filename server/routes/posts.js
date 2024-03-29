const { response } = require('express');
const express= require('express');
const router = express.Router();
const {Posts, Likes, Dislikes}= require('../models');
const {validateToken, peekToken}=require("../middleware/JWT.js")
const {LaunchesUpcoming}= require('../models');
const {Op} = require("sequelize")
const sequelize= require("sequelize")
// get all post data for a specific user. send to frontend.
router.get('/byUserId/:UserId', async (request, response) => {
    const UserId = request.params.UserId;
    const postData = await Posts.findAll({
        where: {UserId: UserId}, 
        include: [ {model: Likes}, {model: Dislikes}] 
    })
    // if user exists, append to the postData array whether user likes or dislikes. 
    let postIDsDisliked =[];
    let postIDsLiked =[];

    if(UserId)
    {
        const userLikes = await Likes.findAll({where: {UserId: UserId , PostId: {[Op.not]: null}}})

        // find which post ID's liked by user. 
        for(let i =0; i< userLikes.length;i ++)
        {
            postIDsLiked.push(userLikes[i].dataValues.PostId)

            console.log ("hi!")
        }
        
        // console.log("postdata: ", postData[0].dataValues.title)
        // console.log("userInfo: ", request.user)
        for(let i=0 ; i < postIDsLiked.length; i++)
        {
            for(let j = 0; j < postData.length; j++)
            {
                
                if(postIDsLiked[i] == postData[j].dataValues.id)
                {
                    postData[j].dataValues.liked = true
                    
                } 
                else if(postData[j].dataValues.liked ==null)
                {
                    postData[j].dataValues.liked = false
                }

            }
        }

        // do the same for dislikes:
        const userDislikes = await Dislikes.findAll({where: {UserId: UserId, PostId: {[Op.not]: null}}})

        for(let i =0; i< userDislikes.length;i ++)
        {
            postIDsDisliked.push(userDislikes[i].dataValues.PostId)
        }

        for(let i=0 ; i < postIDsDisliked.length; i++)
        {
            for(let j = 0; j < postData.length; j++)
            {
                
                if(postIDsDisliked[i] == postData[j].dataValues.id)
                {
                    postData[j].dataValues.disliked = true;
                    break;
                } 
                else if(postData[j].dataValues.disliked == null)
                {
                    postData[j].dataValues.disliked = false
                }

            }
        }
    }
    console.log("postIDsLiked2: ", postIDsLiked)
    console.log("postIDsDisliked2: ", postIDsDisliked)



    // if post data not found, return 404. else, return post data.
    if(!postData)
    {
        response.status(404).json({msg: "no posts found!!!"})
    }
    else
    {
        response.json(postData)
    }
})

// get all posts in database and send to frontend.
router.get('/',peekToken, async (request, response) => {
    

    // sort data.
    // find next up launch ID.
    const nextUpLaunch =await  LaunchesUpcoming.findOne({ order: [['createdAt','ASC']]})

    //future code here to correlate posts by likes... 

    // inflate priority for data in recent week. 
    var datetime = new Date();
    datetime.setDate(datetime.getDate() - 7);
    console.log(datetime);
    await Posts.update({inflatedPriority: sequelize.col('id')} , {where: {id: {[Op.gt]: 0} }})
    await Posts.increment(['inflatedPriority'] , {by: 1000, where: {createdAt: {[Op.gt]: datetime}} })


    // inflate priority by launchID.
    await Posts.update({inflatedPriority: 999999}, {where: {launchId: nextUpLaunch.dataValues.launch_id}})

    // sort by priority.
    const postData = await Posts.findAll({
                        include: [ {model: Likes}, {model: Dislikes}] , 
                        order: [['inflatedPriority','DESC']]})



    // if user exists, append to the postData array whether user likes or dislikes. 
    let postIDsDisliked =[];
    let postIDsLiked =[];

    if(request.user)
    {
        const userLikes = await Likes.findAll({where: {UserId: request.user.id , PostId: {[Op.not]: null}}})

        // find which post ID's liked by user. 
        for(let i =0; i< userLikes.length;i ++)
        {
            postIDsLiked.push(userLikes[i].dataValues.PostId)

            console.log ("hi!")
        }
        
        // console.log("postdata: ", postData[0].dataValues.title)
        // console.log("userInfo: ", request.user)
        for(let i=0 ; i < postIDsLiked.length; i++)
        {
            for(let j = 0; j < postData.length; j++)
            {
                
                if(postIDsLiked[i] == postData[j].dataValues.id)
                {
                    postData[j].dataValues.liked = true
                    
                } 
                else if(postData[j].dataValues.liked ==null)
                {
                    postData[j].dataValues.liked = false
                }

            }
        }

        // do the same for dislikes:
        const userDislikes = await Dislikes.findAll({where: {UserId: request.user.id, PostId: {[Op.not]: null}}})

        for(let i =0; i< userDislikes.length;i ++)
        {
            postIDsDisliked.push(userDislikes[i].dataValues.PostId)
        }

        for(let i=0 ; i < postIDsDisliked.length; i++)
        {
            for(let j = 0; j < postData.length; j++)
            {
                
                if(postIDsDisliked[i] == postData[j].dataValues.id)
                {
                    postData[j].dataValues.disliked = true;
                    break;
                } 
                else if(postData[j].dataValues.disliked == null)
                {
                    postData[j].dataValues.disliked = false
                }

            }
        }
    }
        console.log("postIDsLiked: ", postIDsLiked)
        console.log("postIDsDisliked: ", postIDsDisliked)


    response.json(postData)
})

// append a newpost from front end to backend.
router.post("/", validateToken, async(request, response) => {
    // parse out info from body.
    const {title, contentText}  = request.body;
    // get current time the post is being posted in seconds.
    let currTime_secs = (new Date()).getTime() / 1000

    // use info from body, and info from token (user info).
    const newPost = {
        title: title,
        contentText: contentText,
        username: request.user.username,
        UserId: request.user.id,
        timePosted_seconds: currTime_secs
    };
    const newPostCreated= await Posts.create(newPost);
    response.json(newPostCreated)
})

// edit post content text:
router.post("/editContentText", validateToken, async(request, response) => {
    // parse out info from body:
    const {contentText, PostId}  = request.body;

    // find post:
    const postData = await Posts.update({contentText: contentText}, {where: {id: PostId}})
    
    console.log("edit post content text:" , postData)
    response.json(postData)

})


// get individual post data in database and send to frontend.
router.get('/:id', peekToken, async (request, response) => {
    const id = request.params.id;
    const individualPostData = await Posts.findOne( {where: {id: id} , include: [ {model: Likes}, {model: Dislikes}]})
   
    // if post data not found, return 404. else, return post data.
    if(!individualPostData)
    {
        response.status(404).json({msg: "post not found!!!"})

    }
    else if(request.user)
    {   
        // get all likes that this user liked.
        // const userLikes = await Likes.findAll({where: {UserId: request.user.id}})
        const userLikes = await Likes.findOne({where: {UserId: request.user.id, PostId: id}})

        // get post ids in an array format. 
        if(userLikes)
        {
            individualPostData.dataValues.liked = true
        }
        else
        {
            individualPostData.dataValues.liked = false
        }


        // do the same for dislikes
        const userDislikes = await Dislikes.findOne({where: {UserId: request.user.id, PostId: id}})

        // get post ids in an array format. 
        if(userDislikes)
        {
            individualPostData.dataValues.disliked = true
        }
        else
        {
            individualPostData.dataValues.disliked = false
        }
    }
    response.json(individualPostData)

})

// cookie on backend used to ensure user is authorized. if so, attempt to delete post. 
router.delete("/:id", validateToken, async(request,response) => {
    const postId =request.params.id;

    // find post:
    const individualPostData = await Posts.findByPk(postId)
    console.log(request.user.id);
    console.log(individualPostData);
    // if user ID is the same as userID for post, proceed. else, return forbidden.
    if(request.user.id === individualPostData.UserId)
    {
        console.log("DELETEING THE FOLLOWING POST: ", postId)
        const postDeleted = await Posts.destroy ({ where: {id: postId} })
        if(!postDeleted)
        {
            console.log("uh oh, didn't find the post.")
            response.status(404).json({msg: "post not found!!!"})
        }
        else
        {
            console.log("deleted the post succesfully.")
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



