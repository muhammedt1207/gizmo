
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
// const =async (req,res)=>{
//     console.log(";oaseht.........>>>>>>>>>>>>>>>>>>>");
//     try {
//         let user= await Users.findOne({email:req.session.email})
//         console.log("this user add  to cart",user);
//         let userId=user._id
//         console.log( "add to cart .........",userId);

//         console.log(req.params.id);
//         const productId=req.params.id
//         const check = await cart.findOne({ userId: userId });
//         console.log("add  to  cart .......................",check);

//         if(check !==null){
//             const checkExisting = check.products.find((item) => item.itemId && item.itemId.equals(productId));

//         console.log("owoowowowoowowoowo");

//         if(checkExisting){
//             checkExisting.quantity +=1
//             console.log("laskdhfoiahwewoihfoaiihfo");

//         }else{
//             check.products.push({productId:productId,quantity:1})
//             console.log("vnvnvnnvvnnvvnnvnnvn....");
//         }

//         await check.save();
//         console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzz");
//         req.flash("err","Item added to cart")
//         res.json({ success: true, message: "Item Added To cart" });
//     }else{

//             const newCart= new cart({

//                 userId:userId,
//                 products:[{productId  : new ObjectId(productId),quantity:1}],
//             })

//             await newCart.save();
//             res.json({success:true,message:"Item added to cart"})
//             req.flash("err","Item added to cart")
//         }
//     } catch (error) {
//         console.log(error,"somthing error in cart adding");
//         res.render('user/404Page')
//     }

// }


const addToCart = async (req, res) => {
  // console.log("Adding to cart...");
  try {
    const user = await Users.findOne({ email: req.session.email });
    // console.log("User adding to cart: ", user);
    const userId = user._id;
    console.log("User ID: ", userId);
    const { itemId } = req.body;
    // console.log("Item ID:..............", itemId);
    let productId = itemId;
    let cartData = await cart.findOne({ userId: userId });

    console.log("Cart Data: ", cartData);

    if (cartData !== null) {
      const productIndex = cartData.products.findIndex(item => item.productId.toString() === productId.toString());
      if (productIndex !== -1) {
        cartData.products[productIndex].quantity += 1;
      } else {
        cartData.products.push({ productId: productId, quantity: 1 });
      }

      await cartData.save();
      req.session.userCart = cartData._id;
      console.log("Item added to cart", cartData);
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
    console.log("Error while adding to cart: ", error);
    res.render('user/404Page');
  }
};



const addlistToCart = async (req, res) => {
  // console.log("Adding to cart...");
  try {
    const user = await Users.findOne({ email: req.session.email });
    // console.log("User adding to cart: ", user);
    const userId = user._id;
    console.log("User ID: ", userId);
    const itemId= req.params.id
    // console.log("Item ID:..............", itemId);
    let productId = itemId;
    let cartData = await cart.findOne({ userId: userId });

    console.log("Cart Data: ", cartData);

    if (cartData !== null) {
      const productIndex = cartData.products.findIndex(item => item.productId.toString() === productId.toString());
      if (productIndex !== -1) {
        cartData.products[productIndex].quantity += 1;
      } else {
        cartData.products.push({ productId: productId, quantity: 1 });
      }

      await cartData.save();
      req.session.userCart = cartData._id;
      console.log("Item added to cart", cartData);
      req.flash("success", "Item added to cart");
      res.json({ success: true, message: "Item added to cart" });
    } else {
      const cartData = await cart.create([{
        userId: userId,
        products: [{ productId: productId, quantity: 1 }],
      }]);
      console.log('cart data secount :',cartData);
      await cartData.save();
      req.session.userCart = cartData._id;
      req.flash("success", "Item added to cart");
      res.json({ success: true, message: "Item added to cart" });
    }
  } catch (error) {
    console.log("Error while adding to cart: ", error);
    res.render('user/404Page');
  }
};




const toCart = async (req, res) => {

  try {
    const email = req.session.email;
    const user = await Users.findOne({ email: email });
    // console.log('user>>>>>>>>>>>>>>>>',user);
    if (!user) {

      return res.status(404).render('user/404Page');
    }
    const userId = user._id;

    // console.log("**************",userId);
    const newcart = await cart.findOne({ userId: userId }).populate("products.productId");


    if (!newcart || newcart.products.length === 0) {
      console.log("this .........inside of if");
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

      });
    }
    // console.log("000000000000000000000000000");
    const products = newcart.products;
    let subtotal = 0;
    let totalQuantity = 0;
    newcart.products.forEach(item => {
      if (item.productId && item.productId.DiscountAmount !== undefined) {
        subtotal += item.quantity * item.productId.DiscountAmount;
        totalQuantity += item.quantity;
      } else {
        console.log("Skipping item due to missing or undefined DiscountAmount:", item.productId);
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
    });

  } catch (error) {
    console.log("error in view cart!!!!!!!!!!!!!");
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
    console.log("remove cart", productId, email, userId);

    const userCart = await cart.findOne({ userId: userId });
    console.log("cart data ....", userCart);

    userCart.products = userCart.products.filter((item) => !item.productId.equals(productId));
    await userCart.save();
    console.log("after the remove cart data ....", userCart);
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
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', productId, quantity, cartId, "123456789")
    const newcart = await cart.findOne({ _id: cartId }).populate("products.productId");
    // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', newcart);
    if (!newcart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    const productInCart = newcart.products.find(item => item.productId.equals(productId));
    // console.log("productIncart>>>>>>>>>><<<<<<<<", productInCart);
    if (!productInCart) {
      return res.status(404).json({ success: false, error: "Product not found in the cart" });
    }

    productInCart.quantity = quantity;
    console.log(productInCart.quantity);

    await newcart.save();

    let subtotal = 0;
    let totalQuantity = 0;

    newcart.products.forEach(item => {
      const { quantity, productId } = item;
      const { DiscountAmount } = productId;
      subtotal += quantity * DiscountAmount;
      totalQuantity += quantity;
    });

    console.log(subtotal, '*********', totalQuantity);
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