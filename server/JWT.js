const {sign, verify} = require("jsonwebtoken");
require('dotenv').config();
 
const createTokens= (user)=> {
    const accessToken = sign(
        {username: user.username, id: user.id}, 
        process.env.JSON_WEB_TOKEN_SECRET_KEY
        );
    return accessToken;
}

module.exports = {createTokens};