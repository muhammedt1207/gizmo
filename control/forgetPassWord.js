

require("../util/otpindex")

const Users = require("../models/users");

const { ObjectId } = require("mongodb");
const { model } = require("mongoose");
const moment=require('moment');
const bcrypt = require("bcrypt");




const changePass = async (req, res) => {
  try {
      const check = await Users.findOne({ email: req.session.email });
    const oldPassword=req.body.oldPassword
      if (check) {
    
          const isMatch = await bcrypt.compare(oldPassword, check.password);

          if (isMatch) {
              const pass = await bcrypt.hash(req.body.newPassword, 10);
              const email = req.session.email;
            console.log('=======',pass);
              const update = await Users.updateOne({ email: email }, { $set: { password: pass } });
            console.log("+++++++",update);
              return res.json({
                  success: true,
                  message: "Password changed successfully!"
              });
          } else {
            console.log("else lesleknlselkelkke");
              return res.json({
                  success: false,
                  error: "Invalid Old password",
                  message: "Invalid password. Please check your old password."
              });
          }
      } else {
          return res.json({
              success: false,
              error: "Invalid email",
              message: "Invalid email. User not found."
          });
      }
  } catch (error) {
      console.error("Error:", error);
      return res.json({
          success: false,
          error: "Internal server error",
          message: "An internal server error occurred. Please try again later."
      });
  }
};

  
module.exports={
    changePass,

}