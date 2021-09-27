const {APICounters}= require('../../models');

// check that a counter exists. if not, create one.
const APICountersCheck = async () =>
{
    // check if API counter exists in SQL.
    const counterCheck =await APICounters.findOne({ where: {id: '1'}})
    
    // if API counter does not exist, create a counter.
    if(counterCheck === null)
    {
        const newCounter = {
            counter: '0'
        };
        await APICounters.create(newCounter);
    }

        
}
module.exports = APICountersCheck;