const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
const {Posts}= require('../models');


// get launch info for display. 
router.get('/', async (request, response) => {
    // const api_url = `https://ll.thespacedevs.com/2.2.0/launch/previous`
    // const api_url = `https://lldev.thespacedevs.com/2.2.0/launch/previous`
    // const fetch_response = await fetch(api_url)
    // // fetch response. parse out id's.
    // const json = await fetch_response
    //                 .json()
    //                 .then( data => {
    //                     console.log(data.results[0].id)
    //                 })
    //                 .catch( (err) => console.log("Error: ", err) )


    // response.json(json)
    
})

// if there's a new ID, append and delete an old ID.
router.post("/", async(request, response) => 
{   
    // const {title, contentText,username}  = request.body;
    // const newPost = {
    //     title: title,
    //     contentText: contentText,
    //     username: username
    // };
    // await Posts.create(newPost);
    // response.json(newPost)

    const api_url = `https://ll.thespacedevs.com/2.2.0/launch/previous`
    const fetch_response = await fetch(api_url)
    const json = await fetch_response.json()
    // response.json(json)
    console.log(json)

    // parse out ID's from request.

    // check table of Launches, if new ID, append.

})
module.exports = router;



