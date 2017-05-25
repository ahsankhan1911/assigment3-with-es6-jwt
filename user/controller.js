const mongoose = require( 'mongoose');
const User = mongoose.model('Users');
const Post = mongoose.model('Posts');
const jwt = require('jsonwebtoken');
const Boom = require('boom');
const nodemailer = require('nodemailer');
const uuid = require('node-uuid');

let myToken;
let transporter = nodemailer.createTransport({
             service: 'Yahoo',
                auth: {
                    user: 'nodeapi12@yahoo.com',
                    pass: 'hello12345678'
                    }
               });

exports.createUser =(req, res, next) =>{

    let new_User = new User(req.body);
    let code = uuid.v1();

//     new_User.save( (err, user) => {
   
//       if(!err) {        
//            let mailOptions = {
//             from: '"Node API" ,<noreply@nodeapi.com>', // sender address
//             to: user.email, // list of receivers
//             subject: 'Account Confirmation', // Subject line
//             html: '<p>Click on this link this to confirm your account</p><a href="#">http://localhost:5000/users/confirmation/'+ code + '</a>'
//            };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                  next(Boom.badRequest(error.message));
//             }

//             else  {
//                User.findOneAndUpdate({email: user.email}, {$set:{confirmationCode: code}}, (err, updateInfo) => 
//                { 
//                    if(err) {
//                        console.log(err)
//                    }
//                   console.log(updateInfo);
//                });
//                res.send("Thanks for signup. Please check your email to confirm you account " + user.firstname);
//             }   

//            });          
//       }


//     else{
//             next(Boom.unauthorized(err.toString()));
//     }


// });

 new_User.save()
 
        .then( (user) => {
 
           User.findOneAndUpdate({email: user.email}, {$set:{confirmationCode: code}})
          
        .then( (updateInfo) => {
               
                   if(!updateInfo) {
                       console.log("Update failed")
                   }
                       console.log(updateInfo);   

               let mailOptions = {
                   from: '"Node API" ,<noreply@nodeapi.com>', // sender address
                   to: user.email, // list of receivers
                   subject: 'Account Confirmation', // Subject line
                   html: '<p>Click on this link this to confirm your account</p><a href="#">http://localhost:5000/users/confirmation/'+ code + '</a>'          
                   };

            transporter.sendMail(mailOptions)
            
        .then( (info) => {

            if (!info) {
                 next(Boom.badRequest("Unable to send Email"));
            }
              res.send("Thanks for signup. Please check your email to confirm your account ");
               });
              
            })

      .catch((err) => {

              next(Boom.unauthorized(err.toString()));
            })

            })


     .catch((err) => {

     next(Boom.unauthorized(err.toString()));
           });

};


  


exports.confirmUser = (req, res, next) => {

    let confirmURL = req.params.URL;
 
         User.findOneAndUpdate({confirmationCode: confirmURL},{isActive: true})
         
         .then( (user) => {

              res.send("Your Account has been confirmed successfully")  })

         .catch((err) => {
          
          next(Boom.badRequest("No user found for this URL"));
         });
}


exports.logInUser = (req, res, next) =>  {
    User.findOne({email: req.body.email, password: req.body.password})
    
      .then( (user) => {
              if(user.isActive == false) {

                  next(Boom.unauthorized('Please confirm your account to log In'));
              }

            myToken = jwt.sign({
                    id: user._id,
                    email: req.body.email}, 
                    "secret",
                    {expiresIn: 10 * 60});

            res.send(myToken);
            
      exports.myToken = myToken;
    })

      .catch((err) =>    {

            next(Boom.unauthorized("Invalid Email or Password"));
            console.log(err); 
        
    });
 
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

exports.sendEmail = (req, res) =>{ 

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ahsankhan1911@gmail.com',
        pass: 'khanbahadur2333'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
    to: req.body.email, // list of receivers
    subject: 'Hello ✔', // Subject line
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        res.send(error.message);
    }
     res.send("Email has been sent to " + info.response);
});

}