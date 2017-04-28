/**
 * Created by ahsan on 4/22/2017.
 */

const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const jwt = require('jsonwebtoken');

// var boom = require('express-boom');
const Boom = require('boom');

let myToken;

exports.createUser =(req, res, next) =>{

    let new_User = new User(req.body);

    //console.log(req.body.email);

    new_User.save((err, user) =>{

        if (err) {
            //err.toString().replace('ValidationError: ', '').split(',')
             next(Boom.unauthorized(err));

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


exports.userProfile =  (req, res) => {

      res.send(req.user);

          };



exports.showUsers =  (req, res) => {


      User.find({}, function (err, user){

             res.send(user)
              });

};



exports.deleteUser = (req, res, next) => {
    User.remove({email: req.body.email}, (err, user) => {

        if (!user){
        next(Boom.badRequest("No user found to deleted"))
    }

        else {
        res.send({message: 'Task successfully deleted'})
        }
});

};


exports.updateUser = (req, res) => {

let updateThis = req.body;

if(req.body.email){

     res.send("You cannot change your email")
}
     else{

    User.update({email: req.params.email},updateThis,(err, raw) => {

       if(!raw){

       res.send(err);       }


       else {
           res.send(raw);
       }
    })
     }
}

exports.sortUsers = (req, res) => {

//let param = req.params.param;

User.findOne({param: req.params.firstname},function(err,docs){

    res.send(docs);
})
}