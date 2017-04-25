/**
 * Created by ahsan on 4/22/2017.
 */

const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const jwt = require('jsonwebtoken');
const auth = require('../Middlewares/Authentications');


// var boom = require('express-boom');
const Boom = require('boom');

let myToken;
let test;

exports.createUser =(req, res) =>{

    let new_User = new User(req.body);

    new_User.save((err, user) =>{
        if(!user){
            res.send(err);
        }

        else {

            res.send("Thanks for signup " + user.firstname);
        }
    });



};

exports.logInUser = (req, res, next) =>  {
    User.findOne({email: req.body.email, password: req.body.password}, (err, user) => {

        if (!user) {


        next(Boom.unauthorized("Invalid Email or Password"));
    }

       else {

          myToken = jwt.sign({
                id: user._id,
                email: req.body.email
            }, "secret",
            {expiresIn: 20* 60000}
        );

            res.send(myToken);

            exports.myToken = myToken;

    }

});


};


exports.userProfile =  (req, res, next) => {

let decode = jwt.decode(myToken);

    User.findOne({email: decode.email }, (err, user) => {

                    res.send(user);
                })




};



exports.showUsers =  (req, res, next) => {


User.find({}, function (err, user){

   res.send(user)
    });

};



exports.deleteUser = (req, res, next) => {
    User.remove({}, (err, user) => {

        if (!user){
        next(err)
    }

        else {
        res.send({message: 'Task successfully deleted'})
        }
});

};


