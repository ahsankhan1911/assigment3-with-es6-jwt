/**
 * Created by ahsan on 4/24/2017.
 */
//const passport =  require('passport');
const Boom = require('boom');
const jwt = require('jsonwebtoken');

const controller = require('../user/controller');





exports.authenticate = (req, res, next) =>  {

    let auth =  req.header('Authorization');
    let  token = controller.myToken;


      if(auth != null) {


          if (JSON.stringify(auth) === JSON.stringify(token)) {

                next();

              }

       else {

           next(Boom.unauthorized("Invalid Token"));
       }
   }


   else {

       next(Boom.unauthorized('You are not authorized to access this page'));
   }
};



exports.authenticateJWT = (req, res, next) => {


   let decode =  jwt.verify(controller.myToken, 'secret', (err, decoded) => {

    if (!decoded){


        next(err.message);

    }
    else {

        next();

    }

});
};