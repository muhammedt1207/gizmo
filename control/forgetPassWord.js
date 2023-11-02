
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
const moment=require('moment');
const bcrypt = require("bcrypt");




const changePass = async (req, res) => {
    try {
      const check = await Users.findOne({ email: req.session.email});
      console.log("User check:", check);

      if (check) {
        console.log(req.body.oldPassword,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        const isMatch = await bcrypt.compare(req.body.oldPassword, check.password);
        console.log("Password Match:", isMatch);

        if (isMatch) {
            const pass = await bcrypt.hash(req.body.newPassword, 10);
            const email = req.session.email;
            console.log("New Password:", req.body.newPassword);
            console.log("Email:", email);

            const update = await Users.updateOne({ email: email }, { $set: { password: pass } });
            console.log("Update Result:", update);

            return res.json({ success: true });
          }
        } else {
          return res.json({ success:false, error: "Invalid password" });
        }
    } catch (error) {
      console.error("Error:", error);
      return res.json({ success: false, error: "Invalid password" });
    }
};

  
module.exports={
    changePass,

}