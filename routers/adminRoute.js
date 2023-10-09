const express=require('express')
const router=express.Router()


router.get('/',(req,res)=>{
    res.render('admin/home',{title:"admin Login"})
})


router.get('/admin/costomers', (req, res) => {
    res.render('admin/costomers',{title:"Costomers"});
  });  
router.get('/products',(res,req)=>{
    re.render('admin/product',{title:"Products"});
  })
router.get('/dashboard',(req,res)=>{
    res.render('./admin/home',{title:"dash board"})
})

module.exports=router;