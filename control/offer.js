const users = require('../models/users');
const Category = require('../models/category');
const { ObjectId } = require('mongodb');
const productUpload = require('../models/model');
const orders = require('../models/orders')
const imgCrop = require('../service/bannerCrop')
const banner = require('../models/banner')
const mongoose = require('mongoose')
const moment = require('moment')
const Returns =require('../models/returnSchema');
const Users = require('../models/users');
const Coupons =require('../models/coupon')
const CategoryOfferSchema=require('../models/CategoryOfferSchema')

const toofferPage=async (req,res)=>{
    try {
        const categoryData= await Category.find()
        const offerData=await CategoryOfferSchema.find()
        res.render("admin/CategoryOffer",{categoryData,offerData})
    } catch (error) {
        console.error(error);
    }
}

const addOffer= async (req,res)=>{
    try {
        console.log("offer adding.....");
        const{category,percentage,startDate,endDate}=req.body
        // console.log(category,'......',percentage,'...',startDate,'....',endDate);
        const categoryData=await Category.findById(category)

        const Offer = new CategoryOfferSchema({
            categoryId:category,
            categoryName:categoryData.CategoryName,
            percentage:percentage,
            startDate:startDate,
            expireDate:endDate,  
          });
          await Offer.save();
          const productData=await productUpload.find({Category:categoryData.CategoryName})
          for (let i = 0; i < productData.length; i++) {
            const originalPrice = productData[i].DiscountAmount;
            const discountedPrice = originalPrice - (originalPrice * (percentage / 100));

            // Update the product price in the database
            await productUpload.findByIdAndUpdate(productData[i]._id, { DiscountAmount: discountedPrice });
        }

        //   console.log("coupon saved..................")
          res.json({ success: true, message: 'Coupon created successfully' });
    } catch (error) {
        console.error(error);
    }
}




module.exports={
    toofferPage,
    addOffer
}