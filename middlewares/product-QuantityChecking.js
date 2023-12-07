const Cart = require('../models/cart');
const Product = require('../models/model');
const Users = require('../models/users');
const Swal = require('sweetalert2');

const checkProductQuantity = async (req, res, next) => {
  try {
    const user = await Users.findOne({ email: req.session.email });

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart || cart.products.length === 0) {
      return res.redirect('/user/toCart');
    }

    const productsWithInsufficientQuantity = [];

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);

      if (!product || product.AvailableQuantity < item.quantity) {
        productsWithInsufficientQuantity.push({
          productName: product ? product.ProductName : 'Unknown Product',
          requiredQuantity: item.quantity,
          availableQuantity: product ? product.AvailableQuantity : 0,
        });
      }
    }
    console.log(productsWithInsufficientQuantity,'===========');
    if (productsWithInsufficientQuantity.length > 0) {
      const alertMessage = productsWithInsufficientQuantity.map(product => {
        return `${product.productName} - Required: ${product.requiredQuantity}, Available: ${product.availableQuantity}`;
      }).join('\n');
      return res.redirect(`/user/toCart?error=${encodeURIComponent(alertMessage)}`);
    }

    next();
  } catch (error) {
    console.error('Error checking product quantity:', error);
    res.render('user/404Page')
  }
};

module.exports = checkProductQuantity;
