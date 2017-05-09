/**
 * Created by ahsan on 4/22/2017.
 */

const express = require('express');
const router = express.Router();
const user  = require('./controller');
//const expressJWT = require('express-jwt');
 const middleware = require('../Middlewares/Authentications');

//router.use(expressJWT({secret: 'secret'}).unless({path: ['/users/login-user', '/users/create-user']}));

router.post('/create' , user.createUser);

router.post('/login', user.logInUser);

router.get('/show', middleware.authenticate, user.showUsers);

router.post('/delete', middleware.authenticate,user.deleteUser);

router.get('/profile', middleware.authenticate,user.userProfile);

router.put('/update/:email', user.updateUser);

router.get('/list/:param', user.sortUsers);

router.post('/create-post', middleware.authenticate , user.createPost);

router.delete('/delete-post/:postId', middleware.authenticate, user.deletePost);

router.put('/follow/:userId', middleware.authenticate, user.followUser);

router.put('/unfollow/:userId', middleware.authenticate, user.unfollowUser);

module.exports = router;

