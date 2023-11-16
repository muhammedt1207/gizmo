const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const CouponsSchema = new Schema({
    CoupenName: { type: String },
  CoupenCode: { type: String },
  MinAmount: { type: Number },
  DiscountAmount: { type: Number },
  couponType:{type:String},
  StartDate: { type: Date },
  EndDate: { type: Date },
 
});

const Coupons = mongoose.model('Coupons', CouponsSchema);

module.exports= Coupons;

