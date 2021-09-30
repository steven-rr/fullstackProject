
const express = require('express');
const db = require('./models');
const cron = require('node-cron');
const fetch = require("node-fetch");
const path = require('path');
const SpaceAPIFetch = require('./middleware/SpaceAPIFetch')
const APICountersReset = require('./middleware/APICountersMiddleware/APICountersReset')
require('dotenv').config();

// --------------------- SELF PING SERVER ---------------------
const myURL = 'https://young-plains-00069.herokuapp.com/misc/out'
const pingMyURL = async () => {
    console.log("pinging myself..");
    const fetch_response = await fetch(myURL);
    const json_ping = await fetch_response.json();
    console.log(json_ping)
} 
cron.schedule('0,30 1-12 * * *', pingMyURL, { timezone: "America/New_York" })
// --------------------- SELF PING SERVER ---------------------
// --------------------- FETCH LAUNCH DATA --------------------
//every hour, reset API counter to zero .
cron
    .schedule('0 * * * *', () =>{
        console.log('cron reset hit!');
        APICountersReset();
    })
// every 15 minutes, pull from external API and update launches.
cron
    .schedule('*/15 * * * *', () =>{
        console.log('cron space api fetch hit!');
        SpaceAPIFetch();
    })
// // --------------------- FETCH LAUNCH DATA --------------------

// instantiate server 
const app = express()

/// run on port specified, else run on 3001.
const PORT = process.env.PORT || 3001 

// specify host for heroku deployment
const host = '0.0.0.0'

// loading in static HTML.
app.use(express.static('public')) 

// allowing express to parse JSON.
app.use(express.json({limit : '1mb'})) 

// set up user routes.
app.use('/api/users', require('./routes/users'))

// set up posts routes.
app.use('/api/posts', require('./routes/posts'))

// set up launch routes.
app.use('/api/launches', require('./routes/launches'))

// set up misc routes.
app.use('/misc', require('./routes/misc'))

// set up for rendering static assets:
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname,'..','client','build')));

    app.get('*', (request, response) => {
        response.sendFile(path.resolve(__dirname,'../client','build','index.html'));
    })
}
// listen.
// setting up such that db is loaded before server begins to listen.
db.sequelize
    .sync() 
    .then ( async () => {
            // await SpaceAPIFetch(); 
            app.listen(PORT, host, () => console.log(`listening at ${PORT}`))
    })
    .catch( (err) => {
        console.log(err);
    });  



