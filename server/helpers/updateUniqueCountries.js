const {UniqueCountries, LaunchesPrevious, LaunchesUpcoming}= require('../models');
const {Op} = require("sequelize")

const deriveCountryName = async (countryCode) => {
    let countryName;
    if(countryCode == "USA")
    {
        countryName = "USA"
    } 
    else if(countryCode == "CHN")
    {
        countryName = "China"
    }
    else if(countryCode == "RUS")
    {
        countryName = "Russia"
    }
    else if(countryCode == "IND")
    {
        countryName = "India"
    }
    else if(countryCode == "IRN")
    {
        countryName = "Iran"
    }
    else if(countryCode == "KAZ")
    {
        countryName = "Kazakhstan"
    }
    else if(countryCode == "Global")
    {
        countryName = "Global"
    }
    else if(countryCode == "UNK")
    {
        countryName = "Unknown"
    }
    return countryName
}
const forloopToFinish = async (seenAlready) => {

    for (var i = 0; i < seenAlready.length; i++) 
    { 
        let countryName;
        countryName = await deriveCountryName(seenAlready[i])
        let newCountryToADD = {
            countryCode: seenAlready[i],
            countryName: countryName,
            index: i
        };
        await UniqueCountries.create(newCountryToADD);
    }
}
const deriveSeenAlready = async() => {
    // now loop through all launches. 
    const launchDataPrevious = await LaunchesPrevious.findAll()
    const launchDataUpcoming = await LaunchesUpcoming.findAll()
    seenAlready = ["Global", "USA", "CHN", "RUS"]

    launchDataPrevious.forEach( async (launchDatum) => {
        

        // find if country_code exists, if not add it.
        if(!seenAlready.includes(launchDatum.dataValues.countryCode) )
        {
            if(launchDatum.dataValues.countryCode != "UNK")
            {
                seenAlready.push(launchDatum.dataValues.countryCode)
            }
        }  
    })
    launchDataUpcoming.forEach( async(launchDatum) => {
        // find if country_code exists, if not add it.
        if(!seenAlready.includes(launchDatum.dataValues.countryCode) )
        {
            if(launchDatum.dataValues.countryCode != "UNK")
            {
                seenAlready.push(launchDatum.dataValues.countryCode)
            }
        } 
    })
    return seenAlready
}
const updateUniqueCountries = async () => {

    UniqueCountries.destroy({
        where: {},
        truncate: true})

    const seenAlready = await deriveSeenAlready()
    seenAlready.push("UNK")
    forloopToFinish(seenAlready)
    
        

}
module.exports = updateUniqueCountries
