const user = require("../models/users")
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart=require('../models/cart');
const Users = require("../models/users");


const tohome = async (req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home');
    }else{
        const data= await productUpload.find()
        res.render("./user/index",{title:"Login",err:false, data});
    }
}

const tosignup = (req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home')
    }else{
    res.render("user/signup",{title:"Signup",err:req.flash("err")})
    }
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

const toforgetPage= (req,res)=>{
    if (req.session.logged) {
        res.redirect('/user/home');
    } else {
        req.session.forgot = true
        res.render("./user/forgot-pass", { err: req.flash("errmsg") })
    }
}

const userSignup = async (req,res) => {
    console.log("user sign up");
    console.log(req.body+"hi");
    try {
        const check = await user.find({ email: req.body.email })
        console.log(typeof (check));
        if (check.length == 0) {
            const pass = await bcrypt.hash(req.body.password, 10);
            const data = {
                userName: req.body.name,
                email: req.body.email,
                password: pass,
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
        const check=await user.findOne({email:req.body.email})
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
            req.session.email=email.toString();
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
      const check = await user.findOne({ email: req.body.email });
  
      if (check) {
        const isMatch = await bcrypt.compare(req.body.password, check.password);
  
        if (isMatch) {
          if (check.status == true) {
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
                req.session.email=email
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
        console.log(err);
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
                console.log("hashed......"+hashed);
                console.log("body"+req.body)
                const { code, email} = req.body
                console.log("code otp ....."+code);
                req.session.email=data.email;
                console.log(req.session.email)
                if(hashed==code){
                    const result=await user.insertMany([data])
                    req.session.logged=true;
                    console.log(result);
                    req.session.signotp=false
                    // const user= await user.findOne()
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
            res.redirect("./user/otpPage")
        }
    }
}
 const toForgotPass=(req,res)=>{
    req.session.forgot=true
    res.render("./user/forget-pass")
}
const get_password_reset = (req, res) => {
    if (req.session.pass_reset) {
        res.render("userView/resetPass",{title:"Reset password"});

    } else {
        res.redirect("/user/login-page")
    }
}

const passwordReset = async (req, res) => {
    try {
        console.log(req.body);
        const pass = await bcrypt.hash(req.body.password, 10);
        const email = req.session.email
        console.log(email);
        const update = await user.updateOne({ email: email }, { $set: { password: pass } })
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
        res.render("user/user-home",{title:"Home", data,user})
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
    try{
    let data= await productUpload.find()
    res.render('user/product-list',{title:"Products", data})
    }catch{
        console.error(error);
        res.status(500).send("Internet Server Error")
    }
}



const addAddress=async (req,res)=>{
    try{
        let email=req.session.email
        let newaddress={
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
            res.redirect('/user/profile')
    }catch(error){
        console.log("can't add Address");

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
    addAddress
}