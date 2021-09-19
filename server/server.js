const fetch = require("node-fetch")
const express = require('express');
require('dotenv').config();

const app = express()
app.listen(3001, () => console.log('listening at 3001'))

app.use(express.static('public'))
app.use(express.json({limit : '1mb'}))

app.post('/api', (request, response) =>
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

app.get('/api/weather', async (request, response) => {
    const lat = 28.4;
    const lon = -81.4;    
    const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_API_KEY}`
    const fetch_response = await fetch(api_url)
    const json = await fetch_response.json()
    response.json(json)
    console.log(json)

})

app.get('/api/out', async (request, response) => {
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