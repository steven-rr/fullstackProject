const {Op} = require("sequelize")
const {APICounters}= require('../models');
const {Posts}= require('../models');
const fetch = require("node-fetch")
const APICountersCheck = require("./SpaceAPICountersHelpers/APICountersCheck.js")
const APICountersIncrement = require("./SpaceAPICountersHelpers/APICountersIncrement.js")
const APICountersThrottle = require("./SpaceAPICountersHelpers/APICountersThrottle.js")


// This is called after the Individual API call is made. The purpose of this is to parse out launch data from the api call and return a newLaunch object. 
// "data_in" has the response from the api call.
const parseLaunchData = async(data_in) => {
    let launch_id;
    let title;
    let vehicle_description;
    let mission_description;
    let imgURL;
    let vidURL;
    let launchDate;
    let padName;
    let locationName; 
    let countryCode;
    
    try{ launch_id             =  await data_in.id;                                } catch {launch_id =null}
    try{ title                 =  await data_in.name;                              } catch {title =null}
    try{ vehicle_description   =  await data_in.rocket.configuration.description;  } catch {vehicle_description =null}
    try{ mission_description   =  await data_in.mission.description;               } catch {mission_description =null}
    try{ imgURL                =  await data_in.image;                             } catch {imgURL =null}
    try{ vidURL                =  await data_in.vidURLs[0].url;                    } catch {vidURL =null}
    try{ launchDate            =  await new Date(data_in.net);                     } catch {launchDate =null}
    try{ padName               =  await data_in.pad.name;                          } catch {padName =null}
    try{ locationName          =  await data_in.pad.location.name;                 } catch {locationName =null}
    try{ countryCode           =  await data_in.pad.location.country_code;         } catch {countryCode =null}

    let newLaunch = {   
        launch_id: launch_id,
        title: title,
        vehicle_description: vehicle_description,
        mission_description: mission_description,
        imgURL: imgURL,
        vidURL: vidURL,
        launchDate: launchDate,
        padName: padName,
        locationName: locationName,
        countryCode: countryCode
    };

    // find if a post with the launch Id already exists. 
    const foundPost = await Posts.findOne({
        where: {launchId: newLaunch.launch_id}
    })  

    // if it does, add the post ID.
    if(foundPost)
    {
        newLaunch.postId = foundPost.id;
    }
    return newLaunch;
}
// create new post if it doesn't exist yet.
const createNewPost = async( newLaunch) => {
    const foundPost = await Posts.findOne({
        where: {launchId: newLaunch.launch_id}
    })
    console.log("... CREATE.... NEW........POST.....:", newLaunch)
    console.log( " " );
    // if no post is found, create a new post for the launch!
    if(!foundPost) 
    {
        const newPost = {
            title: "Discussion thread -- " + newLaunch.title,
            contentText: newLaunch.mission_description + " -- To Launch: " + newLaunch.launchDate,
            username: "mod",
            launchId: newLaunch.launch_id
        };
        const newPostCreated= await Posts.create(newPost);
        console.log("... NEW.... POST........CREATED.....:", newPostCreated)

        newLaunch.postId = newPostCreated.id;
        console.log("... NEW.... LAUNCH........MODIFIED.....:", newLaunch)
    }
    return newLaunch

}

// insert launches from external SPACE api.
const insertNewLaunches = async (data_results,start_idx, fetchFuture,Launches) =>{
    // insert launches 1 by 1 within this loop.     
    for(let i = start_idx; i < 10; i++)
    {
        // make sure i dont exceed API call limit.
        if( await APICountersThrottle() )
        {
            let api_url;
            if(fetchFuture)
            {
                api_url = `https://lldev.thespacedevs.com/2.2.0/launch/upcoming/${data_results[i].id}`
            }
            else
            {
                api_url = `https://lldev.thespacedevs.com/2.2.0/launch/previous/${data_results[i].id}`
            } 
            console.log("requesting this id: ", data_results[i].id)
            let fetch_response = await fetch(api_url)
            
            // parse out fetch_response. add data to table. 
            await fetch_response
                        .json()
                        .then( async (data) => {
                            console.log("INSERTTTTT... NEW.... LAUNCHES........")
                            let newLaunch = await parseLaunchData(data);
                            newLaunch = await createNewPost(newLaunch);
                            await Launches.create(newLaunch);
                        })

            // increment API counter.
            await APICountersIncrement();
        }
    }
}

// delete outdated launches, and prepare for insertion. 
const deleteOutdatedLaunches = (matchedID, Launches) => {
    // if no match, replace all elements.
    if(matchedID == null)
    {
        Launches.destroy({
            where: {},
            truncate: true
        })
    } 
    // if match, delete all elements before. 
    else
    {
        Launches.destroy({
            where: { id: {[Op.lt]: matchedID} },
        })
    }
}   

// find SQL ID of the oldest launch id element
const findIDmatch = async (oldestID, Launches) =>{
    const insertionPoint = await Launches.findOne({ where: {launch_id: oldestID} })
                                .then( data => {

                                    // return id of matching element.
                                    return data.dataValues.id;
                                })
                                .catch( (err) =>  null )
    return insertionPoint;
}
// return max ID.
const findMaxID = async (Launches) =>{
    const maxIdx = await Launches
                            .findOne( {order: [['id','DESC']]} )
                            .then( data => data.dataValues.id)
                            .catch( (err) => null)
    return maxIdx;
}
// find start index.
const findStartIDX =  (matchedID, max_idx) =>  {
    let start_idx;
    if(max_idx == null || matchedID ==null)
    {
        start_idx = 0;
    }
    else
    {
        start_idx = max_idx - matchedID + 1;
    }
    return start_idx;
}

// get previous launches, and sort ascending. 
const sortAscending = (data_json_results)=> {
    let data_json_results_new = []
    for(let i =0 ; i<10; i++)
    {
        let idx = 9-i; 
        data_json_results_new[i] = data_json_results[idx];
    }
    return data_json_results_new
}


module.exports = {
    parseLaunchData: parseLaunchData,
    insertNewLaunches: insertNewLaunches,
    deleteOutdatedLaunches: deleteOutdatedLaunches,
    findIDmatch:findIDmatch,
    findMaxID: findMaxID,
    findStartIDX:findStartIDX,
    sortAscending: sortAscending
}