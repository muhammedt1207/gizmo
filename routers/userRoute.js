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
const filterController=require('../control/filter')
const passwordController=require('../control/forgetPassWord')
const imgUpload=require('../middlewares/profile-multer')
const paymentControll=require('../control/payment')
const cartAuth =require('../middlewares/checkCart')
const wishlistController=require('../control/wishlistController')
const checkProduct=require('../middlewares/product-QuantityChecking')

// login
user.get('/user/indexToLogin',userAuth.userExist,userControl.IndexToLogin)
user.post("/user/log",userAuth.userExist,userControl.userLogin);
user.get('/',userAuth.userExist,userControl.tohome)  

//index
user.get('/user/guestProductView/:id',userAuth.userExist,userControl.GuestRpoductView)
user.get('/user/guestShop',userAuth.userExist,userControl.GuestShop)
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
user.get("/user/profile",userAuth.verifyUser,async(req,res)=>{

    const userData=await Users.findOne({email:req.session.email})
    console.log(userData);
    // const adress=userData.address;
    res.render('user/profile',{title:"profile",userData ,user:userData})
})
//add Address------------------------------------------------------------------------
user.post('/user/addAddress',userAuth.verifyUser,userControl.addAddress)
user.get('/user/toManageAddress',userAuth.verifyUser,userControl.toManageAddress)
user.post('/user/deleteAddress/:id',userControl.deleteAddress)
user.post('/user/editAddress/:id',userControl.editAddress)
user.post('/user/uploadProfileImage',imgUpload.single('profileImage'),userControl.userProfile)
user.post('/user/NewAddAddress',userAuth.verifyUser,userControl.NewAddAddress)
user.post('/user/NewEditAddress/:id',userAuth.verifyUser,userControl.newEditAddress)
user.post('/user/change-username',userControl.ChangeUserName)


//item add to cart---------------------------------------------------------------------
user.post('/user/addToCart',userAuth.verifyUser,cartController.addToCart)
user.post('/user/removeFromCart/:id',userAuth.verifyUser,cartController.removeCart)
user.post('/updatequantity',userAuth.verifyUser,cartController.updateQuantity)
user.get('/user/AddToCart/:id',cartController.addlistToCart)

//---------------------------------------------------------------------------------
user.get('/user/toAccountSettings',userAuth.verifyUser,userControl.toAccountSettings)
user.post('/user/change-password',userAuth.verifyUser, passwordController.changePass);

//------------------------------------------------------------------------------
user.get('/filter-products',filterController.filter)
user.get('/all-products',filterController.allproduct)




//order----------------------------------------------------------------
user.get('/user/toCheckout',cartAuth,checkProduct,userAuth.verifyUser,orderController.toCheckout)
user.post('/user/placeOrder',userAuth.verifyUser,orderController.placeOrder)
user.get('/user/toOrderPage',userAuth.verifyUser,orderController.toOrderPage)
user.get('/user/toorderDetials/:id',userAuth.verifyUser,orderController.orderDetails)
user.post('/cancel-order/:id',userAuth.verifyUser,orderController.cancellOrder)
user.post('/Onecancel-order',userAuth.verifyUser, orderController.oneItemcancel)
user.post('/return-order',userAuth.verifyUser,orderController.returnOrder)

user.get('/ordersuccess',userAuth.verifyUser,(req,res)=>{
    res.render('user/orderSuccess')
})


//invoice-------------------------------------------------------
user.post('/downloadinvoice',userAuth.verifyUser,orderController.generateInvoices)
user.get('/downloadinvoice/:orderId',userAuth.verifyUser,orderController.downloadInvoice)
//---------------------------------------------------------------------------------------------
user.post('/verify-payment',orderController.verifyPayment)
user.post('/apply-coupon',orderController.useCoupon)
//---------------------------------------------------------------------------------
user.get('/user/coupon',userControl.toCoupons)
user.get("/user/Wallet",userControl.ToWalletHistory)
user.post('/user/search',userControl.productSearch)
//------------------------------------------------------------------------------------
user.get('/user/wishlist',wishlistController.towishList)
user.post('/user/addToWishlist',wishlistController.addToWishlist)



































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