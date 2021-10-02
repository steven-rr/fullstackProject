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
    const userCheck = await Users.findOne({where: { username: username }});
    const emailCheck = await Users.findOne({where: {email: email }});
    if(userCheck && emailCheck)
    {
        response.status(409).json({ userNameErr: "Username already exists. Please choose another.",
                        emailErr: "Email already exists. Please choose another."})
    }
    if(userCheck)
    {
        response.status(409).json({ userNameErr: "Username already exists. Please choose another.",
                        emailErr: ""})
    }
    if(emailCheck)
    {
        response.status(409).json({ emailErr: "Email already exists. Please choose another.",
                        userNameErr: ""})
    }
    else
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
module.exports = router;
