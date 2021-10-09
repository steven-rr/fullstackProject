const { response } = require('express');
const express= require('express');
const router = express.Router();
const {Posts, Likes}= require('../models');
const {validateToken}=require("../JWT.js")
const {LaunchesUpcoming}= require('../models');
const {Op} = require("sequelize")
const sequelize= require("sequelize")
// get all post data for a specific user. send to frontend.
router.get('/byUserId/:UserId', async (request, response) => {
    const UserId = request.params.UserId;
    const postData = await Posts.findAll({
        where: {UserId: UserId}
    })

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
router.get('/', async (request, response) => {
    

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
                        include: [Likes] , 
                        order: [['inflatedPriority','DESC']]})
    response.json(postData)
})

// append a newpost from front end to backend.
router.post("/", validateToken, async(request, response) => {
    // parse out info from body.
    const {title, contentText}  = request.body;
    // use info from body, and info from token (user info).
    const newPost = {
        title: title,
        contentText: contentText,
        username: request.user.username,
        UserId: request.user.id
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



