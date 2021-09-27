const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
const {LaunchesPrevious}= require('../models');


// get launch info for display. 
router.get('/', async (request, response) => {
    
    const launchData = await LaunchesPrevious.findAll()
    response.json(launchData)
})

module.exports = router;



