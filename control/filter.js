const bcrypt = require("bcrypt");
const sendOTP = require("./otpController");
const { use } = require("../routers/adminRoute");
require("../util/otpindex")
const OTP = require("../models/otpModel");
const productData = require('../models/model');
const cart=require('../models/cart');
const Users = require("../models/users");
const order = require ('../models/orders');
const { ObjectId } = require("mongodb");
const { model } = require("mongoose");




// const filter= async (req, res) => {
//   try {
//     const filters = {};
    
//     if (req.query.ram) {
//       filters.Specification1 = req.query.ram;
//     }

//     if (req.query.storage) {
//       filters.storageSize = req.query.storage;
//     }

//     if (req.query.brand) {
//       filters.BrandName = req.query.brand;
//     }

//     const filteredProducts = await Product.find(filters);

//     res.render('user/product-list', { products: filteredProducts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// }

// const filter=(req, res) => {
//   const filters = req.query;
//   console.log(filters,"......................");

//   const filteredProducts = productUpload.filter((product) => {
  
//     if (filters.ram && product.Specification1 !== filters.ram) {
//       return false;
//     }
//     if (filters.storage && product.Specification2 !== filters.storage) {
//       return false;
//     }
//     if (filters.brand && product.BrandName !== filters.brand) {
//       return false;
//     }

//     return true;
//   });

//   // Return the filtered products as JSON
//   res.json(filteredProducts);
// }




const filter = async (req, res) => {
  try {
    const { brand, priceRanges } = req.query;
    let filters = {};

    if (brand && brand !== 'ALL') {
      filters.BrandName = brand;
    }

    console.log("............",filters,priceRanges);
    if (priceRanges) {
      const priceRangesArray = priceRanges.split(','); 
      // console.log("----------",priceRanges,'.........',priceRangesArray);
      const priceFilter = priceRangesArray.map((range) => {
        const [min, max] = range.split('-');
        let modifiedMax = max;

        if (max == 0) {
          modifiedMax = Number.MAX_VALUE;
        }
      
        // console.log("***************",min,max);
        
        return {
          DiscountAmount: { ...(min ? { $gte: parseFloat(min) } : {}), ...(max ? { $lt: parseFloat(modifiedMax) } : {}) },
        };
      });


      // console.log("/\/\/\/\/\/\/\/\\/\/\/\/\/\/\/\/\/\/\/",priceFilter);
      filters = { ...filters, $or: priceFilter };
    }
    // console.log("/\/\/\/\/\/\/\/\\/\/\/\/\/\/\/\/\/\/\/",filters);
    const data = await productData.find(filters).exec();
    // console.log("/\/\/\/\/\/\/\/\\/\/\/\/\/\/\/\/\/\/\/",data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};













const allproduct = async (req, res) => {
  try {
    const data = await productData.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {
  filter,
  allproduct
};