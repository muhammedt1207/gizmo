require('dotenv').config();
const user = require("../models/users")
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart=require('../models/cart');
const Users = require("../models/users");
const Banner=require("../models/banner")
const Coupon=require("../models/coupon") 
const jwt=require('jsonwebtoken')

const tohome = async (req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home');
    }else{
        const user=await Users.findOne({email:req.session.email})
        const data= await productUpload.find()
        const banner=await Banner.findOne({}, {}, { sort: { date: -1 } })
        res.render("./user/index",{title:"Login",err:false, data,banner,user});
    }
}


const productSearch=async (req, res) => {
    const searchTerm = req.query.q;
  
    try {
      const count = await productUpload.find({ ProductName: { $regex: new RegExp(searchTerm, 'i') } }).count();
      var i=0
      const page = parseInt(req.query.page) || 1;
      const pageSize = 1;
      const totaldata = Math.ceil(count / pageSize);
      const skip = (page - 1) * pageSize;
      const data = await productUpload.find({ ProductName: { $regex: new RegExp(searchTerm, 'i') } }).skip(skip).limit(pageSize)
      const user =await Users.findOne({email:req.session.email})
      console.log("...............",data);
      res.render('user/product-list', { title: 'Costomers', userData: data ,
      Count:totaldata,
      page: page,
      user,
      i})
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

const tosignup = (req,res)=>{
    const reffer = req.query.ref;
    console.log('Your referral code:', reffer);
    res.render("user/signup",{title:"Signup",err:req.flash("err") ,reffer})
    
}
const signupToLog=(req,res)=>{
    res.render('./user/login',{title : 'hello' , err: false});
}
const IndexToLogin=(req,res)=>{
    res.render('user/login',{title : 'hello' , err: false});
  } 
const toOtp=(req,res)=>{
    if(req.session.signotp || req.session.forgot){
        res.render("./user/otpPage",{title: "OTP ", err:false });
    }else{
        res.redirect('/user/logout')
    }
}

const userSignup = async (req,res) => {
    console.log("user sign up");
    console.log(req.body+"hi");
    console.log('Referral Code from Frontend:', req.body.referralId);

    try {
        const check = await Users.find({ email: req.body.email })
        console.log(typeof (check));
        if (check.length == 0) {
            const pass = await bcrypt.hash(req.body.password, 10);
            const data = {
                userName: req.body.name,
                email: req.body.email,
                password: pass,
                reffer:req.body.referralId
            }
            req.session.data = data;
            req.session.email = data.email
            req.session.signotp=true;
            res.redirect("/user/otp-senting");
        } else {
            req.flash("err","*User with this email Already exist")
            req.session.err = "user already exist"
            res.render('./user/signup',{ title:"signup" ,err:"User with this email already exist"})
            console.log("user already exist");
        }
    } catch (e) {
        console.log(e);
        console.log("signup error");
        req.flash("err","Sorry!!Something went wrong please try again after some times!!")
        req.session.err = "something went wrong"
        res.render('/user/signup',{err: "Sorry.. Something went wrong please try again after some times"})
        console.log("user already exist");
    }
}


const otpSender = async(req,res)=>{
    if(req.session.signotp || req.session.forgot){
        try{
            console.log(req.session.email);
            console.log("otp route");
            const email=req.session.email;
            console.log(email);
            const createdOTP=await sendOTP(email)
            req.session.email=email;
            console.log("session before verifiying otp :",req.session.email);
            res.status(200).redirect("/user/otp")
        }catch(err){
            console.log(err);
            req.session.err="Sorry at this momment we can't sent otp";
            console.log(req.session.errmsg);

            if(req.session.forgot){
                res.redirect("/user/forget-pass")
            }
            res.redirect("/user/signup");

        }
    }
}

const resendOTP = async (req, res) => {
    if (req.session.signotp || req.session.forgot) {
      try {
        const email = req.session.email;
        const createdOTP = await sendOTP(email);
        req.session.email = email;
        res.status(200).json({ success: true })
      } catch (err) {
        console.log(err);
        req.session.err = "Sorry, at this moment we can't send OTP";
        res.status(500).json({ success: false });
      }
    } else {
      res.status(400).json({ success: false});
    }
}
const forgotPass = async (req, res) => {
    try{
        console.log(req.body);
        const check=await Users.findOne({email:req.body.email})
        req.session.email=check.email
        
        if(check){
            console.log("good to go:",check);
            const userdata={
                email:check.email,
                userName:check.userName,
                _id:check._id,
            }
            const email=req.body.email
            console.log("Email::: ",email);
            req.session.userdata=userdata;
            req.session.email=email
            console.log("Sessiosiiii: ",req.session.email)
           res.redirect("/user/otp-senting") 
        }
        else{
            console.log(check);
            req.session.err="no email found"
            res.redirect("/user/forget-pass");
        }
    }catch(err){
        console.log(err);
        req.session.err="no email found"
        res.redirect("/user/forget-pass")
    }

}


const userLogin = async (req, res) => {
    try {
      const check = await Users.findOne({ email: req.body.email });
  
      if (check) {
        const isMatch = await bcrypt.compare(req.body.password, check.password);
  
        if (isMatch) {
          if (check.status == true) {
            const accessToken = jwt.sign(
                { user: check._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 60 * 60 }
              );
              res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 });
                console.log("jwt token created");
            req.session.user = check.userName;
            req.session.logged = true;
            req.session.email = req.body.email;
            return res.json({ success: true });
          } else {
            return res.json({ success: false, error: "User is blocked" });
          }
        } else {
          return res.json({ error: "Invalid password" });
        }
      } else {
        return res.json({ success: false, error: "User not found" });
      }
    } catch (error) {
        console.error(error,"login error")
      return res.json({ success: false, error: "Invalid username or password" });
    }
  };
  

// otp verification
const OtpConfirmation = async (req,res) => {
    if(req.session.forgot){
        console.log(req.body);
    try{
        const email=req.session.email
        console.log("forgot confirmation :",email);
        const Otp= await OTP.findOne({email:email})

        if(Date.now()>Otp.expireAt){
            await OTP.deleteOne({});

        }else{
            const hashed=Otp.otp
            
            console.log("hashed......"+hashed);
            console.log("body"+req.body)
            const { code, email} = req.body
            console.log("code otp ....."+code);
            // console.log('match'+match);
            if(hashed==code){
              
                req.session.forgot=false;
                // req.seesion.pass_reset=true;
               
                res.render("user/new-password",{title:"Password Reset"});
            }
            else{
                console.log("no match");
                req.session.userdata="";
                req.session.err="Invalid OTP"
                console.log("error 3");
                res.render("user/otpPage",{err:"Invalid OTP"})
            }
        }
    }catch(err){
        console.log(err)
        
        req.session.errmsg="Email not found";
    }
    }
    else if(req.session.signotp){
        console.log(req.body)
        try{
            const data =req.session.data;
            console.log(req.session.data);
            const Otp= await OTP.findOne({email:data.email})
            console.log(Otp.expireAt);
            if(Date.now()>Otp.expiredAt){
                await OTP.deleteOne({email});
            }else{
                const hashed=Otp.otp
                const { code, email} = req.body              
                req.session.email=data.email;
                console.log(req.session.email)
                if(hashed==code){
                    const result=await user.insertMany([data])
                    console.log(data.reffer,'^^^^^^^^^^^^^^');
                    const updatedUserData = await user.findByIdAndUpdate(
                        data.reffer,
                        {
                          $inc: { 'wallet.amount': 100 },
                          $push: {
                            'wallet.transactions': {
                              amount: 100,
                              transactionType: 'credit',
                              timestamp: new Date(),
                              description: 'Refer by user',
                            },
                          },
                        },
                        { new: true } 
                      );
                    req.session.logged=true;
                    if (result) {
                        const accessToken = jwt.sign(
                          { user: result._id },
                          process.env.ACCESS_TOKEN_SECRET,
                          { expiresIn: 60 * 60 }
                        );
                        res.cookie("userJwt", accessToken, { maxAge: 60 * 1000 * 60 });
                        }
                    req.session.signotp=false

                    res.redirect("/user/home")
    
                }
                else{
                    req.session.err="Invalid OTP"
                    console.log("erro 1");
                    res.render("./user/otpPage",{err:"invalid OTP"})
                }
            }
            
            
        }catch(err){
            console.log(err);
            console.log("error 2"+err);
            res.render("./user/otpPage",{title: "OTP ", err:false });
        }
    }
}

 const toForgotPass=(req,res)=>{
    req.session.forgot=true
    res.render("./user/forget-pass")
}


const passwordReset = async (req, res) => {
    try {
        console.log("this is forget pass reset");
        console.log(req.body);
        console.log("session........",req.session.email);
        const pass = await bcrypt.hash(req.body.password, 10);
        const email = req.session.email
        console.log(email);
        const update = await Users.updateOne({ email: email }, { $set: { password: pass } })
        req.session.logged = true;
        // req.session.pass_reset = false
        res.redirect("/user/indexToLogin")
    } catch (err) {
        req.flash("errmsg", "something went wrong")
        console.log(err);
    }
}

const logout = (req,res) => {
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
            res.send('Error');
        }else{
            res.redirect('/');
        }
    });
}
const userlog= async (req,res)=>{
    if(req.session.logged||req.user){
        const user=req.session.user
        console.log(user);
        console.log(req.session.logged);
        const data= await productUpload.find()
        const banner=await Banner.findOne({}, {}, { sort: { date: -1 } })
        console.log(banner,"banner images>>>>>>>>>>>");
        res.render("user/user-home",{title:"Home", data,user,banner})
    }
    else{
        console.log("login");
        res.redirect("/")
    }
}

const productView=async(req,res)=>{
    console.log("dxfgg");
    const id = req.params.id;
    const data= await  productUpload.findOne({_id:id})
    console.log("to product view");
    res.render("user/product-view",{data})
  }


const toProductList=async (req,res)=>{
    try{var i=0
        const page = parseInt(req.query.page) || 1;
        const count = await productUpload.find().count()
        const pageSize = 1;
        const totaldata = Math.ceil(count / pageSize);
        const skip = (page - 1) * pageSize;
        const data = await productUpload.find().skip(skip).limit(pageSize)
        const user =await Users.findOne({email:req.session.email})
        res.render('user/product-list', { title: 'Costomers', userData: data ,
        Count:totaldata,
        page: page,
        user,
        i})
    }catch{
        console.error(error);
        res.status(500).send("Internet Server Error")
    }
}



const addAddress=async (req,res)=>{
    try{
        let email=req.session.email
        let newaddress={
            name:req.body.name,
            addressLine:req.body.address,
            city:req.body.city,
            pincode:req.body.pincode,
            state:req.body.state,
            mobileNumber:req.body.number
        }
        console.log(newaddress);
        const user=await Users.findOne({email:email})
        user.address.push(newaddress)
        await  user.save()
            res.redirect('/user/toManageAddress')
    }catch(error){
        console.log("can't add Address");

    }
}

const NewAddAddress=async (req,res)=>{
    try{
        let email=req.session.email
        let newaddress={
            name:req.body.name,
            addressLine:req.body.address,
            city:req.body.city,
            pincode:req.body.pincode,
            state:req.body.state,
            mobileNumber:req.body.number
        }
        console.log(newaddress);
        const user=await Users.findOne({email:email})
        user.address.push(newaddress)
        await  user.save()
            res.redirect('/user/toCheckout')
    }catch(error){
        console.log("can't add Address");

    }
}


// Add a route for deleting an address
const deleteAddress = async (req, res) => {
    try {
        console.log("this is delete address");
        const email = req.session.email;
        const addressId = req.params.id;  
        const user = await Users.findOne({ email: email })   
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }   
        const addressIndex = user.address.findIndex(
          (address) => address._id.toString() === addressId
        );  
        if (addressIndex === -1) {
          return res.status(404).json({ message: 'Address not found' });
        }
        user.address.splice(addressIndex, 1);
        await user.save();
    
        res.status(200).json({ message: 'Address deleted successfully' });
      } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Unable to delete address' });
      }
    }
  


const toManageAddress=async (req,res)=>{
    try {
        console.log("to Address Manage");
        const email= req.session.email
        const userData= await Users.findOne({email:email})
        res.render("user/addressManage",{title:"Address  page",userData,user:userData})
    } catch (error) {
        
    }
}

const editAddress=async (req, res) => {
    try {

      const addressId = req.params.id;
      console.log("this user edit address form");

      const updatedAddress = {
        name: req.body.name,
        addressLine: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        state: req.body.state,
        mobileNumber: req.body.number,
      };
  

      const user = await Users.findOneAndUpdate(
        { 'address._id': addressId },
        { $set: { 'address.$': updatedAddress } },
        { new: true }
      );
  
   
      if (user) {
        res.redirect('/user/toManageAddress');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  const newEditAddress = async (req, res) => {
    try {
      const addressId = req.params.id;
        console.log("check point 1");
      const updatedAddress = {
        name: req.body.name,
        addressLine: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        state: req.body.state,
        mobileNumber: req.body.number,
      };
      console.log("check point 2");
      const user = await Users.findOneAndUpdate(
        { 'address._id': addressId },
        { $set: { 'address.$': updatedAddress } },
        { new: true }
      );
        console.log("check point 3");
      if (!user) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
  console.log("console checck 4");
      res.json({ success: true, message: 'Address edited successfully', updatedAddress });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  

  const profilePhoto=  async (req, res) => {
    try {
      const name = req.file.originalname;
      const data = req.file.buffer;
      const contentType = req.file.mimetype;
  
      const image = new Image({ name, data, c});
      await image.save();
  
      res.status(201).json({ message: 'Image uploaded and saved.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
 
  const userProfile= async (req, res) => {
    try{
        console.log("user Profile section");
        if (req.file) {
            const updatedUser = await Users.findOneAndUpdate(
                { email: req.session.email },
                { profilePhoto: req.file.filename },
                { new: true }
            );

            if (updatedUser) {
                console.log("updated");
                res.status(200).json({ message: 'Profile photo updated successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(400).json({ error: 'No file was uploaded' });
        
    }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
}
  
  
const toAccountSettings= (req,res)=>{
    try {
        res.render('user/account-setting',{title:"account Settings"})
    } catch (error) {
        res.render('user/404Page')
    }
}


const toCoupons=async (req,res)=>{
    try {
        const couponData=await Coupon.find()
        const user=await Users.findOne({email:req.session.email})
        res.render('user/coupons',{title:"Coupons",couponData,user})
    } catch (error) {
        
    }
}

const ToWalletHistory=async (req,res)=>{
    try{
        const email=req.session.email
        const userData=await Users.findOne({email:email})
        userData.wallet.transactions.sort((a, b) => b.timestamp - a.timestamp)
        res.render("user/walletHistory",{title:"wallet",userData})
    }catch(error){
        console.error("wallet history error",error);
    }
}

module.exports = {
    userLogin,
    userSignup,
    forgotPass,
    otpSender,
    logout,
    OtpConfirmation,
    userlog,
    tohome,
    tosignup,
    toOtp,
    resendOTP,
    passwordReset,
    productView,
    toForgotPass,
    IndexToLogin,
    signupToLog,
    toProductList,
    addAddress,
    deleteAddress,
    toManageAddress,
    editAddress,
    toAccountSettings,
    userProfile,
    NewAddAddress,
    newEditAddress,
    productSearch,
    toCoupons,
    ToWalletHistory
}