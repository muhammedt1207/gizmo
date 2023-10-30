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




const filter= async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.ram) {
      filters.Specification1 = req.query.ram;
    }

    if (req.query.storage) {
      filters.storageSize = req.query.storage;
    }

    if (req.query.brand) {
      filters.BrandName = req.query.brand;
    }

    const filteredProducts = await Product.find(filters);

    res.render('user/product-list', { products: filteredProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {
    filter,
};
