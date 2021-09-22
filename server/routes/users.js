const express= require('express');
const router = express.Router();
const {Users}= require('../models');

// instantiate a member.
router.post('/', async (request, response) => {
    const newUser = {
        username: request.body.username,
        password: request.body.password,
        email: request.body.email,
    }
    await Users.create(newUser);
    response.json(newUser);
})

module.exports = router;
