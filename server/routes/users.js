const express= require('express');
const router = express.Router();
const {Users}= require('../models');
const bcrypt = require("bcryptjs")

// register a user.
// should check if username is taken.
// should enforce password and username and email restrictions. dont create if these failed.
router.post('/register', async (request, response) => {
    // parse out info from frontend.
    const {username , password, email} = request.body;
    
    // check whether username or email already exists.
    const usernameErr = await Users.findOne({where: { username: username }});
    const emailErr = await Users.findOne({where: {email: email }});
    // if user already exists, send errors back.
    if(usernameErr && emailErr)
    {   
        response.status(409).json({ usernameErr: "Username already exists. Please choose another.",
                        emailErr: "Email already exists. Please choose another."})
    }
    else if (usernameErr)
    {
        response.status(409).json({ usernameErr: "That username is taken!",
                        emailErr: ""})
    }
    else if(emailErr)
    {
        response.status(409).json({ emailErr: "That email is taken!",
                        userNameErr: ""})
    }
    else //if no error, add user to database!
    {   
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
    }
    
})
router.post('/login', async (request, response) => {
    const {username , password} = request.body;
    const user = await Users.findOne({ where: {username: username} })
    if(!user)
    {
        console.log("no such user found..")
        response.json({ error: "User Doesn't exist!"})
    }
    bcrypt.compare(password, user.password).then( async (match) => {
        console.log("match: " ,match)

        if(!match) 
        {
            response.json({error: "Wrong username and password combination!"})
        }
    })
})

router.get('/register', async (request, response) => { 
    console.log(request.username)
    console.log(request)
    // parse out info from frontend.
    const {username , email} = request.body;

    // check whether username or email already exists.
    const usernameErr = await Users.findOne({where: { username: username }});
    const emailErr = await Users.findOne({where: {email: email }});

    // return whether username or email exists.
    // if user already exists, send errors back.
    if(usernameErr && emailErr)
    {   
        response.json({ usernameErr: "Username already exists. Please choose another.",
                        emailErr: "Email already exists. Please choose another."})
    }
    else if (usernameErr)
    {
        response.json({ usernameErr: "That username is taken!",
                        emailErr: ""})
    }
    else if(emailErr)
    {
        response.json({ emailErr: "That email is taken!",
                        userNameErr: ""})
    }
})
module.exports = router;
