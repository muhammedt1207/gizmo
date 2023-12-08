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
const Wishlists=require('../models/wishlist')

const towishList=async (req,res)=>{
    try {
        const UserData=await Users.findOne({email:req.session.email})
        const wishListData=await Wishlists.findOne({userId:UserData._id}).populate("productId")

        res.render('user/wishlist',{wishListData, user:UserData,title:"wishlist"})
    } catch (error) {
        res.render("user/404Page")
        
    }
}
const addToWishlist = async (req, res) => {
    try {

        const productIds = req.body.itemId;
        const userData = await Users.findOne({ email: req.session.email });

        const wishlistData = await Wishlists.findOne({ userId: userData._id }) || new Wishlists({ userId: userData._id, productId: [] });

        if (!wishlistData.productId.includes(productIds)) {
            wishlistData.productId.push(productIds);
            await wishlistData.save();
            
            res.json({ success: true,item:true , message: 'Product added to wishlist' });
        } else {
            const updatedWishlist = await Wishlists.findOneAndUpdate(
                { userId: userData._id },
                { $pull: { productId: productIds } },
                { new: true }
            );

            res.json({ success: true,item:false, message: 'Product removed from wishlist' });
        }

    } catch (error) {
        console.error(error, 'wishlist error');
        res.render('user/404Page');
    }
};


module.exports={
    towishList,
    addToWishlist

}