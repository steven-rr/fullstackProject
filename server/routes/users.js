const express= require('express');
const router = express.Router();
require('dotenv').config();
const crypto =require('crypto')
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser");
const haiku = require('../helpers/haiku')
const {Users}= require('../models');
const {Op} = require("sequelize")
const {createTokens, validateToken}=require("../middleware/JWT.js")
const { OAuth2Client } = require('google-auth-library') 
const sgMail = require("@sendgrid/mail")
const client = new OAuth2Client(process.env.CLIENT_ID)

const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
    sgMail.setApiKey(sendgridApiKey);
} else {
    console.warn("SENDGRID_API_KEY is not set; outbound emails are disabled.");
}

const sendEmailSafe = async (emailToSend, context) => {
    if (!sendgridApiKey) {
        return;
    }
    try {
        await sgMail.send(emailToSend);
    } catch (error) {
        const status = error?.code || error?.response?.statusCode || "unknown";
        const details = error?.response?.body || error?.message || error;
        console.error(`[SendGrid ${context}] failed (${status})`, details);
    }
};

// register a user. only occurs after client-side and server-side validation.
router.post('/register', async (request, response) => {
    // parse out info from frontend.
    const {username , password, email} = request.body;
    
    // hash the password, then register user.
    bcrypt.hash(password, 10).then( (hash) =>
    {
        const newUser = {
            username: username,
            password: hash,
            email: email
        };
        Users.create(newUser);
        // in this case, we want to send an email back saying welcome to space launches.
        console.log("trying to welcome the following user email: ", email)
        const emailToSend= {
            from: '"Space Launches" <spacelaunches@outlook.com>',
            to: `${email}`,
            subject: "SPACE LAUNCHES -- WELCOME",
            text: `
            <p>Hello! Welcome to SPACE LAUNCHES!  The website where you can track upcoming space launches and discuss launches with friends or strangers worldwide. </p>
            <h5> Please feel free to browse the website at: </h5>
            <a href=${process.env.DOMAIN}> ${process.env.DOMAIN} </a> 
            ` ,
            html:  `
            <p>Hello! Welcome to SPACE LAUNCHES!  The website where you can track upcoming space launches and discuss launches with friends or strangers worldwide. </p>
            <h5> Please feel free to browse the website at: </h5>
            <a href=${process.env.DOMAIN}> ${process.env.DOMAIN} </a> 
            ` 
            // Let's verify your single sender so you can start sending email.
            // < email here> 
            // Your link is active for 48 hours. After that, you will need to resend the verification email.


        }
        sendEmailSafe(emailToSend, "welcome-email")
        response.json(newUser)
    })
    
    
})
// server-side validation.
router.get('/register', async (request, response) => { 
    console.log("called");
    // parse out info from frontend.
    const values = await request.query;
    console.log("query: ", values)
    // err container, to be filled as errors pop up.
    let err = {};
    for(let key in values) {
        // individual json element defined by key and value pair. example: {username: "steven"}
        let toFind = {};
        toFind[key]= values[key]

        // find whether value exists in database. 
        let valueExists = await Users.findOne({where: toFind})
        
        // if value exists, append to error list.
        if(valueExists)
        {   
            // string defining error msg
            let errmsg = "That " + key + " is taken!"
            // define key for the error. based off the key name. example: if key = "username", errKey = "usernameErr"
            let errKey = key + "Err"; 
            // append error to error list.
            err[errKey] = errmsg;
        } 

        // if value is empty, say its empty.
        if(values[key] === "")
        {
            // string defining error msg
            let errmsg = "Please enter a " + key + "!" 
            // define key for the error. based off the key name. example: if key = "username", errKey = "usernameErr"
            let errKey = key + "Err"; 
            // append error to error list.
            err[errKey] = errmsg;
        }
    }

    // if there are any errors, throw the error back. else, throw success back!
    if(Object.keys(err).length > 0)
    {
        response.status(409).json(err);
    }
    else
    {
        response.json({msg: "no backend register errors!"});
    }
})

// if user exists and password is correct, log in and return json web token.
router.post('/login', async (request, response) => {
    const {username , password} = request.body;
    const user = await Users.findOne({ where: {username: username} })
    if(!user)
    {
        console.log("no such user found..")
        response.status(404).json({ usernameErr: "User Doesn't exist!"})
    }
    else
    {
        bcrypt.compare(password, user.password).then( async (match) => {
            console.log("match: " ,match)
            // if password is correct, return the accessToken and store in cookie.
            if(!match) 
            {
                response.status(401).json({passwordErr: "Wrong username and password combination!"})
            }
            else
            {
                

                const accessToken = createTokens(user.dataValues);
                const expirationDate = 60*60*24*90*1000;
                response.cookie("access-token", accessToken, {maxAge: expirationDate, httpOnly: true }) // storing payload into cookie.
                response.json({username: user.username, id: user.id})
            }
        })
    }
    
})
// check backend to make sure user is authenticated. 
router.get('/validate',validateToken, async (request, response) => { 
    response.json(request.user)

})
//  delete cookie to eliminate priveleages and logout. 
router.get('/logout',validateToken, async (request, response) => { 
    console.log("logout hit.")

    try
    {
        response.clearCookie("access-token");   
        console.log("succesfully deleted cookie.")
        response.json(response.user)

    }
    catch
    {
        console.log("error in logout")
        response.status(404).json({err: "something went wrong."})
    }

})

router.get("/publicProfile/:UserId" , async (request, response) => {
    // get user ID param from request.
    const UserId = request.params.UserId;
    // find corresponding user with the userID.
    const publicProfile = await Users.findByPk(UserId, {
        attributes: {exclude: ["password", "email"]}
    });
    // if it exists, return some basic info. else, throw error.
    if(publicProfile)
    {
        response.json(publicProfile);
    }
    else
    {
        response.status(404).json({err: "you messed something up."})
    }

})

// update password
router.put("/private/changepassword", validateToken, async (request, response) => {
    // get old and new password from body.
    const {oldPassword, newPassword} = request.body;
    
    // get user information using validateToken username.
    console.log("user ID:", request.user)
    const user =await Users.findOne({where: {id: request.user.id}})

    // err container, to be filled as errors pop up.
    let err = {};

    // if value is empty, say its empty.
    if(oldPassword === "")
    {
        // string defining error msg
        let errmsg = "Please enter old password!" 
        // append error to error list.
        err["oldPasswordErr"] = errmsg;
    }
    if(newPassword === "" )
    {
        // string defining error msg
        let errmsg = "Please enter new password!" 
        // append error to error list.
        err["newPasswordErr"] = errmsg;
    }
    

    // compare oldPassword entered with user password on backend.
    bcrypt.compare(oldPassword,user.password ).then( async(match) => {
        // if password incorrect, return errors.
        if(!match)
        {
            err["oldPasswordErr"] = "Password is incorrect!" 
            response.status(409).json(err);
        }
        // if password fields empty, return errors
        else if(Object.keys(err).length > 0)
        {
            response.status(409).json(err);
        }
        // if no failures, update newpassword!
        else
        {
            bcrypt.hash(newPassword, 10).then( async (hash)=> {
                await Users.update({password: hash} , {where: {id: request.user.id}})
            })
            response.json({msg: "no backend change password errors!"});
        }
    })
})

// update email
router.put("/private/changeemail", validateToken, async (request, response) => {
    // get old and new email from body.
    const {oldPassword, newEmail} = request.body;
    
    // get user information using validateToken username.
    console.log("user ID:", request.user)
    const user =await Users.findOne({where: {id: request.user.id}})

    // err container, to be filled as errors pop up.
    let err = {};

    // if value is empty, say its empty.
    if(oldPassword === "")
    {
        // string defining error msg
        let errmsg = "Please enter old password!" 
        // append error to error list.
        err["oldPasswordErr"] = errmsg;
    }
    if(newEmail === "" )
    {
        // string defining error msg
        let errmsg = "Please enter new email!" 
        // append error to error list.
        err["newEmailErr"] = errmsg;
    }
    

    // compare oldPassword entered with user password on backend.
    bcrypt.compare(oldPassword,user.password ).then( async(match) => {
        // if password incorrect, return errors.
        if(!match)
        {
            err["oldPasswordErr"] = "Password is incorrect!" 
            response.status(409).json(err);
        }
        // if fields empty, return errors
        else if(Object.keys(err).length > 0)
        {
            response.status(409).json(err);
        }
        // if no failures, update new email!
        else
        {
            await Users.update({email: newEmail} , {where: {id: request.user.id}})
            response.json({msg: "no backend change email errors!"});
        }
    })
})
// update password
router.get("/private/getEmail", validateToken, async (request, response) => {
    const user =await Users.findOne({where: {id: request.user.id}})
    console.log(user.dataValues.email)
    if(!user)
    {
        console.log("could not find")
        response.json({msg: "could not find user."})
    }
    else
    {
        console.log("found")
        response.json({email: user.dataValues.email});
    }
})

// forgot password:
router.post("/forgotpassword", async (request, response) => {
    console.log("in forgot my password..");
    crypto.randomBytes(32, async (err, buffer)=> {
        if(err){
            console.log(err)
        }
        else{
            // create random user
            const user = await Users.findOne({where: {email : request.body.email}})
            if(!user) 
            {   
                console.log("user doesn't exist..");
                return response.status(404).json({error: "User doesn't exist."})
            }
            else
            {
                const token = buffer.toString("hex")
                const expireToken = Date.now() + 3600000;
                await Users.update({resetToken: token, expireToken: expireToken}, {where: {email:  request.body.email}})
                const redirectLink =  process.env.DOMAIN   + `reset/${token}` ;
                console.log("redirect to:",redirectLink)
                const emailToSend= {
                    from: '"Space Launches" <spacelaunches@outlook.com>',
                    to: `${request.body.email}`,
                    subject: "SPACE LAUNCHES -- PASSWORD RESET LINK",
                    text: `
                    <p>hey, it seems you forgot your password. don't worry, check out this link: </p>
                    <h5> click on this link to reset your password:
                    <a href=${redirectLink}> ${redirectLink} </a> 
                    ` ,
                    html: `
                    <p>hey, it seems you forgot your password. the following link will only be active for 1 hour to reset your password. </p>
                    <h5> click on this link to reset your password:
                    <a href=${redirectLink}> ${redirectLink} </a> 
                    ` 
                    // Let's verify your single sender so you can start sending email.
                    // < email here> 
                    // Your link is active for 48 hours. After that, you will need to resend the verification email.


                }
                sendEmailSafe(emailToSend, "forgot-password")
                response.json("success!");
            }
        }
    })
})
// reset password:
router.post("/resetpassword", async (request, response) => {

    response.json("success!")

    // get token (from params) and newpassword from front end.
    const newPassword = request.body.password;
    const token= request.body.token;

    // find the user that correspodns to the resetToken, as long as expire Token is greater than. 
    // if not found ,return error. if found,  allow a password update, and expire the link.
    const user = await Users.findOne({where: {resetToken: token, expireToken: {[Op.gt]: Date.now()} }});
    if(!user)
    {   
        response.status(404).json("token has expired")
    }
    else
    {
        bcrypt.hash(newPassword, 10).then( async (hash) =>
        {
            await Users.update({password: hash}, {where: {resetToken: token}});
            await Users.update({expireToken: null} , {where: {resetToken: token}})
            response.json("success!")
        })
    }
})
router.get("/resetpassword/", async (request, response) => {
    const token = await request.query[0];
    const user = await Users.findOne({where: {resetToken: token, expireToken: {[Op.gt]: Date.now()} }});
    if(!user)
    {
        response.status(404).json("token has expired")
    }
    else
    {
        response.json("link is valid.");
    }
})

// forgot username:
router.post("/forgotusername", async (request, response) => {
    console.log("in forgot my username..");
    crypto.randomBytes(32, async (err, buffer)=> {
        if(err){
            console.log(err)
        }
        else{
            // get the user
            const user = await Users.findOne({where: {email : request.body.email}})
            /// if user doesn't exist, return error. otherwise, send out the email.
            if(!user) 
            {   
                console.log("user doesn't exist..");
                return response.status(404).json({error: "User doesn't exist."})
            }
            else
            {
                const username = user.username;
                const emailToSend= {
                    from: '"Space Launches" <spacelaunches@outlook.com>',
                    to: `${request.body.email}`,
                    subject: "SPACE LAUNCHES -- USERNAME INFO",
                    text: `
                    Hey, it seems you forgot your username. :
                    Don't worry, according to our records your username is:
                    ${username}
                    ` ,
                    html: `
                    <p>Hey, it seems you forgot your username. : </p>
                    <h5> Don't worry, according to our records your username is:
                    <h2> ${username} </h2>
                    ` 
                }
                sendEmailSafe(emailToSend, "forgot-username")
                response.json("success!");
            }
        }
    })
})

// if user exists and password is correct, log in and return json web token.
router.post('/googleoauth', async (request, response) => {
    const {googleToken} = request.body;
    console.log("google: ", googleToken)
    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.REACT_APP_GOOGLE_OATH_CLIENT_ID
    });
    const { name, email, picture } = ticket.getPayload();  
    console.log(name, email);
    console.log(picture);

    //check if user is signed up. 
    const user = await Users.findOne({ where: {email: email} })

    // if account exists, login. else, create user. 
    if(user)
    {
        const accessToken = createTokens(user.dataValues);
        const expirationDate = 60*60*24*90*1000;
        response.cookie("access-token", accessToken, {maxAge: expirationDate, httpOnly: true }) // storing payload into cookie.
        response.json({username: user.username, id: user.id})
    }
    else 
    {
        // loop until i find a random username that is valid.
        let newUsername;
        for(let i=0; i<500; i++)
        {
            newUsername = haiku(500)
            userExists=  await Users.findOne({ where: {username: newUsername} })
            if(!userExists)
            {
                break
            }
        }
        // create a random password that is very strong. 
        crypto.randomBytes(200, async (err, buffer)=> {
            if(err){
                console.log(err)
            }
            else{
                //succesfully create random password here:
                const randomPassword = buffer.toString("hex")
                // hash the password, then register user and sign in.
                bcrypt.hash(randomPassword, 10).then( async (hash) =>
                {
                    // create user in database.
                    let newUser = {
                        username: newUsername,
                        password: hash,
                        email: email
                    };
                    newUser = await Users.create(newUser);
                    //signin.
                    console.log("new user:", newUser)
                    const accessToken = createTokens(newUser.dataValues);
                    const expirationDate = 60*60*24*90*1000;
                    response.cookie("access-token", accessToken, {maxAge: expirationDate, httpOnly: true }) // storing payload into cookie.
                    response.json({username: newUser.username, id: newUser.id})
                })
            }   

        })
       
    }
})

module.exports = router;
