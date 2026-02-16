
const express = require('express');
const db = require('./models');
const cron = require('node-cron');
const path = require('path');
const cookieParser =require('cookie-parser')
const SpaceAPIFetch = require('./loaders/SpaceAPIFetch')
const noCache = require('./middleware/NoCache')
const updateUniqueCountries = require('./helpers/updateUniqueCountries')

const APICountersReset = require('./loaders/SpaceAPICountersHelpers/APICountersReset')
require('dotenv').config();

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

// // --------------------- UPDATE UNIQUE COUNTRIES --------------------
// every 15 minutes , update unique countries.
cron
    .schedule('*/15 * * * *', () =>{
        console.log('cron to update unique countries!');
        updateUniqueCountries();
    })
// // --------------------- UPDATE UNIQUE COUNTRIES --------------------

// instantiate server 
const app = express()

/// run on port specified, else run on 3001.
const PORT = process.env.PORT || 3001

const host = '0.0.0.0'

//turn off cache.
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

// loading in static HTML.
app.use(express.static('public')) 

// allowing express to parse JSON.
app.use(express.json({limit : '1mb'})) 

// allow cookies.
app.use(cookieParser());

// set up user routes.
app.use('/api/users', require('./routes/users'))

// set up posts routes.
app.use('/api/posts', require('./routes/posts'))

// set up comments routes.
app.use('/api/comments', require('./routes/comments'))

// set up launch routes.
app.use('/api/launches', require('./routes/launches'))

// set up like routes.
app.use('/api/likes/', require('./routes/likes'))
// set up misc routes.
app.use('/misc', require('./routes/misc'))

// set up for rendering static assets:
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname,'..','client','build')));

    app.get('*',noCache, (request, response) => {
        response.sendFile(path.resolve(__dirname,'../client','build','index.html'));
    })
}
// listen.
// setting up such that db is loaded before server begins to listen.
db.sequelize
    .sync() 
    .then ( async () => {
            await updateUniqueCountries();
            await SpaceAPIFetch(); 
            app.listen(PORT, host, () => console.log(`listening at ${PORT}`))
    })
    .catch( (err) => {
        console.log(err);
    });  



