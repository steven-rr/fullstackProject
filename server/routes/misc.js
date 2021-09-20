const express= require('express');
const fetch = require("node-fetch")
const router = express.Router();


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

router.get('/weather', async (request, response) => {
    const lat = 28.4;
    const lon = -81.4;    
    const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_API_KEY}`
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
    response.json(json)
    console.log(json)

})

module.exports = router;


