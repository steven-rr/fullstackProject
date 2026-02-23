const {LaunchesPrevious} = require('../models')
const {LaunchesUpcoming} = require('../models')
const fetch = require("node-fetch")
const SpaceAPIUtils = require("./SpaceAPIFetchUtilities")

const APICountersIncrement = require("./SpaceAPICountersHelpers/APICountersIncrement.js")
const APICountersThrottle = require("./SpaceAPICountersHelpers/APICountersThrottle.js")

const setAppropriateVars = (fetchFuture) => {
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
// uses "fetch first, swap later" — never deletes data until replacements are confirmed.
const SpaceAPIFetchHandler = async (fetchFuture) => {
    // make sure we haven't hit the API limit.
    if (!(await APICountersThrottle())) {
        return;
    }

    let LaunchesTable, api_url;
    ({LaunchesTable, api_url} = setAppropriateVars(fetchFuture));

    try {
        const fetch_response = await fetch(api_url);
        await APICountersIncrement();

        const data = await fetch_response.json();

        // sort ascending for previous launches (most recent last).
        let results = data.results;
        if (!fetchFuture) {
            results = SpaceAPIUtils.sortAscending(results);
        }

        // fetch detail and upsert for each launch that's new.
        // launches already in the DB are skipped (no API call wasted).
        const upsertCount = await SpaceAPIUtils.fetchAndUpsertLaunches(
            results, fetchFuture, LaunchesTable
        );

        console.log("Upserted " + upsertCount + " launches (fetchFuture=" + fetchFuture + ")");

        // only prune if we have more than 10 launches in the table.
        await SpaceAPIUtils.pruneExcessLaunches(10, fetchFuture, LaunchesTable);

    } catch (err) {
        console.log("Error in SpaceAPIFetchHandler:", err);
        // API failure — existing data stays untouched.
    }
}

const SpaceAPIFetch = async () => {
    let fetchFuture = false;
    await SpaceAPIFetchHandler(fetchFuture);
    fetchFuture = true;
    await SpaceAPIFetchHandler(fetchFuture);
}
module.exports = SpaceAPIFetch;
