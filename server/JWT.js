const {sign, verify} = require("jsonwebtoken");
require('dotenv').config();
 
const createTokens= (user)=> {
    console.log("createtokens_ username: ", user.username)
    console.log("createtokens_ username: ", user.id)

    const accessToken = sign(
        {username: user.username, id: user.id}, 
        process.env.JSON_WEB_TOKEN_SECRET_KEY
        );
    return accessToken;
}

const validateToken = (request, response, next) => {
    console.log("validate token hit!");
    const accessToken = request.cookies["access-token"];
    console.log(accessToken);
    // if no valid access token in cookies, return auth error.
    if(!accessToken)
    {
        return response.status(404).json({error: "user not authenticated!"});
    }

    // try to make sure that the token is valid. if so, then authentication is good, can proceed with request.
    try 
    {
        const validToken = verify(accessToken , process.env.JSON_WEB_TOKEN_SECRET_KEY)
        request.user = validToken;
        if(validToken)
        {
            request.authenticated = true;
            console.log("validate token success.")
            return next();
        }
        
    }
    catch(err)
    {
        return response.status(404).json({error: err})
    }
}
module.exports = {createTokens, validateToken};