const {APICounters}= require('../../models');
const APICountersCheck = require("./APICountersCheck")

// reset API counter back to zero.
const APICountersReset = async () =>
{
    // if API counter doesn't exist, create one.
    await APICountersCheck();

    // reset counter to zero.
    await APICounters.update( 
        {counter: '0'},
        {where: {id: '1'} 
    });
}

module.exports = APICountersReset;