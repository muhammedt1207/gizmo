const user=require("../models/users")

const checkBlock= async(req,res,next)=>{
    const check=await user.findOne({email:req.session.email})
    console.log("user block checking"+check);
    if(check.status==false){
        console.log("user block done cannot access...........");
        req.session.destroy((err)=>{
            res.redirect('/')
        })
    }else{
        next()
    }

}
module.exports=checkBlock;