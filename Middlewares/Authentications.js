const mongoose = require( 'mongoose');
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const User = mongoose.model('Users');



exports.authenticate = (req, res, next) =>  {

    let auth = req.header('Authorization');

    if(auth == null){

        next(Boom.unauthorized('You are not authorized to access this page'));
    }

    else {

        jwt.verify(auth, 'secret', (err, decoded) => {

            if(!decoded){

                next(Boom.forbidden('Invalid Token'));
            }
             else {
                     User.findOne({email: decoded.email}, (err, user) => {

                       if (!user) {

                            next(Boom.notFound("No user found"))
                       }
                       else {
                           req.user = user;
                           next();
                       }
                      });
            }
        });

    }

};
