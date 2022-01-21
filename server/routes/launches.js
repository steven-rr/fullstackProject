const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
const {LaunchesPrevious}= require('../models');
const {LaunchesUpcoming}= require('../models');
const {UniqueCountries} = require('../models');


// get launch info for display. 
router.get('/previous', async (request, response) => {
    const launchData = await LaunchesPrevious.findAll({
                                                order: [['id','DESC']]})
    response.json(launchData)
})

// get launch info for display. 
router.get('/upcoming', async (request, response) => {
    const launchData = await LaunchesUpcoming.findAll()

    response.json(launchData)
})

// get unique country info for display on dropdown.
router.get('/uniqueCountries', async(request, response) => {
    const uniqueCountryData = await UniqueCountries.findAll()
    response.json(uniqueCountryData)
})
module.exports = router;



