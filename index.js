const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const helmet=require('helmet')
require('dotenv').config();
const PORT = 8000;

const app = express();


const config={
    CLIENT_ID:process.env.client_id,
    CLIENT_SECRET:process.env.client_secret
}
app.use(helmet())




function checkLoggedIn(req,res,next){
    const isLoggedIn=true;
    if(!isLoggedIn){
        return res.status(401).json({
            error:"you must login"
        })
    }
    next();
}
//oauth routes
app.get('/auth/google',(req,res)=>{

})


app.get('/auth/google/callback',(req,res)=>{

})

app.get('/auth/logout',(req,res)=>{

})








app.get('/sec', checkLoggedIn, (req, res) => {
    return res.send("Your secret");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
