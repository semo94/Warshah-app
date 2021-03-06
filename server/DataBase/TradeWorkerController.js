var TradeWorker = require ('./TradeWorkerModel');
var jwt = require('jwt-simple');
var utils = require('../config/utils.js');
var nodemailer = require('nodemailer');
module.exports = {
  signup: function (req, res) {
    TradeWorker.findOne({workeremail : req.body.email})
    .exec(function (error, user) {
      if(user){
        res.status(500).send({error:'TradeWorker is already exist!'});
      }else{
        var newTradeWorker = new TradeWorker ({
          username : req.body.username,
          password : req.body.password,
          workeremail:req.body.email,
          place : req.body.place,
          service : req.body.service,
          phone : req.body.phone,
          active :true,
          experiance : req.body.experiance
        });
        newTradeWorker.save(function(err, newTradeWorker){
          if(err){
            res.status(500).send(err);
          }else{
            var token = jwt.encode(newTradeWorker, 'secret');
            res.setHeader('x-access-token',token);
            res.status(200).json({token: token, userId : newTradeWorker._id});
          };
        });
      }
    })
  },

  signin: function (req, res) {
    TradeWorker.findOne({workeremail: req.body.email})
    .exec(function (err,user) {
      if(err){
        res.status(500).json({error: err.message});
      }else{
        if(!user){
          res.status(500).send({message: 'this account does not found!'})
        } else {

          if(user.password === req.body.password) {
            var token = jwt.encode(user, 'secret');
            res.setHeader('x-access-token',token);
            res.json({token: token, userId : user._id});
          }else{
            res.status(500).send({message: 'password is not correct!'});
          }   
        }
      }
      
    })
  },


  getAllTradeWorker : function (req, res) {
    TradeWorker.find({active:true}).exec(function (err, allTradWorker) {
      if(err){
        res.status(500).send('err');
      }else{
        res.status(200).send(allTradWorker);
      }
    });
  },
  getProfile : function (req, res) {
    TradeWorker.findById(req.user._id,function(err,worker){
     if(err){
      res.status(500).send('err');
    }else{
      res.status(200).send(worker);
    }  
  });
  },
  updateProfile:function(req,res){
    TradeWorker.findById(req.user._id,function (error, worker) {
      if(error){
        res.status(500).send({error:error.massage});
      }else{
        TradeWorker.update(worker,req.body,function(err,newworker){
         if(err){
          res.status(500).send({error: err});
        }else{
          res.status(200).send({message: 'your profile has been updated successfully!'});
        }
      })
      }
    })
  },
  addmsg:function(req,res){
    TradeWorker.findOne({workeremail : req.body.workeremail})
    .exec(function (error, user) {
     if(!user){
      res.status(500).send('some thing went wrong');
    }else{
      user.masseges.push({user:req.body.user , place:req.body.place ,userEmail:req.body.userEmail, phon:req.body.phon , msg:req.body.msg});
      user.save(function(err,user){
        if(err){
          res.status(500).send('some thing went wrong')
        }else{
          res.status(200).send('massege has been sent successfully')
        }
      })
    }

  });
  },
  getmsg:function(req,res){
    TradeWorker.findById(req.user._id,function(err,worker){
     if(err){
       res.status(500).send('sorry, you haven\'t any new messages');
     }else{
       res.json(worker.masseges)
     }
   })         
  },
  delmsg:function(req,res){
    TradeWorker.findById(req.user._id,function(err,worker){
     if(err){
       res.status(500).send('err');
     }else{
      for(var i=0;i<worker.masseges.length;i++){
       if(worker.masseges[i].userEmail===req.body.userEmail){
        worker.masseges.splice(i,1)
      }
    }
    worker.save(function(err,worker){
      if(err){
        res.status(500).send('some thing went wrong')
      }else{
        res.status(200).send('massege has been deleted successfully')
      }
    })
  }  
});
  },
  sendemail: function(req,res){
    // the request should look like this 
    //{ "email":"example@gmail.com",
        //"name":"ahmed",
        //"msg":"hello world "
        //}
        var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
           user: 'warsha.services@gmail.com', 
           pass: 'AAwarshaAA1' 
         }
       });
        var mailOptions = {
         from: 'warsha.services@gmail.com',
         to:req.body.email , 
         subject: 'From '+ req.body.name , 
         text: req.body.msg

       };

       transporter.sendMail(mailOptions, function(error, info){
        if(error){
         res.json({Message: 'opss, some thing went wrong please try later'});
       }else{
         res.json({Message: 'your e-mail has been sent successfully'});
       };
     });
     },

     deactive:function(req,res){
      TradeWorker.findById(req.user._id,function(err,worker){
        if(err){
          res.status(500).send('err xxxx');
        }else{
          worker.update(worker,{active:false},function(err,newworker){
            if(err){
              res.status(500).send('err');  
            }else{
              res.json(newworker);
            }
          })
        }
      })

    }

    


  }

