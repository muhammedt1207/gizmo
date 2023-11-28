const user=require("../models/users")

const checkBlock= async(req,res,next)=>{
   try{ const check=await user.findOne({email:req.session.email})
    if(check.status==false){
        console.log("user block done cannot access...........");
        req.session.destroy((err)=>{
            res.redirect('/')
        })
    }else{
        next()
    }
}catch{
    res.render("user/404Page")
}

}
module.exports=checkBlock;