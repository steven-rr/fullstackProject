const {APICounters}= require('../../models');
const APICountersCheck = require("./APICountersCheck")

// reset API counter back to zero.
const APICountersIncrement = async () =>
{
    // if API counter doesn't exist, create one.
    await APICountersCheck();

    // increment API counter.
    await APICounters.increment('counter', { 
        by: 1,
        where: {id: '1'}
    })
}

module.exports = APICountersIncrement;