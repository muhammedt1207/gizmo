const Cart=require('../models/cart')
const Users =require('../models/users')

const checkCheckout= async (req,res,next)=>{
    try {
        const userData=await  Users.findOne({email:req.session.email})
       const UserCart=await Cart.findOne({userId:userData._id})
       console.log(UserCart);
       if(!UserCart){
        res.redirect("/user/home");
       }else{
       
        next()
       }
    } catch (error) {
        console.error(error,"--------------------")
        res.render('user/404Page')
    }
}
module.exports=checkCheckout