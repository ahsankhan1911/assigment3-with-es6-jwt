const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const Users = require( './user/Model');
const uuid = require('node-uuid');

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



app.listen(port, () => {
    console.log(`Running server on ${port}`);
});


app.use(  (err, req, res, next) => {


    res.status(err.output.payload.statusCode).send(err.message);



});

console.log(uuid.v1());