const {APICounters}= require('../../models');
const APICountersCheck = require("./APICountersCheck")

require('dotenv').config();

// reset API counter back to zero.
const APICountersThrottle = async () =>
{
    console.log("hit API throttle!!!!")
    // if API counter doesn't exist, create one.
    await APICountersCheck();

    // get API counter.
    const APIcounter = await APICounters.findOne({ where: {id: '1'} })
    
    console.log("API counter: ", APIcounter);
    console.log("API counter num: ", APIcounter.dataValues.counter)
    console.log("API counter lim: ", process.env.SPACE_API_THROTTLE_THRESHOLD)

    // check if API counter is less than threshold and return as bool.
    return ( await (APIcounter.dataValues.counter < process.env.SPACE_API_THROTTLE_THRESHOLD) )
}

module.exports = APICountersThrottle;