const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
  Status: { type: String },
  Items: [{
    status:{type:String,
      default :"Orderd"
    },
     Price: { type: Number },
     productId: { type: Schema.Types.ObjectId, ref: 'productUpload' },
     quantity: { type: Number },  
  }],
  UserID: { type: Schema.Types.ObjectId },
  Address: {
    name:{type:String},
    addressLine: { type: String },
    city: { type: String },
    pincode: { type: String },
    state: { type: String },
    mobileNumber:{type:Number}
},
  paymentMethod:{type : String},
  paymentStatus:{type : String},
  CoupenID: { type: Schema.Types.ObjectId },
  TotalPrice: { type: Number },
  OrderDate: { type: Date },
  PaymentId: { type: Number },
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports= Orders;

