const express= require('express');
const router = express.Router();
const {Users}= require('../models');
const bcrypt = require("bcryptjs")
const {createTokens}=require("../JWT.js")
const cookieParser = require("cookie-parser");
const {validateToken}=require("../JWT.js")

// register a user. only occurs after client-side and server-side validation.
router.post('/register', async (request, response) => {
    // parse out info from frontend.
    const {username , password, email} = request.body;
    
    // hash the password, then register user.
    bcrypt.hash(password, 10).then( (hash) =>
    {
        const newUser = {
            username: username,
            password: hash,
            email: email
        };
        Users.create(newUser);
        response.json(newUser)
    })
    
    
})
// server-side validation.
router.get('/register', async (request, response) => { 
    console.log("called");
    // parse out info from frontend.
    const values = await request.query;
    console.log("query: ", values)
    // err container, to be filled as errors pop up.
    let err = {};
    for(let key in values) {
        // individual json element defined by key and value pair. example: {username: "steven"}
        let toFind = {};
        toFind[key]= values[key]

        // find whether value exists in database. 
        let valueExists = await Users.findOne({where: toFind})
        
        // if value exists, append to error list.
        if(valueExists)
        {   
            // string defining error msg
            let errmsg = "That " + key + " is taken!"
            // define key for the error. based off the key name. example: if key = "username", errKey = "usernameErr"
            let errKey = key + "Err"; 
            // append error to error list.
            err[errKey] = errmsg;
        } 

        // if value is empty, say its empty.
        if(values[key] === "")
        {
            // string defining error msg
            let errmsg = "Please enter a " + key + "!" 
            // define key for the error. based off the key name. example: if key = "username", errKey = "usernameErr"
            let errKey = key + "Err"; 
            // append error to error list.
            err[errKey] = errmsg;
        }
    }

    // if there are any errors, throw the error back. else, throw success back!
    if(Object.keys(err).length > 0)
    {
        response.status(409).json(err);
    }
    else
    {
        response.json({msg: "no backend register errors!"});
    }
})

// if user exists and password is correct, log in and return json web token.
router.post('/login', async (request, response) => {
    const {username , password} = request.body;
    const user = await Users.findOne({ where: {username: username} })
    if(!user)
    {
        console.log("no such user found..")
        response.status(404).json({ error: "User Doesn't exist!"})
    }
    else
    {
        bcrypt.compare(password, user.password).then( async (match) => {
            console.log("match: " ,match)
            // if password is correct, return the accessToken and store in cookie.
            if(!match) 
            {
                response.status(401).json({error: "Wrong username and password combination!"})
            }
            else
            {
                

                const accessToken = createTokens(user.dataValues);
                const expirationDate = 60*60*24*90*1000;
                response.cookie("access-token", accessToken, {maxAge: expirationDate, httpOnly: true }) // storing payload into cookie.
                response.json({username: user.username, id: user.id})
            }
        })
    }
    
})
// check backend to make sure user is authenticated. 
router.get('/validate',validateToken, async (request, response) => { 
    response.json(request.user)

})
//  delete cookie to eliminate priveleages and logout. 
router.get('/logout',validateToken, async (request, response) => { 
    console.log("logout hit.")

    try
    {
        response.clearCookie("access-token");   
        console.log("succesfully deleted cookie.")
        response.json(response.user)

    }
    catch
    {
        console.log("error in logout")
        response.status(404).json({err: "something went wrong."})
    }

})

router.get("/publicProfile/:UserId" , async (request, response) => {
    // get user ID param from request.
    const UserId = request.params.UserId;
    // find corresponding user with the userID.
    const publicProfile = await Users.findByPk(UserId, {
        attributes: {exclude: ["password", "email"]}
    });
    // if it exists, return some basic info. else, throw error.
    if(publicProfile)
    {
        response.json(publicProfile);
    }
    else
    {
        response.status(404).json({err: "you messed something up."})
    }

})
module.exports = router;
