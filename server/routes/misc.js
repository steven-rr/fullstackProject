const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();
require('dotenv').config();


// some routes.
router.post('/', (request, response) =>
{
    console.log("I got a request!")
    console.log(request.body);
    const data = request.body
    response.json({
        status: 'success',
        lat: data.latitude,
        lon: data.longitude 
    })
})

router.get('/getPreviousLaunches', async (request, response) => {

    const api_url = `https://ll.thespacedevs.com/2.2.0/launch/previous`
    const fetch_response = await fetch(api_url)
    const json = await fetch_response.json()
    response.json(json)
    console.log(json)

})

router.get('/getUpcomingLaunches', async (request, response) => {

    const api_url = `https://ll.thespacedevs.com/2.2.0/launch/upcoming`
    const fetch_response = await fetch(api_url)
    const json = await fetch_response.json()
    response.json(json)
    console.log(json)

})

router.get('/out', async (request, response) => {
    const lat = 28.4;
    const lon = -81.4;    
    response.json({
        status: 'success',
        lat: lat,
        lon: lon 
    })
    console.log(json)

})

module.exports = router;


