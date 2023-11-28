const Razorpay = require('razorpay')
require("dotenv").config();



module.exports = {
    createRazorpayOrder:(order)=>{
    return new Promise ((resolve,reject)=>{    
        const razorpay = new Razorpay({
            key_id:  process.env.KEY_ID,
            key_secret:  process.env.KEY_SECRET
          });

    
      
          const razorpayOrder = razorpay.orders.create({
            
              amount: order.amount, 
              currency: 'INR',
              receipt: order.receipt,
          });
          resolve(razorpayOrder) ;
      })
}
};
  