const {Op} = require("sequelize")
const {Posts}= require('../models');
const fetch = require("node-fetch")
const APICountersIncrement = require("./SpaceAPICountersHelpers/APICountersIncrement.js")
const APICountersThrottle = require("./SpaceAPICountersHelpers/APICountersThrottle.js");


// This is called after the Individual API call is made. The purpose of this is to parse out launch data from the api call and return a newLaunch object.
// "data_in" has the response from the api call.
const parseLaunchData = async(data_in, fetchFuture) => {

    // this is definitely a new launch, proceed..
    let launch_id;
    let title;
    let vehicle_description;
    let mission_description;
    let status;
    let imgURL;
    let vidURL;
    let launchDate;
    let launchSeconds;
    let padName;
    let locationName;
    let countryCode;
    let futureFlag;
    let futureFlagToInsert;

    if(fetchFuture)
    {
        futureFlagToInsert = "Y"
    }
    else
    {
        futureFlagToInsert = "N"
    }

    try{ launch_id             =  await data_in.id;                                } catch {launch_id =null}
    try{ title                 =  await data_in.name;                              } catch {title =null}
    try{ vehicle_description   =  await data_in.rocket.configuration.description;  } catch {vehicle_description =null}
    try{ mission_description   =  await data_in.mission.description;               } catch {mission_description =null}
    try{ status                =  await data_in.status.abbrev;                     } catch {status =null}
    try{ imgURL                =  await data_in.image;                             } catch {imgURL =null}
    try{ vidURL                =  await data_in.vidURLs[0].url;                    } catch {vidURL =null}
    try{ launchDate            =  await new Date(data_in.net);                     } catch {launchDate =null}
    try{ launchSeconds         =  Math.floor(launchDate.getTime()/1000)          } catch {launchSeconds =null}
    try{ padName               =  await data_in.pad.name;                          } catch {padName =null}
    try{ locationName          =  await data_in.pad.location.name;                 } catch {locationName =null}
    try{ countryCode           =  await data_in.pad.location.country_code;         } catch {countryCode =null}
    try{ futureFlag            =  futureFlagToInsert                               } catch {futureFlag =null}

    let newLaunch = {
        launch_id: launch_id,
        title: title,
        vehicle_description: vehicle_description,
        mission_description: mission_description,
        status: status,
        imgURL: imgURL,
        vidURL: vidURL,
        launchDate: launchDate,
        launchSeconds: launchSeconds,
        padName: padName,
        locationName: locationName,
        countryCode: countryCode,
        futureFlag: futureFlag
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
    // if no post is found, create a new post for the launch!
    if(!foundPost)
    {
        let currTime_secs = Math.floor((new Date()).getTime() / 1000)
        const newPost = {
            title: "Discussion thread -- " + newLaunch.title,
            contentText: newLaunch.mission_description + " -- To Launch: " + newLaunch.launchDate,
            username: "mod",
            launchId: newLaunch.launch_id,
            timePosted_seconds: currTime_secs
        };
        const newPostCreated= await Posts.create(newPost);
        newLaunch.postId = newPostCreated.id;
    }
    return newLaunch
}

// fetch detail data for launches and upsert into DB.
// skips launches that already exist — saves API calls for next cycle.
// returns count of launches now present in the DB from this batch.
const fetchAndUpsertLaunches = async (data_results, fetchFuture, Launches) => {
    let upsertCount = 0;

    for (let i = 0; i < data_results.length; i++)
    {
        const launchIdFromList = data_results[i].id;

        // check if this launch already exists in DB
        const existingLaunch = await Launches.findOne({
            where: { launch_id: launchIdFromList }
        });

        // if it already exists, skip the individual API call
        if (existingLaunch) {
            console.log("Launch " + launchIdFromList + " already exists, skipping API call.");
            upsertCount++;
            continue;
        }

        // check throttle before each API call
        if (!(await APICountersThrottle())) {
            console.log("Rate limit reached, stopping fetch. Got " + upsertCount + " launches so far.");
            break;
        }

        // this is a new launch — fetch individual detail
        let api_url;
        if (fetchFuture) {
            api_url = `https://lldev.thespacedevs.com/2.2.0/launch/upcoming/${launchIdFromList}`;
        } else {
            api_url = `https://lldev.thespacedevs.com/2.2.0/launch/previous/${launchIdFromList}`;
        }

        console.log("Fetching detail for new launch: ", launchIdFromList);

        try {
            const fetch_response = await fetch(api_url);
            await APICountersIncrement();

            const data = await fetch_response.json();

            let newLaunch = await parseLaunchData(data, fetchFuture);
            newLaunch = await createNewPost(newLaunch);
            await Launches.create(newLaunch);

            upsertCount++;
            console.log("Inserted launch: " + launchIdFromList);
        } catch (err) {
            console.log("Error fetching/inserting launch " + launchIdFromList + ":", err);
            // continue to next launch rather than failing entirely
        }
    }

    return upsertCount;
}

// prune excess launches down to a maximum count, keeping the most recent.
// called AFTER all upserts are done.
const pruneExcessLaunches = async (maxCount, fetchFuture, Launches) => {
    const totalCount = await Launches.count();
    if (totalCount <= maxCount) {
        return;
    }

    // for previous launches, keep highest launchSeconds (most recent past).
    // for upcoming launches, keep lowest launchSeconds (soonest upcoming).
    const order = fetchFuture ? [['launchSeconds', 'ASC']] : [['launchSeconds', 'DESC']];

    // find the IDs of launches to keep
    const launchesToKeep = await Launches.findAll({
        attributes: ['id'],
        order: order,
        limit: maxCount
    });
    const idsToKeep = launchesToKeep.map(l => l.id);

    // delete everything NOT in the keep list
    const deleted = await Launches.destroy({
        where: {
            id: { [Op.notIn]: idsToKeep }
        }
    });
    console.log("Pruned " + deleted + " excess launches from " + (fetchFuture ? "upcoming" : "previous") + " table.");
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
    fetchAndUpsertLaunches: fetchAndUpsertLaunches,
    pruneExcessLaunches: pruneExcessLaunches,
    sortAscending: sortAscending
}
