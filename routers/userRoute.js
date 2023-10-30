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
const model=require('../models/model')
const userAuth=require('../middlewares/UserAuth')
const userBlock=require('../middlewares/userblock')
const cartController=require('../control/cartController')
const orderController=require('../control/order')



// login
user.get('/user/indexToLogin',userAuth.userExist,userControl.IndexToLogin)
user.post("/user/log",userAuth.userExist,userControl.userLogin);
user.get('/',userAuth.userExist,userControl.tohome)  

//signup 
user.get("/user/tologin",userAuth.userExist,userControl.signupToLog)
// user.get('/logout',userAuth.userExist,userControl.logout)
user.get("/user/logout",userControl.logout)
user.get("/user/tosignup",userAuth.userExist,userControl.tosignup)
user.post("/user/signup",userAuth.userExist,userControl.userSignup)

//otp
user.get("/user/otp-senting",userAuth.userExist,userControl.otpSender)
user.get("/user/otp",userAuth.userExist,userControl.toOtp)
user.post("/user/otp",userAuth.userExist,userControl.OtpConfirmation)
user.get("/user/resend-otp",userAuth.userExist,userControl.resendOTP);

//forgot password
user.get("/user/forget-pass",userAuth.userExist,userControl.toForgotPass)
user.post("/user/forget-pass",userAuth.userExist,userControl.forgotPass)
user.post('/user/pass-change',userAuth.userExist,userControl.passwordReset)

//user logged home page
user.get("/user/home",userAuth.verifyUser,userBlock,userControl.userlog)
//to product view
user.get('/user/toProductView/:id',userAuth.verifyUser,userControl.productView)
//to product list
user.get('/user/toProduct-list',userAuth.verifyUser,userControl.toProductList)
// to cart
user.get("/user/toCart",userAuth.verifyUser,cartController.toCart)
//to profile
user.get("/user/profile",async(req,res)=>{

    const userData=await Users.findOne({email:req.session.email})
    console.log(userData);
    // const adress=userData.address;
    res.render('user/profile',{title:"profile",userData})
})
//add Address
user.post('/user/addAddress',userAuth.verifyUser,userControl.addAddress)
user.get('/user/toManageAddress',userAuth.verifyUser,userControl.toManageAddress)
user.post('/user/deleteAddress/:id',userControl.deleteAddress)
user.post('/user/editAddress/:id',userControl.editAddress)

//item add to cart
user.post('/user/addToCart',userAuth.verifyUser,cartController.addToCart)
user.post('/user/removeFromCart/:id',userAuth.verifyUser,cartController.removeCart)
user.post('/updatequantity',userAuth.verifyUser,cartController.updateQuantity)
user.get('/user/toCheckout',userAuth.verifyUser,orderController.toCheckout)

//order

user.post('/user/placeOrder',orderController.placeOrder)








































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