
const express = require('express');
const db = require('./models')

require('dotenv').config();

// instantiate server 
const app = express()

/// run on port specified, else run on 3001.
const PORT = process.env.PORT || 3001 



// loading in static HTML.
app.use(express.static('public')) 

// allowing express to parse JSON.
app.use(express.json({limit : '1mb'})) 

// set up posts routes.
app.use('/api/posts', require('./routes/posts'))

// set up misc routes.
app.use('/misc', require('./routes/misc'))

// listen.
// setting up such that db is loaded .
db.sequelize.sync().then ( () => {
    app.listen(PORT, () => console.log(`listening at ${PORT}`))

});  