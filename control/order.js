
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart=require('../models/cart');
const Users = require("../models/users");
const order = require ('../models/orders');
// const { ObjectId } = require("mongodb");
const { ObjectId } = require("mongoose");
const moment=require('moment');
const mongoose = require('mongoose');
const {generateInvoice}=require('../service/easyInvoice')
const fs=require('fs')






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

      // console.log("<<<<>>>>><><><><><><><><><><><>",savedOrder.Items.productId);
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
      // console.log(userId, '.............');
      const orderData = await order.find({ UserID: userId }).populate('Items.productId');
      
      // console.log(orderData, '..................................');
  
      
  
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

const cancellOrder=async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderData = await order.findById(orderId);

    
    if (orderData.Status !== 'Delivered') {
      orderData.Status = 'Cancelled';
      await orderData.save();

      for (const item of orderData.Items) {
        if (item.productId) {
          const product = await productUpload.findById(item.productId);

          if (product) {
            product.AvailableQuantity += item.quantity;
            await product.save();
          }
        }
      }

      return res.json({ success: true, message: 'Order has been canceled' });
    } else {
      return res.json({ success: false, message: 'Cannot cancel a delivered order' });
    }
  } catch (error) {
    console.error('Error canceling order:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while canceling the order' });
  }

}


const oneItemcancel = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    console.log(orderId, "Order ID");
    console.log(itemId, "Item ID");
    
    const orderData = await order.findById(orderId);
    console.log(orderData, "Order Data");

    if (!orderData) {
      return res.status(404).json({ message: 'Order not found' });
    }
    

    

    // const itemToCancel = await orderData.findOne({
    //   Items: {
    //     $elemMatch: { _id: itemId.trim() }
    //   }
    // });
    
console.log("oiqhpgigtqgp99494y");


    // orderData.Items.forEach((item) => {

      
    //   if (item._id.equals(new mongoose.Types.ObjectId(itemId))) {
    //     itemToCancel = item;
    //     console.log("<<<<<<<<<<<<", itemToCancel);
    //   }
    // });
    const itemToCancel = orderData.Items.findIndex(
      (items) =>items ._id.toString() === itemId
    );
    if (itemToCancel === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    orderData.Items.splice(itemToCancel, 1);
  
console.log("splice is worked");
    console.log('iuggqreiutg',itemToCancel, "Item to Cancel-------------------------------");

    if (!itemToCancel) {
      return res.status(404).json({ message: 'Item not found in the order' });
    }

    const product = await productUpload.findById(itemToCancel.productId);
    console.log(product, "Product Data");

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.AvailableQuantity += itemToCancel.quantity;
    itemToCancel.status = 'Cancelled';

    await orderData.save();
    await product.save();

    res.status(200).json({ message: 'Item cancelled successfully', item: itemToCancel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





//generate invoice
const generateInvoices=async(req,res)=>{
  try {
    const { orderId } = req.body;
   
    const orderDetails= await order.find({_id:orderId}).populate("Items.productId");
    
    console.log(orderDetails,'>>>>>>>>>>>>>>');

    const ordersId = orderDetails[0]._id;

    console.log(ordersId);

    if (orderDetails) {
      console.log("genarating...");
      const invoicePath = await generateInvoice(orderDetails); 
      console.log("genarated.............");
      res.json({ success: true, message: 'Invoice generated successfully', invoicePath });
    } else {
      res.status(500).json({ success: false, message: 'Failed to generate the invoice' });
    }
  
  
  } catch (error) {
    console.error('error in invoice downloading',error)
    res.status(500).json({ success: false, message: 'Error in generating the invoice' });
  }
  }



//download invoice
const downloadInvoice=async(req,res)=>{
try {
  const id=req.params.orderId
  console.log(id,'!!#########');
  const filePath = `C:/Users/dell/Desktop/gizmo/pdf/${id}.pdf`;
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',filePath);
  res.download(filePath,`invoice.pdf`)
} catch (error) {
  console.error('Error in downloading the invoice:', error);
  res.status(500).json({ success: false, message: 'Error in downloading the invoice' });
}
}


module.exports={
    toCheckout,
    placeOrder,
    toOrderPage,
    orderDetails,
    cancellOrder,
    oneItemcancel,
    downloadInvoice,
    generateInvoices

}
