const mongoose = require('mongoose');
const connection=require("../config/connection")

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  userName: { type: String, required: true, },
  password: { type: String, },
  email: { type: String, required: true },
  phone: { type: String },
  status: { type: Boolean,
            default:true
   },
  address: [{
     addressLine: { type: String },
     city: { type: String },
     pincode: { type: String },
     state: { type: String },
     mobileNumber:{type:Number}
  }],
});

const Users = mongoose.model('Users', UsersSchema);

module.exports=Users;