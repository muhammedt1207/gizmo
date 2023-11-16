
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart = require('../models/cart');
const Users = require("../models/users");
const order = require('../models/orders');
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



const toCheckout = async (req, res) => {
  console.log("to checkout page");
  const email = req.session.email
  const TotalPrice=req.session.totalPrice
  const grandTotal=req.session.grandTotal
  
  const userData = await Users.findOne({ email: email })
  const Cart=await cart.findOne({userId:userData._id})
  const coupon = req.session.coupon
  res.render("user/checkoutPage", { title: "checkout  page", userData, user: userData ,Cart,TotalPrice, coupon,grandTotal})
}








const useCoupon= async (req,res)=>{
  try {
    console.log("coupon added");
    const {couponCode} = req.body; 
    console.log(couponCode);
    const userData=await Users.findOne({email:req.session.email})

  const cartData=await cart.findOne({userId:userData._id})
  console.log(".................",cartData);
    const purchaseAmount=req.session.totalPrice
    console.log(purchaseAmount);
    const coupon = await Coupons.findOne({ CoupenCode: couponCode });
    console.log(",,,,,,",coupon)
    if (!coupon) {
      return res.json({ success: false, message: 'Coupon not found' });
    }

    const isCouponUsed = userData.usedCoupons.some(usedCoupon => usedCoupon.couponCode === couponCode);
    console.log(isCouponUsed);
    if (isCouponUsed) {
      return res.json({ success: false, message: 'Coupon already used' });
    }
    
    if (purchaseAmount < coupon.MinAmount) {
      return res.json({ success: false, message: 'Purchase amount does not meet the minimum requirement for the coupon' });
    }
    console.log("--------",purchaseAmount,coupon.MinAmount);

    const currentDate = new Date();
    const endDate = new Date(coupon.EndDate);
    if (currentDate > endDate) {
      return res.json({ success: false, message: 'Coupon has expired' });
    }
console.log(currentDate,endDate);
  
    const discountedAmount = Math.min(purchaseAmount, coupon.DiscountAmount);
    const totalAfterDiscount = purchaseAmount - discountedAmount;
    req.session.grandTotal=totalAfterDiscount
    console.log(totalAfterDiscount,"***********");
    userData.usedCoupons.push({
      couponCode: couponCode,
      discountedAmount: discountedAmount,
      usedDate: new Date(),
    });
    await userData.save();
console.log(userData,"/////////");
  
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
    console.log("d>>>>>>>>>>>>>>>>>>>>>>>>>", selectedAddressId,"payment method is",paymentMethod);
    const amount=req.session.totalPrice
    const selectedAddress = userData.address.find((address) => address._id == selectedAddressId);
    console.log("..................", selectedAddress);
    if (!selectedAddress) {
      return res.status(400).json({ success: false, message: 'Selected address not found' });
    }

    const cartDetails = await cart.findOne({ userId: userId });

    const newOrder = new order({
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
      TotalPrice: req.session.totalPrice,
      OrderDate: new Date(),
    });
    console.log("order saved");
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
    console.log("product minused");
     if(paymentMethod=="cod"){
      console.log("payment is cod");
      res.json({
        codSuccess: true,
        message: "oreder Success"
      })
    }else if(paymentMethod=="online"){
      console.log("payment online");
      const order = {
        amount: amount,
        currency: "INR",
        receipt: savedOrder._id,
      };
      await rezorpay
              .createRazorpayOrder(order)
              .then((createdOrder) => {
                console.log("payment response", createdOrder,order);
                res.json({ online:true,createdOrder, order });
              })
              .catch((err) => {
                console.log(err,"error happened in the rezorpay");
              });
  
            } else if(paymentMethod=="wallet"){
              const TotalPrice=req.session.totalPrice
              userData.wallet -= TotalPrice;
              userData.save()
              console.log("payment is wallet");
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

const toOrderPage = async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.session.email });
    const userId = userData._id;
    // console.log(userId, '.............');
    const orderData = await order.find({ UserID: userId }).populate('Items.productId');

    // console.log(orderData, '..................................');



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
    console.log(orderId);
    const orderData = await order.find({ _id: orderId }).populate('Items.productId');
    console.log(orderData, "*****************************");


    res.render('user/orderDetails', { orderData, user })

  } catch (error) {
    console.error(error)
    res.render('user/404Page')
  }
}

const cancellOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderData = await order.findById(orderId);


    if (orderData.Status !== 'Delivered') {
      orderData.Status = 'Cancelled';
      if (orderData.paymentMethod === 'online' || orderData.paymentMethod === 'wallet') {
        const userData = await Users.findOne({email:req.session.email});
       
        userData.wallet += orderData.TotalPrice;
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
    console.log(orderId, "Order ID");
    console.log(itemId, "Item ID");
    const newitemId=itemId.trim()
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
    const itemToCancel=null
    orderData.Items.forEach((item,index) => {
      const itemID = item._id.toString()
      if ( itemID == newitemId ) {
        itemToCancel = item;
       
        // console.log('................90234909',item);
      }
    });
    console.log("splice is worked");
    console.log('iuggqreiutg', itemToCancel, "Item to Cancel-------------------------------");

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








const returnOrder = async (req, res) => {
  try{
  const { orderId, itemId, returnReason, returnDescription } = req.body;
    // console.log(orderId, "Order ID");
    // console.log(returnReason);
    // console.log(returnDescription);
    const newitemId=itemId.trim()
    const orderData = await order.findById(orderId);
    console.log(orderData,"))))))))))))))))))))))))))))))))))");
    
    
    if (!orderData) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let itemReturn = null;
    let itemIndex =-1
    // Find the item in the order
    // console.log(item._id.toString(),">>>>>>>>>>>>>");
    // console.log(itemId,"Item ID");
    // console.log(newitemId,'>>>>>>>>>>');

    orderData.Items.forEach((item,index) => {
      const itemID = item._id.toString()
      if ( itemID == newitemId ) {
        itemReturn = item;
        itemIndex = index
        // console.log('................90234909',item);
      }
    });
    // console.log(',,,,,,,,,,', itemReturn);

    if (!itemReturn) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    orderData.Items[itemIndex].status = 'return'
    const returnQuantity=itemReturn.quantity
    console.log(returnQuantity);
    
    await orderData.save();
   
    const product = await productUpload.findById(itemReturn.productId);
    // console.log(product,'$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const user= await Users.findOne({email:req.session.email})
    // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^',user);
    const userId = user._id; 
    // console.log('!!!!!!!!!!!!!',userId);
    const productId = product._id; 
    const price = product.DiscountAmount*returnQuantity; 
   
    const returnedDate = new Date();
    const orderDate = orderData.OrderDate;
    const returnData = new Return({
      userId,
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

    const orderDetails = await order.find({ _id: orderId }).populate("Items.productId");

    console.log(orderDetails, '>>>>>>>>>>>>>>');

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
    console.error('error in invoice downloading', error)
    res.status(500).json({ success: false, message: 'Error in generating the invoice' });
  }
}



//download invoice
const downloadInvoice = async (req, res) => {
  try {
    const id = req.params.orderId
    console.log(id, '!!#########');

    const filePath = `C:/Users/dell/Desktop/gizmo/pdf/${id}.pdf`;
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', filePath);
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

}
