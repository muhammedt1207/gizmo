const express=require('express')
const admin=express.Router()
const users=require('../models/users')
const adminController=require('../control/adminController')
const multer=require('multer')
const upload = require("../middlewares/multer");
const UserSchema = require("../models/model");
const category=require("../models/category")


admin.get('/',(req,res)=>{
    res.render('admin/login',{title:"admin Login"})
})
admin.post('/log',adminController.loginadmin)
admin.get('/costomers', adminController.userDataSharing);
admin.get('/signout', adminController.signout)


admin.get('/add-products',adminController.toAddProduct)  
const uploadFields = [
    { name: "main", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ];
  admin.post("/addproduct", upload.fields([...uploadFields, { name: 'images', maxCount: 4 }]),adminController.addProduct);
  admin.get('/toproducts',adminController.toproducts)
  admin.get('/products',adminController.productData)
  admin.get('/delete-product/:id',adminController.deleteProduct)
  admin.get('/edit-product/:id',adminController.toEditProduct)
  admin.post('/postEdit-product/:id',adminController.EditProduct)

admin.get('/dashboard',(req,res)=>{
    res.render('./admin/home',{title:"dash board"})
})
admin.get('/products',(req,res)=>{
    res.render('/admin/products',{title:"products"})
})
admin.get('/catogory',adminController.categoryData)
admin.get('/block/:id',adminController.UserStatus)
admin.get('/toAdd-category',adminController.tocategory)
admin.post('/add-category',adminController.addCategory)
admin.get('edit-catogory',(req,res)=>{
    res.redirect('./admin/edit-cotogory')
})
admin.get('/edit-catogory/:id',adminController.editCatagory)
admin.post('/DoneEdit-category/:id',adminController.afterEditCatagory)
admin.get('/delete-catogory/:id',adminController.deleteCatagory)

module.exports=admin;