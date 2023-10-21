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
     country: { type: String },
     pincode: { type: String },
     state: { type: String },
  }],
  dob: { type: Date },
  gender: { type: String },
  joined:{type:Date},
  profile:{type:String}
});

const Users = mongoose.model('Users', UsersSchema);

module.exports=Users;