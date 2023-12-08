
const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productUpload = require('../models/model');
const cart = require('../models/cart');
const Users = require("../models/users");
const { ObjectId } = require("mongodb");
const Coupons=require("../models/coupon")
const Orders=require("../models/orders")



const addToCart = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.session.email });
    const userId = user._id;
    const { itemId } = req.body;
    let productId = req.body.itemId;
    let cartData = await cart.findOne({ userId: userId });


    if (cartData !== null) {
      const productIndex = cartData.products.findIndex(item => item.productId.toString() === productId.toString());
      if (productIndex !== -1) {
        cartData.products[productIndex].quantity += 1;
      } else {
        cartData.products.push({ productId: productId, quantity: 1 });
      }

      await cartData.save();
      req.session.userCart = cartData._id;
      req.flash("success", "Item added to cart");
      res.json({ success: true, message: "Item added to cart" });
    } else {
      const cartData = await cart.create([{
        userId: userId,
        products: [{ productId: productId, quantity: 1 }],
      }]);

      await cartData.save();
      req.session.userCart = cartData._id;
      req.flash("success", "Item added to cart");
      res.json({ success: true, message: "Item added to cart" });
    }
  } catch (error) {
    res.render('user/404Page');
  }
};



const addlistToCart = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.session.email });
    const userId = user._id;
    const itemId= req.params.id
    let productId = itemId;
    let cartData = await cart.findOne({ userId: userId });

  

    if (cartData !== null) {
      const productIndex = cartData.products.findIndex(item => item.productId.toString() === productId.toString());
      if (productIndex !== -1) {
        cartData.products[productIndex].quantity += 1;
      } else {
        cartData.products.push({ productId: productId, quantity: 1 });
      }

      await cartData.save();
      req.session.userCart = cartData._id;
    
      req.flash("success", "Item added to cart");
      res.json({ success: true, message: "Item added to cart" });
    } else {
      const cartData = await cart.create([{
        userId: userId,
        products: [{ productId: productId, quantity: 1 }],
      }]);
    
      await cartData.save();
      req.session.userCart = cartData._id;
      req.flash("success", "Item added to cart");
      res.json({ success: true, message: "Item added to cart" });
    }
  } catch (error) {
   
    res.render('user/404Page');
  }
};




const toCart = async (req, res) => {

  try {
    const email = req.session.email;
    const user = await Users.findOne({ email: email });
    const error = req.query.error
    if (!user) {

      return res.status(404).render('user/404Page');
    }
    const userId = user._id;
    const order = await Orders.findOne({
      UserID: userId,
      paymentMethod: 'online',
      paymentStatus: 'Pending'
    });
    
    let orderId = order ? order._id : null;
   
if (orderId) {
  try {
      const orderData = await Orders.findById(orderId);
          for (const orderItem of orderData.Items) {
              const productId = orderItem.productId;
              const quantity = orderItem.quantity;
              let userCart = await cart.findOne({ userId: userId });
              if (!userCart) {
                  userCart = new cart({
                      userId: userId,
                      products: [],
                      TotalAmount: 0,
                  });
              }
              const existingProduct = userCart.products.find(
                  (product) => product.productId.toString() === productId.toString()
              );
              if (existingProduct) {
                  existingProduct.quantity += quantity;
              } else {
                  userCart.products.push({
                      productId: productId,
                      quantity: quantity,
                  });
              }
              await userCart.save();
          }
          await Orders.deleteOne({ _id: orderId });
  } catch (error) {
      console.error('Error processing order:', error);
  }
}
    const newcart = await cart.findOne({ userId: userId }).populate("products.productId");


    if (!newcart || newcart.products.length === 0) {
      return res.render('user/cart', {
        title: "Cart",
        username: email,
        product: [],
        subtotal: 0,
        total: 0,
        coupon: 0,
        gstAmount: 0,
        totalQuantity: 0,
        user,
        error

      });
    }
    const products = newcart.products;
    let subtotal = 0;
    let totalQuantity = 0;
    newcart.products.forEach(item => {
      if (item.productId && item.productId.DiscountAmount !== undefined) {
        subtotal += item.quantity * item.productId.DiscountAmount;
        totalQuantity += item.quantity;
      } else {
      }

    });
    const gstRate = 0.18;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;

    

    req.session.totalPrice = total;

    res.render("user/cart", {
      title: "Cart",
      username: email,
      product: products,
      newcart,
      subtotal: subtotal,
      gstAmount: gstAmount.toFixed(2),
      totalQuantity: totalQuantity,
      total: total,
      user,
      error
    });

  } catch (error) {
    res.render('user/404Page')
    throw error
  }
}




const removeCart = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await Users.findOne({ email: email })
    const userId = user._id;
    const { productId } = req.body;

    const userCart = await cart.findOne({ userId: userId });

    userCart.products = userCart.products.filter((item) => !item.productId.equals(productId));
    await userCart.save();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.render('user/404Page')
    res.status(500).json({ success: false, message: 'Error removing item from cart' });
    console.error('Error removing item from cart:', error);
  }
}





const updateQuantity = async (req, res) => {
  const { productId, quantity, cartId } = req.body;

  try {
    const newcart = await cart.findOne({ _id: cartId }).populate("products.productId");
    if (!newcart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    const productInCart = newcart.products.find(item => item.productId.equals(productId));
    if (!productInCart) {
      return res.status(404).json({ success: false, error: "Product not found in the cart" });
    }

    productInCart.quantity = quantity;

    await newcart.save();

    let subtotal = 0;
    let totalQuantity = 0;

    newcart.products.forEach(item => {
      const { quantity, productId } = item;
      const { DiscountAmount } = productId;
      subtotal += quantity * DiscountAmount;
      totalQuantity += quantity;
    });

    
    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      subtotal,
      totalQuantity,
    });
  } catch (error) {
    res.render('user/404Page')
    return res.status(500).json({ success: false, error: error.message });
  }
};






module.exports = {
  addToCart,
  toCart,
  removeCart,
  updateQuantity,
  addlistToCart,

}