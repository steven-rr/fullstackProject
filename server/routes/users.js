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
const fetch = require("node-fetch");
const client = new OAuth2Client(process.env.CLIENT_ID)

const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetApiSecret = process.env.MAILJET_API_SECRET;
if (!mailjetApiKey || !mailjetApiSecret) {
    console.warn("MAILJET_API_KEY / MAILJET_API_SECRET are not set; outbound emails are disabled.");
}

const sendEmailSafe = async (emailToSend, context) => {
    if (!mailjetApiKey || !mailjetApiSecret) {
        return { ok: false, reason: "MAILJET credentials are not set" };
    }

    const fromEmail = process.env.MAILJET_FROM_EMAIL || process.env.EMAIL_USERNAME;
    const fromName = process.env.MAILJET_FROM_NAME || "Space Launches";
    if (!fromEmail) {
        return { ok: false, reason: "MAILJET_FROM_EMAIL (or EMAIL_USERNAME) is not set" };
    }

    const auth = Buffer.from(`${mailjetApiKey}:${mailjetApiSecret}`).toString("base64");
    const payload = {
        Messages: [
            {
                From: { Email: fromEmail, Name: fromName },
                To: [{ Email: emailToSend.to }],
                Subject: emailToSend.subject,
                TextPart: emailToSend.text || "",
                HTMLPart: emailToSend.html || ""
            }
        ]
    };

    try {
        const sendRes = await fetch("https://api.mailjet.com/v3.1/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify(payload)
        });

        if (!sendRes.ok) {
            const details = await sendRes.text();
            console.error(`[Mailjet ${context}] failed (${sendRes.status})`, details);
            return { ok: false, status: sendRes.status, details };
        }

        return { ok: true };
    } catch (error) {
        const status = error?.code || "unknown";
        const details = error?.message || error;
        console.error(`[Mailjet ${context}] failed (${status})`, details);
        return { ok: false, status, details };
    }
};

// register a user. only occurs after client-side and server-side validation.
router.post('/register', async (request, response) => {
    // parse out info from frontend.
    const {username , password, email} = request.body;
    // hash the password, then register user.
    try {
        const usernameExists = await Users.findOne({ where: { username } });
        if (usernameExists) {
            return response.status(409).json({ usernameErr: "That username is taken!" });
        }
        const emailExists = await Users.findOne({ where: { email } });
        if (emailExists) {
            return response.status(409).json({ emailErr: "That email is taken!" });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = {
            username: username,
            password: hash,
            email: email
        };
        const createdUser = await Users.create(newUser);
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
        const emailResult = await sendEmailSafe(emailToSend, "welcome-email");
        response.status(201).json({
            id: createdUser.id,
            username: createdUser.username,
            email: createdUser.email,
            welcomeEmailSent: emailResult.ok === true
        });
    } catch (error) {
        console.error("register failed:", error);
        response.status(500).json({error: "unable to register user"});
    }
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
        response.json({msg: "logout successful"})

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
    if(!user)
    {
        return response.status(404).json({error: "user not found"});
    }

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
    if(!user)
    {
        return response.status(404).json({error: "user not found"});
    }

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
    if(!user)
    {
        console.log("could not find")
        return response.status(404).json({msg: "could not find user."})
    }
    else
    {
        console.log(user.dataValues.email)
        console.log("found")
        return response.json({email: user.dataValues.email});
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
                const baseDomain = (process.env.DOMAIN || "").trim().replace(/\/+$/, "");
                const redirectLink =  `${baseDomain}/reset/${token}` ;
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
                const emailResult = await sendEmailSafe(emailToSend, "forgot-password")
                if(!emailResult.ok)
                {
                    return response.status(502).json({error: "Unable to send reset email at this time."});
                }
                response.json("success!");
            }
        }
    })
})
// reset password:
router.post("/resetpassword", async (request, response) => {
    // get token and new password from front end.
    const newPassword = request.body.password;
    const token = request.body.token;
    if(!token || !newPassword)
    {
        return response.status(400).json({error: "token and password are required"});
    }
    // find the user that corresponds to the resetToken, as long as expireToken is greater than now.
    const user = await Users.findOne({where: {resetToken: token, expireToken: {[Op.gt]: Date.now()} }});
    if(!user)
    {   
        return response.status(404).json("token has expired")
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await Users.update({password: hash, expireToken: null, resetToken: null}, {where: {id: user.id}});
    return response.json("success!")
})
router.get("/resetpassword/", async (request, response) => {
    const token = request.query.token || request.query[0];
    if(!token)
    {
        return response.status(400).json("token is required");
    }
    const user = await Users.findOne({where: {resetToken: token, expireToken: {[Op.gt]: Date.now()} }});
    if(!user)
    {
        return response.status(404).json("token has expired")
    }
    else
    {
        return response.json("link is valid.");
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
                const emailResult = await sendEmailSafe(emailToSend, "forgot-username")
                if(!emailResult.ok)
                {
                    return response.status(502).json({error: "Unable to send username email at this time."});
                }
                response.json("success!");
            }
        }
    })
})

// if user exists and password is correct, log in and return json web token.
router.post('/googleoauth', async (request, response) => {
    try {
        const {googleToken} = request.body;
        if(!googleToken)
        {
            return response.status(400).json({error: "googleToken is required"});
        }

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
            return response.json({username: user.username, id: user.id})
        }

        // loop until i find a random username that is valid.
        let newUsername;
        let userExists;
        for(let i=0; i<500; i++)
        {
            newUsername = haiku(500)
            userExists = await Users.findOne({ where: {username: newUsername} })
            if(!userExists)
            {
                break
            }
        }

        // create a random password that is very strong.
        const randomPassword = crypto.randomBytes(200).toString("hex")
        const hash = await bcrypt.hash(randomPassword, 10)
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
        return response.json({username: newUser.username, id: newUser.id})
    } catch (error) {
        console.error("google oauth failed:", error?.message || error);
        return response.status(401).json({error: "google authentication failed"});
    }
})

module.exports = router;
