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
const Order=require('../models/orders')
const tohome = async (req,res)=>{
    if(req.session.logged){
        res.redirect('/user/home');
    }else{
        const user=await Users.findOne({email:req.session.email})
        const data= await productUpload.find()
        const banner=await Banner.findOne({}, {}, { sort: { date: -1 } })
        
      const bestSeller = await Order.aggregate([
        {
          $unwind: "$Items",
        },
        {
          $group: {
            _id: "$Items.productId",
            totalCount: { $sum: "$Items.quantity" },
          },
        },
        {
          $sort: {
            totalCount: -1,
          },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "productuploads",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
      ]);
        res.render("./user/index",{title:"Login",err:false, data,banner,user,bestSeller});
    }
}

const productSearch = async (req, res) => {
  const { search } = req.body;

  try {
    // Use a case-insensitive regex for the search
    const regex = new RegExp(search, 'i');

    // Find products that match the search query
    const suggestions = await productUpload.find({ ProductName: { $regex: regex } });
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  

const tosignup = (req,res)=>{
    const reffer = req.query.ref;
    
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
   
    try {
        const check = await Users.find({ email: req.body.email })

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
            const reffer = req.query.ref;
            res.render('./user/signup',{ title:"signup" ,err:"User with this email already exist",reffer})
        
        }
    } catch (e) {
       
        req.flash("err","Sorry!!Something went wrong please try again after some times!!")
        req.session.err = "something went wrong"
        const reffer = req.query.ref;
        res.render('/user/signup',{err: "Sorry.. Something went wrong please try again after some times",reffer})
       
    }
}


const otpSender = async(req,res)=>{
    if(req.session.signotp || req.session.forgot){
        try{
           
            const email=req.session.email;
         
            const createdOTP=await sendOTP(email)
            req.session.email=email;
  
            res.status(200).redirect("/user/otp")
        }catch(err){

            req.session.err="Sorry at this momment we can't sent otp";
    

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
       
        req.session.err = "Sorry, at this moment we can't send OTP";
        res.status(500).json({ success: false });
      }
    } else {
      res.status(400).json({ success: false});
    }
}
const forgotPass = async (req, res) => {
    try{
   
        const check=await Users.findOne({email:req.body.email})
        req.session.email=check.email
        
        if(check){
         
            const userdata={
                email:check.email,
                userName:check.userName,
                _id:check._id,
            }
            const email=req.body.email
    
            req.session.userdata=userdata;
            req.session.email=email
           
         
           res.redirect("/user/otp-senting") 
        }
        else{
          
            req.session.err="no email found"
            res.redirect("/user/forget-pass");
        }
    }catch(err){
   
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

    try{
        const email=req.session.email
        
        const Otp= await OTP.findOne({email:email})

        if(Date.now()>Otp.expireAt){
            await OTP.deleteOne({});

        }else{
            const hashed=Otp.otp
            
           
            const { code, email} = req.body
            
            if(hashed==code){
              
                req.session.forgot=false;
                // req.seesion.pass_reset=true;
               
                res.render("user/new-password",{title:"Password Reset"});
            }
            else{
                
                req.session.userdata="";
                req.session.err="Invalid OTP"
              
                res.render("user/otpPage",{err:"Invalid OTP"})
            }
        }
    }catch(err){
        console.error(err)
        
        req.session.errmsg="Email not found";
    }
    }
    else if(req.session.signotp){

        try{
            const data =req.session.data;
           
            const Otp= await OTP.findOne({email:data.email})
          
            if(Date.now()>Otp.expiredAt){
                await OTP.deleteOne({email});
            }else{
                const hashed=Otp.otp
                const { code, email} = req.body              
                req.session.email=data.email;
           
                if(hashed==code){
                    const result=await user.insertMany([data])
                    
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
                  
                    res.render("./user/otpPage",{err:"invalid OTP"})
                }
            }
            
            
        }catch(err){
           
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

        const pass = await bcrypt.hash(req.body.password, 10);
        const email = req.session.email
       
        const update = await Users.updateOne({ email: email }, { $set: { password: pass } })
        req.session.logged = true;
        // req.session.pass_reset = false
        res.redirect("/user/indexToLogin")
    } catch (err) {
        req.flash("errmsg", "something went wrong")
       
    }
}

const logout = (req,res) => {
    req.session.destroy((err)=>{
        if(err){
            
            res.send('Error');
        }else{
            res.redirect('/');
        }
    });
}
const userlog= async (req,res)=>{
    if(req.session.logged||req.user){
        const user=req.session.user

        const data= await productUpload.find()
        const banner=await Banner.findOne({}, {}, { sort: { date: -1 } })
        const bestSeller = await Order.aggregate([
          {
            $unwind: "$Items",
          },
          {
            $group: {
              _id: "$Items.productId",
              totalCount: { $sum: "$Items.quantity" },
            },
          },
          {
            $sort: {
              totalCount: -1,
            },
          },
          {
            $limit: 4,
          },
          {
            $lookup: {
              from: "productuploads",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
        ]);
        res.render("user/user-home",{title:"Home", data,user,banner,bestSeller})
    }
    else{
        res.redirect("/")
    }
}

const productView=async(req,res)=>{
  try{
    const productId = req.params.id;
    const data= await  productUpload.findOne({_id:productId})
    const user=await Users.findOne({email:req.session.email})
    res.render("user/product-view",{data ,title:"products",user})
  }catch(error){
    console.error("error  happened in product view",error)
    res.render('user/404Page')
  }
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
        res.render('user/product-list', { title: 'shop', userData: data ,
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
       
        const user=await Users.findOne({email:email})
        user.address.push(newaddress)
        await  user.save()
            res.redirect('/user/toManageAddress')
    }catch(error){
      res.render('user/404Page')
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
       
        const user=await Users.findOne({email:email})
        user.address.push(newaddress)
        await  user.save()
            res.redirect('/user/toCheckout')
    }catch(error){
      res.render('user/404Page')
    }
}


// Add a route for deleting an address
const deleteAddress = async (req, res) => {
    try {
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
        const email= req.session.email
        const userData= await Users.findOne({email:email})
        res.render("user/addressManage",{title:"Address  page",userData,user:userData})
    } catch (error) {
        
    }
}

const editAddress=async (req, res) => {
    try {

      const addressId = req.params.id;

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
      if (!user) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      res.json({ success: true, message: 'Address edited successfully', updatedAddress });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  

 
  
 
  const userProfile= async (req, res) => {
    try{
      
        if (req.file) {
            const updatedUser = await Users.findOneAndUpdate(
                { email: req.session.email },
                { profilePhoto: req.file.filename },
                { new: true }
            );

            if (updatedUser) {
                
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
        res.render("user/walletHistory",{title:"wallet",userData,user:userData})
    }catch(error){
        console.error("wallet history error",error);
        res.render('user/404Page')
    }
}

const ChangeUserName=async (req,res)=>{
  try {
    const NewName=req.body.newUsername

    const changedName=await Users.findOneAndUpdate({email:req.session.email},{$set:{userName:NewName}})
  
      res.json({success:true})
  } catch (error) {
    console.error(error)
    res.render("user/404Page")
  }
}

const GuestRpoductView=async (req,res)=>{
  try {
    const productId=req.params.id
    const product=await productUpload.findOne({_id:productId})
    res.render('user/guestproductView',{data:product})
  } catch (error) {
    res.render("uesr/404Page")
  }
}

const GuestShop=async (req,res)=>{
  try {
    const data = await productUpload.find()
    res.render('user/guestShop',{data})
  } catch (error) {
    res.render('user/404Page')
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
    ToWalletHistory,
    ChangeUserName,
    GuestRpoductView,
    GuestShop
}