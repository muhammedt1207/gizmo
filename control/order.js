
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart=require('../models/cart');
const Users = require("../models/users");
const order = require ('../models/orders');
const { ObjectId } = require("mongodb");
const { model } = require("mongoose");
const moment=require('moment');







const toCheckout= async (req,res)=>{
    console.log("to checkout page");
    const email= req.session.email
    const userData= await Users.findOne({email:email})
    res.render("user/checkoutPage",{title:"checkout  page",userData})
}


const placeOrder = async (req, res) => {
    try {
      const userData= await Users.findOne({email:req.session.email}) 
      const userId= userData._id;
      const selectedAddressId = req.body.selectedAddressId;
        console.log("?/////////////////////|||||||||||",selectedAddressId);
      const cartDetails= await cart.findOne({userId:userId})
     console.log("...>>>>>>>>>>>>>>>>....>>>>",cartDetails);
      const newOrder = new order({
        Status: 'Pending', 
        Items: cartDetails.products,
        UserID: userId,
        paymentMethod:"COD",
        Address: selectedAddressId,
        TotalPrice: req.session.totalPrice,
        OrderDate: moment(new Date()).format("llll"),
      });
      console.log("!!!!!!!!!!!!!!!!!!!",newOrder.Items);
      const savedOrder = await newOrder.save();

      console.log("<<<<>>>>><><><><><><><><><><><>",savedOrder.Items.productId);
      if(savedOrder){
      
        await cart.findOneAndDelete({ userId : userId});

        for (const item of cartDetails.products) {
            const productId = item.productId;
            const purchasedQuantity = item.quantity;
    
            await productUpload.findOneAndUpdate(
                { _id: productId },
                { $inc: { AvailableQuantity: -purchasedQuantity } }
              );
          }
        res.render("user/orderSuccess",{order: savedOrder });
      }else{
        res.status(500).json({ success: false, message: 'Order placement failed.' });
      }

    } catch (error) {
      console.error('Error placing the order:', error);
      res.render('user/404Page')
      res.status(500).json({ success: false, message: 'Error placing the order.' });

    }
  }

  const toOrderPage = async (req, res) => {
    try {
      const userData = await Users.findOne({ email: req.session.email });
      const userId = userData._id;
      console.log(userId, '.............');
      const orderData = await order.find({ UserID: userId }).populate('Items.productId');
      
      console.log(orderData, '..................................');
  
      
  
      res.render('user/Orders', { title: 'Orders', orderData });
    } catch (error) {
      console.error(error);
      res.render('user/404Page');
    }
  };
  

const orderDetails= async (req,res)=>{
  try {
    const user=req.session.user
    const orderId=req.params.id;
    console.log(orderId);
    const orderData= await order.find({_id:orderId}).populate('Items.productId');
    console.log(orderData,"*****************************");

    
  


     res.render('user/orderDetails',{orderData,user})
    
  } catch (error) {
    console.error(error)
    res.render('user/404Page')
  }
}

module.exports={
    toCheckout,
    placeOrder,
    toOrderPage,
    orderDetails

}