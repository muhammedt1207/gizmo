const mongoose = require('mongoose');
const connection=require("../config/connection")

const { Schema, ObjectId } = mongoose;

const TransactionSchema = new Schema({
  amount: { type: Number },
  transactionType: { type: String, enum: ['debit', 'credit'] },
  timestamp: { type: Date, default: Date.now },
  description: { type: String },
});

const UsersSchema = new Schema({
  userName: { type: String, required: true, },
  profilePhoto:{type:String},
  password: { type: String, },
  email: { type: String, required: true },
  phone: { type: String },
  status: { type: Boolean,
            default:true
   },
   referralCode:{type:String},
   
   wallet: {
    amount: { type: Number, default: 0 },
    transactions: [TransactionSchema],
  },
   usedCoupons:[
    { couponCode: { type: String },
     discountedAmount: { type: Number },
      usedDate: { type: Date } }
    ],
  address: [{
    name:{ type : String },
     addressLine: { type: String },
     city: { type: String },
     pincode: { type: String },
     state: { type: String },
     mobileNumber:{type:Number}
  }],
});

const Users = mongoose.model('Users', UsersSchema);

module.exports=Users;