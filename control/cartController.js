const user = require("../models/users")
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart=require('../models/cart');
const Users = require("../models/users");
const { ObjectId } = require("mongodb");

const addTocart=async (req,res)=>{
    try {
        let user= await Users.findOne({email:req.session.email})
        console.log("this user add  to cart",user);
        let userId=user._id
        console.log( "add to cart .........",userId);

        console.log(req.params.id);
        const productId=req.params.id
        const check = await cart.findOne({ userId: userId });
        console.log("add  to  cart .......................",check);

        if(check !==null){
            const checkExisting = check.products.find((item) =>
        item.productId.equals(productId));
        console.log("owoowowowoowowoowo");

        if(checkExisting){
            checkExisting.quantity +=1
            console.log("laskdhfoiahwewoihfoaiihfo");

        }else{
            check.products.push({productId:productId,quantity:1})
            console.log("vnvnvnnvvnnvvnnvnnvn....");
        }

        await check.save();
        console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzz");
        req.flash("err","Item added to cart")
        req.json({succes:true,message:"Item Added To cart"})
        }else{

            const newCart= new cart({

                userId:userId,
                products:[{productId  : new ObjectId(productId),quantity:1}],
            })

            await newCart.save();
            res.json({success:true,message:"Item added to cart"})
            req.flash("err","Item added to cart")
        }
    } catch (error) {
        console.log(error,"somthing error in cart adding");
        res.status(500).json({status:false})
        res.render('user/404Page')
    }

}

const toCart=async (req,res)=>{
    try {
        let userData=await Users.findOne({email:req.session.email})
        let userId=userData._id;
        const cart = await Cart.findOne({ userId: userId }).populate("productUpload.productId" ); 
        res.render('user/cart',{title:"cart",cart})
    } catch (error) {
        console.error(error);
        res.status(500).send("Internet Server Error")
    }
}

module.exports={
    addTocart,
    toCart,
}