const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
const {LaunchesPrevious}= require('../models');
const {LaunchesUpcoming}= require('../models');


// get launch info for display. 
router.get('/previous', async (request, response) => {
    
    const launchData = await LaunchesPrevious.findAll()
    response.json(launchData)
})

// get launch info for display. 
router.get('/upcoming', async (request, response) => {
    
    const launchData = await LaunchesUpcoming.findAll()
    response.json(launchData)
})


module.exports = router;



