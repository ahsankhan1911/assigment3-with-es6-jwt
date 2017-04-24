/**
 * Created by ahsan on 4/22/2017.
 */

const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const jwt = require('jsonwebtoken');

// var boom = require('express-boom');
// var boom2 = require('boom');

let myToken;
let test;

exports.createUser = function(req, res) {
    let new_User = new User(req.body);
    new_User.save(function (err, user) {
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

        const err2 = new Error();

        res.statusCode = 406;
        err2.message = "Invalid Email or Password";

        next(err2);
    }

       else {

          myToken = jwt.sign({
                id: user._id,
                email: req.body.email
            }, "secret",
            {expiresIn: 20* 60000}
        );

            res.send(myToken);
    //test= "hello"
            exports.myToken2 = myToken;

    }

});


};


exports.userProfile =  (req, res, next) => {

    let decode = jwt.verify(myToken, 'secret', (err, decoded) => {

               if(!decoded){

                next(err);
               }

       else {
                User.findOne({email: decoded.email}, (err, user) => {

                    res.send(user);
                })


            }
             });

};



exports.showUsers =  (req, res, next) => {

    const decode = jwt.verify(myToken, 'secret', (err, decoded) => {

            if (!decoded){


        next(err.message);

    }
           else {
        User.find({}, (err, user) => {

            res.send(user);
        });
           }
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


