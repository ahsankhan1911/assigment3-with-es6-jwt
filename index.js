/**
 * Created by ahsan on 4/22/2017.
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const User =  require ('./user/Model');
//const Boom  = require('boom');

mongoose.connect('mongodb://localhost/userdb2', err => {
    if(err){
        console.log(err);
    }
    else {
        console.log("MongoDB is now Connected")
    }
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies




app.use('/users', require('./user'));

app.listen(port, () => {
    console.log(`Running server on ${port}`);
});


app.use((err, req, res, next) => {

    res.send(err.message);


});