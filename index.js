const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const Users = require( './user/Model');
const tempUser = require('./user/tempModel');
const nev = require('email-verification')(mongoose);
mongoose.Promise = require('bluebird');



app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/users', require('./user'));

mongoose.connect('mongodb://localhost/userdb2', (err) => {
    if(err){
        console.log(err);
    }
    else {
        console.log("MongoDB is now Connected")
    }
});

nev.configure({
    
    verificationURL: 'http://localhost:5000/confirmed/${URL}',

    persistentUserModel: Users,
    tempUserModel: tempUser,
   tempUserCollection: 'tempUsers',
     emailFieldName: 'email',
    passwordFieldName: 'password',
    URLFieldName: 'GENERATED_VERIFYING_URL',
    expirationTime: 600,

    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'ahsankhan1911@gmail.com',
            pass: 'khanbahadur2333'
        }
    },});


app.listen(port, () => {
    console.log(`Running server on ${port}`);
});


app.use(  (err, req, res, next) => {


    res.status(err.output.payload.statusCode).send(err.message);


});