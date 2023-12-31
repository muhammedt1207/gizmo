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


const tocoupon=async (req,res)=>{
    try {
        const CouponData=await Coupons.find().sort()
        res.render("admin/coupens",{CouponData})
    } catch (error) {
        console.error("To coupon have some trouble",error)
    }

}
const createCoupon= async (req,res)=>{
    try {
        const { name, couponCode, maxAmount, discountAmount, couponType, startDate, endDate} = req.body;


        const existingCoupon = await Coupons.findOne({ CoupenCode: couponCode });
        if (existingCoupon) {

          return res.status(400).json({ success: false, message: 'Coupon with this code already exists.' });
        }
        
        if (!name || !couponCode || isNaN(maxAmount) || isNaN(discountAmount) || !couponType || !startDate || !endDate ) {
  
            return res.status(400).json({ success: false, message: 'Invalid input. Please provide all required fields with valid values.' });
          }
      
        const coupon = new Coupons({
            CoupenName:name,
            CoupenCode:couponCode,
            MinAmount:maxAmount,
            DiscountAmount:discountAmount,
            couponType:couponType,
            StartDate:startDate,
            EndDate:endDate,
          
          });
          await coupon.save();

          res.json({ success: true, message: 'Coupon created successfully' });

    } catch (error) {
        console.error("error happened in coupon ",error)
        res.status(500).json({ success: false, message: 'Internal server error' });
        res.render('admin/404')

    }
}

const deleteCoupon = async (req, res) => {
    try {
        // Delete category by ID
        const id = req.params.id;
        const cetagory = await Coupons.deleteOne({ _id: id });
        res.redirect('/admin/coupens');
    } catch (error) {
        req.render('admin/404')
    }
};


const editCoupon=async (req,res)=>{
    try {
        const couponId=req.params.id
        const {endDate,startDate,discountAmount,maxAmount,couponCode,couponName}=req.body
        const changedCoupon = await Coupons.findByIdAndUpdate(
            { _id: couponId },
            {
                $set: {
                    CoupenName: couponName,
                    CoupenCode: couponCode,
                    MinAmount: maxAmount,
                    DiscountAmount: discountAmount,
                    StartDate: startDate,
                    EndDate: endDate,
                }
            }
        );
        res.json({success:true,messsage:"coupon edit success"})
    } catch (error) {
        res.render('admin/404')
    }
}
module.exports={
    createCoupon,
    tocoupon,
    deleteCoupon,
    editCoupon
}