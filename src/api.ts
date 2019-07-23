import express, { Application, Response, Request, NextFunction } from "express";
import multer from "multer";
import bcryptjs from "bcryptjs";
import async from "async";
import fs from "fs";
import webToken from "jsonwebtoken";
import userModel from "../model";
const User = require('../model/userSchema'),
    config = require('./config'),
    key = config.secretkey,
    usernames = {};


function createToken(user){
  const token =  webToken.sign({
      name:user.lastname+" "+user.firstname,
      img:user.profileImg,
       id:user._id
   },key,{expiresIn:1209600});
    return token;
}

function clean(value: any,res: Response,req: Request){
    if(typeof value!=='string'){
        value='';
        return;
    }
    value = req.sanitize(value);
    return value;
}

module.exports = (app: Application,express,sanitizer)=>{
   const api = express.Router();
       //user login
       api.post('/login',(req: Request,res: Response)=>{
        const email=clean(req.body.email,res,req),
        password=clean(req.body.password,res,req);
    
        User.findOne({email:email}).
        populate({ path: 'country'})
        . populate({ path: 'state'})
        .populate({ path: 'city'})
        .populate({ path: 'contacts.user',select:'fname sname email state city country_id'})
        .populate({ path: 'vendor.user',select:'fname sname email state city country_id'})
        .exec(function(err,user){
            if(err){ 
               res.json({message:err});
            }
            //create token
            if(!user){
                res.status(404).send({ message:'Invalid Username/Password'});
            }else{
                if(bycrpt.compareSync(password,user.pass)){
                   
                    const token = createToken(user);
                                            
                    userObj = {
                        _id:user._id,
                        sname:user.sname,
                        fname :user.fname,
                        country:user.country,
                        history:user.history,
                        usertype:user.usertype,
                        phone:user.phone,
                        state:user.state,
                        city:user.city,
                        website:user.website,
                        refers:user.refers,
                        img:user.profileImg,
                        regdate:user.Regdate,
                        status:user.status,
                   };
                    res.json({
                        success:true,
                        message:'successfully logged In',
                        token:token,
                        user:userObj
                    });
     
                    //update login status to true
                    User.findOneAndUpdate({email:email}, { $set:{ status:true}},function(err,user){
                            if(err){
                                return res.json({success:false,message:"couldn't Update users status. Please try again"});
                            }
                    });
                }else{

                    res.json({
                        message:'Invalid Username/Password,Please try again',
                        success:false
                    });
                }
            }
        });

    });

    //signup a user
    api.post('/user/register',(req: Request,res: Response)=>{
        const fname=clean(req.body.fname,res,req),
            sname=clean(req.body.sname,res,req),
            state=clean(req.body.state,res,req),
            phone=clean(req.body.phone,res,req),
            email=clean(req.body.email,res,req),
            city = clean(req.body.city,res,req),
            country=clean(req.body.country,res,req),
            usertype=clean(req.body.usertype,res,req),
            pass=clean(req.body.password,res,req);

        //saving the record
        if(fname!="" && sname!="" && phone!="" && state!="" && email!="" && country!="" && usertype!="" && pass!="" && city!=""){
            const hash = bycrpt.hashSync(pass,bycrpt.genSaltSync(10));

                const user = new User({
                        fname:fname,
                        sname:sname,
                        email:email,
                        country:country,
                        state:state,
                        city:city,
                        phone:phone,
                        usertype:usertype,
                        pass:hash
                });
                user.save(function(err){
                    if(err){
                        return res.json({success:false,message:err.code});
                        // return res.json({success:false,message:"The Email already exist please try again"});
                    }else{
                        return res.json({success:true,message:"your account has been successfully created"});
                    }
                });

        }else{
            return res.json({success:false,message:"All fields required"});
        }
    });

   
    //middlewre to confirm login
    api.use((req: Request,res: Response,next: NextFunction)=>{
        const token = req.body.token || req.params.token || req.headers['x-access-token'];
       if(token){
         //verify the token
           webToken.verify(token,key,function(err,decoded){
               if(err){
                   return res.status(403).send({success:false,message:"invalid token"});
               }

               req.decoded = decoded;
               next();

           });
       }else{
            res.status(403).send({success:false,message:"unAuthorised request attempt"});
            return;
       }
    });


    api.get('/me',(req: Request,res: Response)=>{
       return res.json(req.decoded);
    });

}