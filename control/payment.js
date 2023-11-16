const  Order=require('../models/orders')
const mongoose = require("mongoose");
const crypto = require('crypto');
const razorpay=require('../service/rezorpay')


const verifyPayment=async(req,res)=>{
  try {
    console.log("verify payment");
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
    console.log(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );
    hmac.update(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );

    hmac = hmac.digest("hex");
    if (hmac === req.body.payment.razorpay_signature) {
      const orderId = new mongoose.Types.ObjectId(
        req.body.order.createdOrder.receipt
      );
      console.log("reciept", req.body.order.createdOrder.receipt);
      const updateOrderDocument = await Order.findByIdAndUpdate(orderId, {
        PaymentStatus: "Paid",
        PaymentMethod: "Online",
      });
    
      res.json({ success: true });
    } else {
 
      res.json({ failure: true });
    }

  } catch (error) {
    console.error("failed to verify the payment",error);
  }
}

  module.exports={
    verifyPayment,



    }