

const fetch = require("node-fetch")
const express = require('express');
const db = require('./models')
const {Posts}= require('./models')

require('dotenv').config();


const app = express()

/// run on port specified, else run on 3001.
const PORT = process.env.PORT || 3001 

// setting up such that db is loaded .
db.sequelize.sync().then ( () => {
    app.listen(PORT, () => console.log(`listening at ${PORT}`))

});  

// loading in static HTML.
app.use(express.static('public')) 
// allowing express to parse JSON.
app.use(express.json({limit : '1mb'})) 

// some routes.
app.get('/posts/', async (request, response) => {
    const post = {
        title: "bob",
        username: "karinsteve",
        postText: "it's working!"

    }
    await Posts.create(post);
    response.json(post);
})


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