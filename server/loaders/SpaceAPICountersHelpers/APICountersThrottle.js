const {APICounters}= require('../../models');
const APICountersCheck = require("./APICountersCheck")

require('dotenv').config();

// throttle api counter requests
const APICountersThrottle = async () =>
{
    // if API counter doesn't exist, create one.
    await APICountersCheck();

    // get API counter.
    const APIcounter = await APICounters.findOne({ where: {id: '1'} })
  
    // check if API counter is less than threshold and return as bool.
    const threshold = process.env.SPACE_API_THROTTLE_THRESHOLD || 100;
    return ( APIcounter.dataValues.counter < threshold )
}

module.exports = APICountersThrottle;