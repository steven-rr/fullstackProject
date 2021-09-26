const {Launches} = require('../models')
const {APICounters}= require('../models');
const fetch = require("node-fetch")
const APICountersCheck = require("./APICountersMiddleware/APICountersCheck.js")
const APICountersIncrement = require("./APICountersMiddleware/APICountersIncrement.js")
const APICountersThrottle = require("./APICountersMiddleware/APICountersThrottle.js")

const insertNewLaunches = async (launch_ids_new,start_idx) =>
{
    var counterrrrrr = 0;
    console.log("inside insert new launches....")
    // individual launch fetch    
    for(let i = start_idx; i < 10; i++)
    {
        // make sure i dont exceed API call limit.
        if( await APICountersThrottle() )
        {
            
            let idx = 9 - i;
            let api_url = `https://lldev.thespacedevs.com/2.2.0/launch/previous/${launch_ids_new[idx]}`
            
            let fetch_response = await fetch(api_url)
            
            // parse out fetch_response. add data to table. 
            await fetch_response
                        .json()
                        .then( async (data) => {
                            let newLaunch = {
                                launch_id: data.id, 
                                title: data.name,
                                description: data.rocket.configuration.description
                            }
                            await Launches.create(newLaunch);
                            console.log("fetch response for OLDEST MEMBER: "  ,data)
                        })

            // increment API counter.
            await APICountersIncrement();

            //increment visual counter:
            counterrrrrr = counterrrrrr + 1;
            console.log("counterrrrrrr: " , counterrrrrr);
        }
        
    }
}

const findIDmatch = async (oldestID) =>
{
    const insertionPoint = await Launches.findOne({ where: {launch_id: oldestID} })
                                .then( data => {
                                    console.log("HERE'S THE DATA!!!: " , data)
                                    return data;
                                })
                                .catch( (err) => console.log("ERROR SPACEAPIFETCH: ", err) )
}

const SpaceAPIFetch = async () =>
{   
    // make sure i fetch before hitting the limit.
    if( APICountersThrottle() )
    {
        const api_url = `https://lldev.thespacedevs.com/2.2.0/launch/previous`
        const fetch_response = await fetch(api_url)

        // increment API counter.
        await APICountersIncrement();


        // fetch response. parse out id's.
        const json = await fetch_response
                        .json()
                        .then( data => {
                            // get launch id's into array form: 
                            const launch_ids_new = [];
                            for(let i = 0; i < 10; i ++)
                            {
                                launch_ids_new[i] = data.results[i].id;
                            }

                            // get oldest launch id:
                            const oldestID = launch_ids_new[9]
                            
                            // get ID of element with oldest launch ID.
                            const matchID =  findIDmatch(oldestID);

                            // delete outdated launches and find start_idx.
                            const start_idx = 0;

                            // insert new launches!
                            insertNewLaunches(launch_ids_new, start_idx)

                        })
                        .catch( (err) => console.log("Error: ", err) )

        console.log("hit inside space api fetch...!!");

    }
    
    
    

    console.log("running space api fetch...");
}

module.exports = SpaceAPIFetch;