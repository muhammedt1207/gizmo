
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
        TotalPrice: cartDetails.TotalAmount,
        OrderDate: new Date(),
      });
  
      const savedOrder = await newOrder.save();
      console.log("<<<<>>>>><><><><><><><><><><><>",savedOrder);
      if(savedOrder){
      
        await cart.findOneAndDelete({ userId : userId});

        for (const item of cartDetails.products) {
            const productId = item.productId;
            const purchasedQuantity = item.quantity;
    
            await productUpload.findOneAndUpdate(
                { _id: productId },
                { $inc: { AvailableQuantity: -purchasedQuantity } }
              );
              console.log("quantity updated.................<<<<<<<<<>>>>>>>>>>");
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

  

module.exports={
    toCheckout,
    placeOrder

}