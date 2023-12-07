const mongoose = require('mongoose');

const Schema = mongoose.Schema
//product upload schema 
const productUploadSchema = new Schema({
    ProductName: {
      type: String,
      required: true,
    },
    Price: {
      type: Number,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    BrandName: {
      type: String,
      required: true,
    },
    status :{
      type:Boolean,
      default:true
    },
    Tags: {
      type: Array,
    },
    images: {
      type: Array,
      required: true,
    },
    AvailableQuantity: {
      type: Number,
      required: true,
    },
    Category: {
      type: String,
      required: true,
    },
    DiscountAmount: {
      type: Number,
    },
   
    UpdatedOn: {
      type: Date,
    },
    Specification1: {
      type: String,
    },
    Specification2: {
      type: String,
    },
    Specification3: {
      type: String,
    },
    Specification4: {
      type: String,
    },
    CatogoryOffer:{
      type:Boolean,
      default:false
    },
    offer:{
      type:Number,
    },
  });


const productUpload = mongoose.model('productUpload',productUploadSchema);

module.exports = productUpload
