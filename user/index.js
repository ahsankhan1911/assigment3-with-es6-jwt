/**
 * Created by ahsan on 4/22/2017.
 */

const express = require('express');
const router = express.Router();
const user  = require('./controller');
const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const expressJWT = require('express-jwt');
 const middlware = require('../Middlewares/Authentications');

//router.use(expressJWT({secret: 'secret'}).unless({path: ['/users/login-user', '/users/create-user']}));

router.post('/create-user' , user.createUser);

router.post('/login-user', user.logInUser);


router.get('/show-users', middlware.authenticate,user.showUsers);

router.post('/delete-user', user.deleteUser);


router.get('/user-profile', user.userProfile);

module.exports = router;

