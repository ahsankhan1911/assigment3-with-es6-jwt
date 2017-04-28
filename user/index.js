/**
 * Created by ahsan on 4/22/2017.
 */

const express = require('express');
const router = express.Router();
const user  = require('./controller');
//const expressJWT = require('express-jwt');
 const middleware = require('../Middlewares/Authentications');

//router.use(expressJWT({secret: 'secret'}).unless({path: ['/users/login-user', '/users/create-user']}));

router.post('/create-user' , user.createUser);

router.post('/login-user', user.logInUser);


router.get('/show-users', middleware.authenticate, user.showUsers);

router.post('/delete-user', middleware.authenticate,user.deleteUser);


router.get('/user-profile', middleware.authenticate,user.userProfile);

router.put('/update-user/:email', user.updateUser);

router.get('/list/:param', user.sortUsers)

module.exports = router;

