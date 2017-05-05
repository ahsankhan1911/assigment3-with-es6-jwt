
const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const Post = mongoose.model('Posts');
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
             next(Boom.unauthorized(err.toString()));

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


     let users = req.user;


      
      User.findOne({_id: req.user._id}).populate('posts followers', '-followers -posts -_id -__v -password').exec((err, user) => {
          if(!user){
              next(Boom.notFound(err.toString()));
          }

          else{
          res.send(user);
          //console.log(user.postedBy);
        }
      });


}

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

exports.updateUser = (req, res, next) => {

      let updateThis = req.body;

     if(req.body.email) {

     next(Boom.forbidden("You cannot change your email"));

         }

     else {

    User.update({email: req.params.email},updateThis,(err, raw) => {

       if(!raw){

       next(Boom.notFound(err.toString()));      
        
       }

       else {
           res.send(raw);
    
       }
    })
     }
}

exports.sortUsers = (req, res, next) => {

       let fieldInSchema = req.params.param;
        //  console.log(saad);

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
        res.send(post); 
        authUser.posts.push(post);

        authUser.save((err, poster) => {

            console.log(poster);
        });
        
    }
 });


};

exports.deletePost = (req, res, next) => {

    let paramID  = req.params.postId

     Post.findOne({_id: req.params.postId}, (err, post) => {

      return post.remove((err) => {

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
      });
    
     });
   
};

exports.followUser = (req, res, next) => {

   User.findOne({_id: req.params.userId}, (err, usertoFollow) => {

    let logedUser = req.user;
    usertoFollow.followers.push(logedUser._id);
    usertoFollow.save((err, done) => {

    if(err) {
        next(Boom.notFound("Not a valid ID"));
    }

    else{
        res.send("You followed " + usertoFollow.firstname);
    }
    });
   });

}

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