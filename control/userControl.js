const user = require("../models/users")
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');



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
        res.redirect('/user/signup')
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
           res.redirect("/user/otp-senter") 
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
            const check = await user.findOne({ email: req.body.email })
            console.log(check);
            
            if(check){
            console.log(req.body);
            let isMatch = await bcrypt.compare(
                req.body.password,
                check.password
        );
        if (isMatch) {
            if(check.status==true){
            req.session.user = check.userName;
            console.log(req.session.user)
            req.session.logged = true;
            console.log("Login success");
            res.redirect("/user/home");
            }else{
                console.log('user is blocked')
                res.render("./user/login",{title:"user login" ,err:"Access Denide"})
            }
        }
        else {
            req.flash("err","*invalid password")

            req.session.errmsg = "invalid password"
            res.redirect('/')
            console.log("invalid password");
        }}else{
            req.flash("err","*User not found")
            res.redirect('/')
            req.session.errmsg = "User not found"
            console.log("User not found");

        }
    } catch {
        req.flash("err","*invalid user name or password")
        req.session.errmsg = "invalid user name or password"
        res.redirect('/')
        console.log("user not found");
    }
}

// otp verification
const OtpConfirmation = async (req,res) => {
    if(req.session.forgot){
        console.log(req.body);
    try{
        const email=req.session.email
        console.log("forgot confirmation :",email);
        const Otp= await OTP.findOne({email:email})

        if(Date.now()>Otp.expireAt){
            await OTP.deleteOne({data});

        }else{
            const hashed=Otp.otp
            const match=await bcrypt.compare(req.body.code,hashed);
            if(match){
              
                req.session.forgot=false;
                req.seesion.pass_reset=true
                res.redirect("./user/user-home");
            }
            else{
                console.log("no match");
                req.session.userdata="";
                req.session.err="Invalid OTP"
                console.log("error 3");
                res.redirect("/user/otpPage")
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
                const match=await bcrypt.compare(req.body.code,hashed);
                if(match){
                    const result=await user.insertMany([data])
                    req.session.logged=true;
                    req.session.signotp=false
                    const user= await user.findOne()
                    res.redirect("/user/user-home")
    
                }
                else{
                    req.session.err="Invalid OTP"
                    console.log("erro 1");
                    res.redirect("/otpPage")
                }
            }
            
            
        }catch(err){
            console.log(err);
            console.log("error 2"+err);
            res.redirect("./user/otpPage")
        }
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
        res.render("./user/user-home",{title:"Home", data,user})
    }
    else{
        console.log("login");
        res.redirect("/")
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

}