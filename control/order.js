
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart = require('../models/cart');
const Users = require("../models/users");
const Orders = require('../models/orders');
// const { ObjectId } = require("mongodb");
const { ObjectId } = require("mongoose");
const moment = require('moment');
const mongoose = require('mongoose');
const { generateInvoice } = require('../service/easyInvoice')
const fs = require('fs')
const Return=require('../models/returnSchema');
const { log } = require("util");
const Coupons=require('../models/coupon')
const rezorpay=require('../service/rezorpay')
const crypto =require('crypto')
const sendEmail=require("../util/mail");
const path = require('path');

const toCheckout = async (req, res) => {
  const email = req.session.email
  const TotalPrice=req.session.totalPrice
  const grandTotal=req.session.grandTotal
  


  const userData = await Users.findOne({ email: email })
  const Cart=await cart.findOne({userId:userData._id})
  const coupon = req.session.coupon
  if (Cart && Cart.products.length > 0) {
    for (const cartProduct of Cart.products) {
      const productData = await productUpload.findOne({ _id: cartProduct.productId });

      if (productData && cartProduct.quantity <= productData.AvailableQuantity) {
      }else {
      }
    }
  }
  res.render("user/checkoutPage", { title: "checkout  page", userData, user: userData ,Cart,TotalPrice, coupon,grandTotal})
}








const useCoupon= async (req,res)=>{
  try {
    const {couponCode} = req.body; 
    const userData=await Users.findOne({email:req.session.email})

  const cartData=await cart.findOne({userId:userData._id})
    const purchaseAmount=req.session.totalPrice
    const coupon = await Coupons.findOne({ CoupenCode: couponCode });
    if (!coupon) {
      return res.json({ success: false, message: 'Coupon not found' });
    }

    const isCouponUsed = userData.usedCoupons.some(usedCoupon => usedCoupon.couponCode === couponCode);
    if (isCouponUsed) {
      return res.json({ success: false, message: 'Coupon already used' });
    }
    
    if (purchaseAmount < coupon.MinAmount) {
      return res.json({ success: false, message: 'Purchase amount does not meet the minimum requirement for the coupon' });
    }
    if (purchaseAmount < coupon.DiscountAmount) {
      return res.json({ success: false, message: 'Purchase Amount must Greater Than Discount amount' });
    }

    const currentDate = new Date();
    const endDate = new Date(coupon.EndDate);
    if (currentDate > endDate) {
      return res.json({ success: false, message: 'Coupon has expired' });
    }
  
    const discountedAmount = Math.min(purchaseAmount, coupon.DiscountAmount);
    const totalAfterDiscount = purchaseAmount - discountedAmount;
    req.session.grandTotal=totalAfterDiscount
    userData.usedCoupons.push({
      couponCode: couponCode,
      discountedAmount: discountedAmount,
      usedDate: new Date(),
    });
    await userData.save();
  
return res.json({
  success: true,
  message: 'Coupon applied successfully',
  coupon:discountedAmount,
  discountedAmount: discountedAmount,
  grandTotal:totalAfterDiscount
});

} catch (error) {
    console.error(error,"error happpened in coupon management")
  }
}





const placeOrder = async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.session.email });
    const userId = userData._id;
    const selectedAddressId = req.body.selectedAddress;
    const paymentMethod=req.body.selectedPaymentMethod
    const grandTotal=req.session.grandTotal
    let amount=null
    if(grandTotal==null){
      amount=req.session.totalPrice

    }else{
      amount=req.session.grandTotal
      
    }
    
    const amountInRupees=Math.floor(amount)

    const amountInPaisa = Math.round(amountInRupees * 100);
    const selectedAddress = userData.address.find((address) => address._id == selectedAddressId);
    if (!selectedAddress) {
      return res.status(400).json({ success: false, message: 'Selected address not found' });
    }

    const cartDetails = await cart.findOne({ userId: userId });
    for (const cartProduct of cartDetails.products) {
      const productData = await productUpload.findOne({ _id: cartProduct.productId });

      if (productData && cartProduct.quantity <= productData.AvailableQuantity) {
      }else {
        return res.json({
          success: false,
          productAvailability:true,
          message: `product${productData.ProductName} have only ${productData.AvailableQuantity} left`
        })      }
    }
    

    const currentDate=new Date()
    const newOrder = new Orders({
      Status: 'Pending',
      Items: cartDetails.products,
      UserID: userId,
      paymentMethod: paymentMethod,
      Address: {
        name : selectedAddress.name,
        addressLine: selectedAddress.addressLine,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
        state: selectedAddress.state,
        mobileNumber: selectedAddress.mobileNumber,
      },
      TotalPrice: amount,
      OrderDate: currentDate,
    });
    const savedOrder = await newOrder.save();

    if (savedOrder) {
      await cart.findOneAndDelete({ userId: userId });

      for (const item of cartDetails.products) {
        const productId = item.productId;
        const purchasedQuantity = item.quantity;

        await productUpload.findOneAndUpdate(
          { _id: productId },
          { $inc: { AvailableQuantity: -purchasedQuantity } }
        );
      }
    }
     if(paymentMethod=="cod"){
      res.json({
        codSuccess: true,
        message: "oreder Success"
      })
    }else if(paymentMethod=="online"){
      const order = {
        amount: amount*100,
        currency: "INR",
        receipt: savedOrder._id,
      };
      await rezorpay
              .createRazorpayOrder(order)
              .then((createdOrder) => {
                res.json({ online:true,createdOrder, order });
              })
              .catch((err) => {
              });
  
            } else if(paymentMethod=="wallet"){
              const TotalPrice=amount
              userData.wallet.amount -= TotalPrice;
              userData.wallet.transactions.push({
                amount: TotalPrice,
                transactionType: 'debit',
                timestamp: new Date(),
                description: 'Order payment', 
              });
              userData.save()
              newOrder.paymentStatus="Paid"
            
              await newOrder.save()
              
              res.json({
                codSuccess: true,
                message: "oreder Success"
              })
              
            }
  
  } catch (error) {
    console.error('Error placing the order:', error);
    return res.render('user/404Page');
  }

}





const verifyPayment = async (req, res) => {
  try {
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
   
    const {payment,order}=req.body

    const orderId=order.createdOrder.receipt
    const updateOrderDocument = await Orders.findByIdAndUpdate(orderId, {
      paymentStatus: "Paid",
    });
        res.json({ success: true });
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
    } else {
      
      res.json({ failure: true });
    }
  } catch (error) {

    console.error("failed to verify the payment", error);
  }
};






const toOrderPage = async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.session.email });
    const userId = userData._id;

    const orderData = await Orders.find({ UserID: userId,
    paymentMethod: { $ne: "online" },
    paymentStatus: { $ne: "pending" },})
    .populate('Items.productId')
    .sort({OrderDate:-1});





    res.render('user/Orders', { title: 'Orders', orderData, user: userData });
  } catch (error) {
    console.error(error);
    res.render('user/404Page');
  }
};


const orderDetails = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.session.email })
    const orderId = req.params.id;

    const orderData = await Orders.find({ _id: orderId }).populate('Items.productId');



    res.render('user/orderDetails', { orderData, user })

  } catch (error) {
    console.error(error)
    res.render('user/404Page')
  }
}

const cancellOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderData = await Orders.findById(orderId);


    if (orderData.Status !== 'Delivered') {
      orderData.Status = 'Cancelled';
      if (orderData.paymentMethod === 'Online' || orderData.paymentMethod === 'wallet') {
        const userData = await Users.findOne({email:req.session.email});
       
        userData.wallet.amount += orderData.TotalPrice;
        userData.wallet.transactions.push({
          amount: orderData.TotalPrice,
          transactionType: 'credit', 
          timestamp: new Date(),
          description: 'Order cancellation refund', 
        });
        await userData.save();
        
      }
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
    
    const newitemId=itemId.trim()
    const orderData = await Orders.findById(orderId);
    

    if (!orderData) {
      return res.status(404).json({ message: 'Order not found' });
    }



  
    let itemToCancel=null
    orderData.Items.forEach((item,index) => {
      const itemID = item._id.toString()
      if ( itemID == newitemId ) {
        itemToCancel = item;
       
        
      }
    });
   

    if (!itemToCancel) {
      return res.status(404).json({ message: 'Item not found in the order' });
    }

    const product = await productUpload.findById(itemToCancel.productId);

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








const returnOrder = async (req, res) => {
  try{
  const { orderId, itemId, returnReason, returnDescription } = req.body;

    const newitemId=itemId.trim()
    const orderData = await Orders.findById(orderId);
  
    
    
    if (!orderData) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let itemReturn = null;
    let itemIndex =-1

    

    orderData.Items.forEach((item,index) => {
      const itemID = item._id.toString()
      if ( itemID == newitemId ) {
        itemReturn = item;
        itemIndex = index
      }
    });

    if (!itemReturn) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const product = await productUpload.findById(itemReturn.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    orderData.Items[itemIndex].status = 'return'
    const returnQuantity=itemReturn.quantity
    const price = product.DiscountAmount*returnQuantity; 

    orderData.TotalPrice-=price
    await orderData.save();
   
    const user= await Users.findOne({email:req.session.email})
    const userId = user._id; 
    const productId = product._id; 
   
    const returnedDate = new Date();
    const orderDate = orderData.OrderDate;
    const returnData = new Return({
      userId,
      orderId,
      product: productId,
      reason: returnReason,
      quantity: returnQuantity,
      price,
      returnedDate,
      orderDate,
    });

    await returnData.save();

    return res.status(200).json({ success: true, message: 'Product returned successfully' });
  } catch (error) {
    console.error('Error returning the product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};










//generate invoice
const generateInvoices = async (req, res) => {
  try {
    const { orderId } = req.body;

    const orderDetails = await Orders.find({ _id: orderId }).populate("Items.productId");


    const ordersId = orderDetails[0]._id;

    if (orderDetails) {
      const invoicePath = await generateInvoice(orderDetails);
      res.json({ success: true, message: 'Invoice generated successfully', invoicePath });
    } else {
      res.status(500).json({ success: false, message: 'Failed to generate the invoice' });
    }


  } catch (error) {
    console.error('error in invoice downloading', error)
    res.status(500).json({ success: false, message: 'Error in generating the invoice' });
  }
}



//download invoice
const downloadInvoice = async (req, res) => {
  try {
    const id = req.params.orderId

    const filePath = path.join(__dirname, '../pdf', `${id}.pdf`);

    res.download(filePath, `invoice.pdf`)
  } catch (error) {
    console.error('Error in downloading the invoice:', error);
    res.status(500).json({ success: false, message: 'Error in downloading the invoice' });
  }
}


module.exports = {
  toCheckout,
  placeOrder,
  toOrderPage,
  orderDetails,
  cancellOrder,
  oneItemcancel,
  downloadInvoice,
  generateInvoices,
  returnOrder,
  useCoupon,
  verifyPayment

}
