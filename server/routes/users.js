const express= require('express');
const router = express.Router();
const {Users}= require('../models');
const bcrypt = require("bcryptjs")

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

// 
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
    
            if(!match) 
            {
                response.status(401).json({error: "Wrong username and password combination!"})
            }
            else
            {
                response.json({msg: "logged in!"})
            }
        })
    }
    
})


module.exports = router;
