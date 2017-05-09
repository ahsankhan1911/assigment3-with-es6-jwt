
const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const Post = mongoose.model('Posts');
const jwt = require('jsonwebtoken');

// var boom = require('express-boom');
const Boom = require('boom');

let myToken;


exports.createUser =(req, res, next) =>{

    let new_User = new User(req.body);

    new_User.save()
    .then((user) =>{
        if(user) {
            res.send("Thanks for signup " + user.firstname);
        }
    })
    .catch((err) => {

        if(err) {
            next(Boom.unauthorized(err.toString()));
        }
    });
};


exports.logInUser = (req, res, next) =>  {
    User.findOne({email: req.body.email, password: req.body.password}).then( (user) => {
             if(user) {
                 myToken = jwt.sign({
                id: user._id,
                email: req.body.email
            }, "secret",
            {expiresIn: 10 * 60});

            res.send(myToken);
            exports.myToken = myToken;

             }
    }).catch((err) => {
        if(err){
            next(Boom.unauthorized("Invalid Email or Password"));
            console.log(err);
        }
    });
 
};


exports.userProfile =  (req, res, next) => {

     let users = req.user;

  User.findOne({_id: req.user._id}).populate('posts followers', '-followers -posts -_id -__v -password').exec()
      .then((user) => {
          if(user) {
               res.send(user);
          }
      }).catch((err) => {
          if(err) {
              next(Boom.notFound(err.toString()));
          }
      })


};

exports.showUsers =  (req, res, next) => {


      User.find({}).then((user) => {
          if(user) {
              res.send(user);
          }
      }).catch((err) => {
          next(Boom.notFound(err.toString()));
      });

};

exports.deleteUser = (req, res, next) => {
    User.remove({email: req.body.email}).then((err) =>{
         if(!err) {
           return res.send('User deleted successfuly');
        }

        else{
            next(Boom.notFound("No user to found to deleted"));
        }
    }
    )

};

exports.updateUser = (req, res, next) => {

      let updateThis = req.body;

     if(req.body.email) {

     next(Boom.forbidden("You cannot change email"));

         }

     else {

    User.update({email: req.params.email},updateThis).then((updated) => {

       if(!updated){
   
       }
       else {
           res.send(err);
       }
    });

     }
}

exports.sortUsers = (req, res, next) => {

       let fieldInSchema = req.params.param;

       User.find({}).sort(fieldInSchema).exec((err, docs) => {
 
           if(!docs){

         next(Boom.badImplementation(err.toString()));
         }   

        else {
         res.send(docs);
          }

            });
};

exports.createPost = (req, res, next) => {    

    let New_Post = new Post({

        userPost: req.body.userPost,
        postedBy: req.user._id
    });

       New_Post.save((err, post) => {

         let authUser = req.user;

    if (err) {
        next(err.toString());

    }

    else {
        //res.send(post); 
        authUser.posts.push(post);

        authUser.save((err, poster) => {
             if(err) {
                 next(Boom.badRequest("Some problem while saving post"));
             }
             else {
            res.send(post);
             }
        });
        
    }
 });


};

exports.deletePost = (req, res, next) => {

     Post.findOneAndRemove({_id: req.params.postId}, (err, post) => {
            if(!err) {   

              User.update({_id: post.postedBy}, {$pull: {posts: post._id}}, (err) => {
                       if(err) {
                     
                        next(Boom.notFound(err.toString()));
                        }
                       else {
                            res.send("Post Deleted Successfully");
                          }      
            });
                 
                }
        
            else  {  
                next(Boom.forbidden("Its not a valid user ID"));            
            }
      });
    
};

exports.followUser = (req, res, next) => {

   let logedUser = req.user;

    if(req.params.userId == logedUser._id)  {
        next(Boom.badImplementation("You cant follow yourself"));
    }

    else {

   User.findOneAndUpdate({_id: req.params.userId},{$addToSet: {followers: logedUser._id}}, (err, usertoFollow) => {

       if(err) {
        next(Boom.notFound("Not a valid ID"));
      }

      else{
        res.send("You followed " + usertoFollow.firstname);
      }
   
     });

    }
};

exports.unfollowUser = (req, res, next) => {

User.findOneAndUpdate({_id: req.params.userId},{$pull: {followers: req.user._id}}, (err, done) => {

     if(err) {
         next(Boom.notAcceptable("Not a valid user ID"));
           }

     else {
           res.send("You unfollowed " + done.firstname);
       }

      })

};