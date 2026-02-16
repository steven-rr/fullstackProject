const {LaunchesPrevious} = require('../models')
const {LaunchesUpcoming} = require('../models')
const {Op} = require("sequelize")
const {APICounters}= require('../models');
const fetch = require("node-fetch")
const SpaceAPIUtils = require("./SpaceAPIFetchUtilities")

const APICountersCheck = require("./SpaceAPICountersHelpers/APICountersCheck.js")
const APICountersIncrement = require("./SpaceAPICountersHelpers/APICountersIncrement.js")
const APICountersThrottle = require("./SpaceAPICountersHelpers/APICountersThrottle.js")

const setAppropriateVars= (fetchFuture) => {
    let LaunchesTable;
    let api_url;

    // use appropriate variables.
    if(fetchFuture)
    {
        LaunchesTable = LaunchesUpcoming
        api_url = `https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?ordering=net`
    }
    else
    {
        LaunchesTable = LaunchesPrevious
        api_url = `https://lldev.thespacedevs.com/2.2.0/launch/previous/?ordering=-net`
    }
    return {LaunchesTable, api_url}
}
// fetch data from space api and store into SQL database.
const SpaceAPIFetchHandler = async (fetchFuture) =>{   
    // make sure i fetch before hitting the limit.
    if( await APICountersThrottle() )
    {   
        // declare variables.
        var LaunchesTable;
        let api_url;
        
        // use appropriate variables.
        ({LaunchesTable, api_url} = setAppropriateVars(fetchFuture));
        
        const fetch_response = await fetch(api_url)

        // increment API counter.
        await APICountersIncrement();


        // fetch response. parse out id's.
        const json = await fetch_response
                        .json()
                        .then( async (data) => {
                            // always sort ascending. 
                            if(!fetchFuture)
                            {
                                data.results = SpaceAPIUtils.sortAscending(data.results);
                            }

                            // get oldest API launch id :
                            const oldest_Launch_ID = data.results[0].id

                            // get SQL ID of element with oldest API launch ID.
                            let matched_SQL_ID =  await SpaceAPIUtils.findIDmatch(oldest_Launch_ID, LaunchesTable);
                            
                            // delete outdated launches 
                            await SpaceAPIUtils.deleteOutdatedLaunches(matched_SQL_ID, LaunchesTable)
                            
                            //  find max id of table.
                            let max_SQL_ID = await SpaceAPIUtils.findMaxID(LaunchesTable);
                            
                            // get start idx by finding 
                            let start_SQL_ID = SpaceAPIUtils.findStartIDX(matched_SQL_ID, max_SQL_ID);
                            
                            // insert new launches.
                            await SpaceAPIUtils.insertNewLaunches(data.results, start_SQL_ID, fetchFuture, LaunchesTable)

                        })
                        .catch( (err) => console.log("Error: ", err) )
    }
}

const SpaceAPIFetch = async () =>{  
    let fetchFuture = false;
    await SpaceAPIFetchHandler(fetchFuture);
    fetchFuture = true;
    await SpaceAPIFetchHandler(fetchFuture);
} 
module.exports = SpaceAPIFetch;