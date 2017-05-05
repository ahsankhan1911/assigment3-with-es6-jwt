
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


exports.userProfile =  (req, res) => {


     let users = req.user;

//res.send(users);
      
      User.findOne({_id: req.user._id}).populate('posts followers', '-followers -posts -_id -__v -password').exec((err, user) => {
          if(!user){
              res.send(err)
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
           console.log(raw.password);
       }
    })
     }
}

exports.sortUsers = (req, res) => {

       let fieldInSchema = req.params.param;
        //  console.log(saad);

       User.find({}).sort(fieldInSchema).exec((err, docs) => {
 
           if(!docs){

         res.send(err);
      }   

        else {
    res.send(docs);
          }

            });


};

exports.createPost = (req, res) => {    

    let New_Post = new Post({

        userPost: req.body.userPost,
        postedBy: req.user._id
    });

       New_Post.save((err, post) => {

         let authUser = req.user;

    if (err) {
        res.send(err);

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

exports.deletePost = (req, res) => {

    let paramID  = req.params.postId

     Post.findOne({_id: req.params.postId}, (err, post) => {

      return post.remove((err) => {
        if(!err) {
             
             
            User.update({_id: post.postedBy}, {$pull: {posts: post._id}}, (err) => {
                 if(err) {
                     
                     res.send(err)
                 }
                  else {
                 res.send("Post Deleted");
                  }
            })

       }
      });
    
     });
   
};

exports.followUser = (req, res) => {

   User.findOne({_id: req.params.userId}, (err, usertoFollow) => {

    let logedUser = req.user;
    usertoFollow.followers.push(logedUser._id);
    usertoFollow.save((err, done) => {

    if(err) {
        res.send(err);
    }

    else{
        res.send("You followed " + usertoFollow.firstname);
    }
    });
   });

}

exports.unfollowUser = (req, res) => {

User.findOne({_id: req.params.userId}, (err, usertoUnfollow) => {


})

};