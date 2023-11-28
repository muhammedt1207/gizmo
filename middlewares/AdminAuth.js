const verifyAdmin=(req,res,next)=>{
    if(req.session.adminlogged){
        next()
    }else{
        res.redirect('/admin'); 
    }
}


const adminExist=(req,res,next)=>{
    if(req.session.adminlogged){
        res.redirect('/admin')
    }else{
     next()
    }
}


module.exports={
    verifyAdmin,
    adminExist
}
