const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
const {LaunchesPrevious}= require('../models');
const {LaunchesUpcoming}= require('../models');
const {UniqueCountries} = require('../models');


// get launch info for display.
router.get('/previous', async (request, response) => {
    try {
        const launchData = await LaunchesPrevious.findAll({
                                                    order: [['id','DESC']]})
        response.json(launchData)
    } catch (err) {
        console.log("Error fetching previous launches:", err)
        response.status(500).json({ error: "Failed to fetch previous launches" })
    }
})

// get launch info for display.
router.get('/upcoming', async (request, response) => {
    try {
        const launchData = await LaunchesUpcoming.findAll()
        response.json(launchData)
    } catch (err) {
        console.log("Error fetching upcoming launches:", err)
        response.status(500).json({ error: "Failed to fetch upcoming launches" })
    }
})

// get unique country info for display on dropdown.
router.get('/uniqueCountries', async(request, response) => {
    try {
        const uniqueCountryData = await UniqueCountries.findAll()
        response.json(uniqueCountryData)
    } catch (err) {
        console.log("Error fetching unique countries:", err)
        response.status(500).json({ error: "Failed to fetch unique countries" })
    }
})
module.exports = router;



