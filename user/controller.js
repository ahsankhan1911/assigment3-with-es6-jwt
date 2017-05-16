
const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const tempUser = mongoose.model('tempUsers');
const Post = mongoose.model('Posts');
const jwt = require('jsonwebtoken');
const nev = require('email-verification')(mongoose);
// var boom = require('express-boom');
const Boom = require('boom');

let myToken;


exports.createUser =(req, res, next) =>{

    let new_User = new tempUser(req.body);

    // new_User.save()
    // .then((user) =>{
        
    //         res.send("Thanks for signup " + user.firstname);
        
    // })
    // .catch((err) => {
    //         next(Boom.unauthorized(err.toString()));
    
    // });
   
    nev.createTempUser(new_User, (err, existingTempUser, newTempUser) => {
        if(err) {
            next(Boom.badRequest(err.toString()));
        }

        if(existingTempUser) {
            next(Boom.badRequest("User already exist"));
        }

        if(newTempUser) {
            var URL =   newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(email, URL, (err , info) => {
                if(err) {
                    next(Boom.unauthorized("Cannot send confirmation at this time"));

                    res.send("An Email has been sent to your Email Address");
                }
            });
        }

        else {
            next(Boom.unauthorized("You have already signed up. Please check your email to verify your account"))
        }
    });
    
};

exports.confirmUser = (req, res, next) => {

    var url = req.params.URL;

nev.confirmTempUser(url, function(err, user) {
    if (err)
        next(Boom.unauthorized(err.toString()));

    // user was found!
    if (user) {
        // optional
        nev.sendConfirmationEmail(user['email_field_name'], function(err, info) {
            res.send("Your account is Successfull confirmed" + info.firstname);
        });
    }

    // user's data probably expired...
    else {
        next(Boom.unauthorized("Error Comfirming your account"))
    }
      
});
}
exports.logInUser = (req, res, next) =>  {
    User.findOne({email: req.body.email, password: req.body.password})
    
      .then( (user) => {
             
            myToken = jwt.sign({
                    id: user._id,
                    email: req.body.email}, 
                    "secret",
                    {expiresIn: 10 * 60});

            res.send(myToken);
            
      exports.myToken = myToken;})

      .catch((err) =>    {

            next(Boom.unauthorized("Invalid Email or Password"));
            console.log(err); });
 
};


exports.userProfile =  (req, res, next) => {

     let users = req.user;

  User.findOne({_id: req.user._id}).populate('posts followers', '-followers -posts -_id -__v -password').exec()
      .then((user) => {
          
               res.send(user);
        
      }).catch((err) => {
          
              next(Boom.notFound(err.toString()));
        
      })


};

exports.showUsers =  (req, res, next) => {

      User.find({})
      
        .then((user) => {
        
              res.send(user);})

        .catch((err) => {
          next(Boom.notFound(err.toString()));});

};

exports.deleteUser = (req, res, next) => {

    User.findOneAndRemove({email: req.body.email})
    
    .then((user) => {
          if(!user) {
        res.send("Invalid Email");
          }
        else {
            res.send(user.firstname +" removed from database")
        }
    });

};

exports.updateUser = (req, res, next) => {

      let updateThis = req.body;

     if(req.body.email) {

     next(Boom.forbidden("You cannot change email")); }

     else {

    User.findOneAndUpdate({email: req.params.email}, updateThis)
    
    .then((user) => {

     res.send(user);})

    .catch((err) => {

     next(Boom.forbidden("No user found")); })
     }
}

exports.sortUsers = (req, res, next) => {

       let fieldInSchema = req.params.param;

       User.find({}).sort(fieldInSchema).exec().then((users) => {

          res.send(users); })
        
       .catch((err) => {
             
              next(Boom.badImplementation("Not a valid field name"));

            });
};

exports.createPost = (req, res, next) => {    

    let New_Post = new Post({
        userPost: req.body.userPost,
        postedBy: req.user._id
    });

   let authUser = req.user
       New_Post.save()

         .then((userPost) => {    

           res.send(userPost);
           return authUser.posts.push(userPost._id);})  

         .then((post) => {

             return authUser.save();
         })
         .catch((err) => {
 
             next(Boom.unauthorized(err.toString()));})
};

exports.deletePost = (req, res, next) => {

     Post.findOneAndRemove({_id: req.params.postId})
     
     .then((post) => {

         User.update({_id: post.postedBy}, {$pull: {posts: post._id}});

          res.send("Post Deleted")})
     .catch((err) => {
           
          next(Boom.badImplementation("Invalid UserID"));
     })
    
};

exports.followUser = (req, res, next) => {

   let logedUser = req.user;

    if(req.params.userId == logedUser._id)  {
        next(Boom.badImplementation("You cant follow yourself"));
    }

    else {

   User.findOneAndUpdate({_id: req.params.userId},{$addToSet: {followers: logedUser._id}})

   .then((followedUser) => {
        //console.log(usertoFollow);
       res.send("You followed " + followedUser.firstname);
   })   
   .catch((err) => {

        next(Boom.notFound("Invalid UserID"));
   })

   }
    };


exports.unfollowUser = (req, res, next) => {
 
 let logedUser = req.user;

  if(req.params.userId == logedUser._id)  {
        next(Boom.badImplementation("You cant unfollow yourself"));
    }

  else {

 User.findOneAndUpdate({_id: req.params.userId},{$pull: {followers: logedUser._id}})

   .then((unfollowedUser) => {
        
       res.send("You unfollowed " + unfollowedUser.firstname);
   })   
   .catch((err) => {

        next(Boom.notFound("Invalid UserID"));
   })
}

};