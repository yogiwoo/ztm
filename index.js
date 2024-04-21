const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const helmet=require('helmet')
const passport=require('passport');
const {Strategy}=require('passport-google-oauth20')
const cookieSession=require('cookie-session')
require('dotenv').config();
const PORT = 8000;

const app = express();


const config={
    CLIENT_ID:process.env.client_id,
    CLIENT_SECRET:process.env.client_secret,
    COOKIE_KEY_1:process.env.cookie_key_1,
    COOKIE_KEY_2:process.env.cookie_key_2
}

const auth_opt=
    {
        callbackURL:'/auth/google/callback',
        clientID:config.CLIENT_ID,
        clientSecret:config.CLIENT_SECRET
    }


    const verifyCallback=(accessToke,refereshToken,profile,done)=>{
        console.log("google profile",profile)
        done(null,profile);

    }
passport.use(new Strategy(auth_opt,verifyCallback))
//save the session to the cookie
passport.serializeUser((user,done)=>{
    done(null,user.id)
})
//read the session from the cookie
passport.deserializeUser((id,done)=>{
    done(null,id)
})
app.use(helmet())
app.use(cookieSession({
    name:'session',
    maxAge:24*60*60*1000,
    keys:[config.COOKIE_KEY_1,config.COOKIE_KEY_2]
}))
app.use(passport.initialize())

app.use(passport.session())

function checkLoggedIn(req,res,next){
    console.log("current user",req.user)
    const isLoggedIn=req.isAuthenticated() && req.user
    if(!isLoggedIn){
        return res.status(401).json({
            error:"you must login"
        })
    }
    next();
}

app.get('/auth/google',
    passport.authenticate('google',{
        scope:['email'],

    })
)

app.get('/auth/google/callback',
 passport.authenticate('google',{
    failureRedirect:'/failure',
    successRedirect:'/',
    session:true
}),(req,res)=>{
    console.log("google called us back")
})

app.get('/auth/logout',(req,res)=>{
    req.logout();
    return res.redirect('/')
})








app.get('/sec', checkLoggedIn, (req, res) => {
    return res.send("Your secret");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/failure',(req,res)=>{
    res.send("failed to login")
})
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(options, app);

server.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
