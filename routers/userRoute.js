const express=require("express");
const session = require("express-session");
const user=express.Router()
const userControl=require("../control/userControl");
const passport=require("passport")
const bcrypt=require("bcrypt")
require("../auth/passport")
require("../config/login-auth")
const USER=require("../models/users")
const {sendOTP}=require("../control/userControl");
const OTP = require("../models/otpModel");
const Users = require("../models/users");


//user login 
user.get('/',(req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home');
    }else{
        res.render("./user/login",{title:"Login",err:false});
    }
})
user.post("/user/log",userControl.userLogin);
//signup to login
user.get("/user/tologin",(req,res)=>{
    res.render('./user/login',{title : 'hello'});
})
user.get('/logout',(req,res)=>{
  res.redirect("/")
})
//logi to sign up
user.get("/user/tosignup",(req,res)=>{
    res.render("user/signup",{title:"Signup",err:false})
})
//signup
user.post("/user/signup",userControl.userSignup)

//otp
user.get("/user/otp-senting",userControl.otpSender)

//otp page
user.get("/user/otp",(req,res)=>{
    res.render("./user/otpPage",{title: "OTP ", err:false });
})
// user.post("/user/forgot/otp",userControl.forgotPassOTPConfirmation)
user.post("/user/otp",userControl.OtpConfirmation)

//forgot password
user.get("/user/forget-pass",(req,res)=>{
    req.session.forgot=true
    res.render("./user/forget-pass")
})
user.post("/user/forget-pass",userControl.forgotPass)


//user logged home page
user.get("/user/home",userControl.userlog)
 
//user logout
user.get("/user/logout",userControl.logout)


//get wish list
user.get("/user/wishlist",(req,res)=>{
  res.render("./user/user-wishlist")
})























































// google authentication

// user.get("/user/google",passport.authenticate("google-signup",{scope:["profile","email"]}));

// user.get("/auth/google/callback",(req, res, next) => {
//     passport.authenticate("google-signup", async(err, user, info) => {
//         try{
//             console.log("here at call back");
//             console.log("user data :",user);
//             console.log("some information is comming to call back:",info);
    
//           if (err) {
//             // Handle error
//             console.error("Error during Google authentication:", err);
//             return res.redirect("/failedmail"); // Redirect to an error page
//           }
      
//           if (!user) {
//             // Handle authentication failure
//             console.error("Authentication failed:", info.message);
//             return res.redirect("/user/home"); // Redirect to a failure page
//           }
//           console.log(user);
//           let userInformation = {
//             userName: user.displayName,
//             email: user.emails[0].value,
//             profile: user.photos[0].value,
//             joined: Date.now(),
//           };
//           console.log(userInformation);
    
//           const insert=await Users.insertMany([userInformation])
    
//           if(insert){
//             console.log("inserted");
//             // Manually set a session variable with user data
//           req.session.email = user.emails[0].value;
      
//           // Redirect to the desired page (e.g., /setSession)
//           req.session.logged=true
//            res.redirect("/user/home");
//           }
//         }catch(err){
//             console.log(err);
//         }
//     }) (req, res, next);// Invoke the Passport middleware
//   });



//   //

//   user.get(
//     "/auth/login",
//     passport.authenticate("google-login", { scope: ["email", "profile"] })
//   );
//   user.get(
//     "/login/google/callback",(req, res, next) =>{
//         passport.authenticate("google-login", async(err, user, info) => {
//             try{
//                 console.log("here at call back");
//                 console.log("user data :",user);
//                 // console.log("some information is comming to call back:",info);
        
//               if (err) {
//                 // Handle error
//                 console.error("Error during Google authentication:", err);
//                 return res.redirect("/failedmail"); // Redirect to an error page
//               }
          
//               if (!user) {
//                 // Handle authentication failure
//                 // console.error("Authentication failed:", info.message);
//                 return res.redirect("/user/signUp"); // Redirect to a failure page
//               }
//               console.log(user);
        
//               if(user){
//               req.session.email = user.emails[0].value;
//               // Redirect to the desired page (e.g., /setSession)
//               req.session.logged=true
//                res.redirect("/user/home");
//               }
//             }catch(err){
//                 console.log(err);
//             }
//         }) (req, res, next);// Invoke the Passport middleware
//       });
module.exports=user;