const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
  Status: { type: String },
  Items: [{
     Price: { type: Number },
     productID: { type: Schema.Types.ObjectId },
     quantity: { type: Number },
  }],
  UserID: { type: Schema.Types.ObjectId },
  Address: { type: String },
  paymentMethod:{type : String},
  CoupenID: { type: Schema.Types.ObjectId },
  TotalPrice: { type: Number },
  OrderDate: { type: Date },
  PaymentId: { type: Number },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports= Orders;

