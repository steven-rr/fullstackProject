const express= require('express');
const router = express.Router();
const {Users}= require('../models');
const bcrypt = require("bcrypt")

// register a user.
// should check if username is taken.
    
router.post('/register', async (request, response) => {
    const {username , password, email} = request.body;
    
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

module.exports = router;
