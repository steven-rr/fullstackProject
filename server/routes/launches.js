const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
const {Launches}= require('../models');


// get launch info for display. 
router.get('/', async (request, response) => {
    
    const launchData = await Launches.findAll()
    response.json(launchData)
})

module.exports = router;



