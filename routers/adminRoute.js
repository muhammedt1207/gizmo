const express=require('express')
const admin=express.Router()
const users=require('../models/users')
const adminController=require('../control/adminController')
const multer=require('multer')
const upload = require("../middlewares/multer");
const UserSchema = require("../models/model");
const category=require("../models/category")
const adminAuth=require('../middlewares/AdminAuth')





//login
admin.get('/',adminAuth.adminExist,adminController.toLogin)
admin.post('/log',adminAuth.adminExist,adminController.loginadmin)
admin.get('/costomers',adminController.userDataSharing);
admin.get('/signout',adminAuth.verifyAdmin, adminController.signout)


admin.get('/add-products',adminController.toAddProduct)  

  admin.post("/addproduct", upload.array('images',4),adminController.addProduct);
  admin.get('/toproducts',adminController.toproducts)
  admin.get('/products',adminController.productData)
  admin.get('/delete-product/:id',adminController.deleteProduct)
  admin.get('/edit-product/:id',adminController.toEditProduct)
  admin.post('/postEdit-product/:id',adminController.EditProduct)

admin.get('/dashboard',adminAuth.verifyAdmin,adminController.toDashBoard)
admin.get('/products',adminAuth.verifyAdmin,adminController.toProduct)
admin.get('/catogory',adminAuth.verifyAdmin,adminController.categoryData)
admin.get('/block/:id',adminController.UserStatus)
admin.get('/toAdd-category',adminAuth.verifyAdmin,adminController.tocategory)
admin.post('/add-category',adminAuth.verifyAdmin,adminController.addCategory)
admin.get('edit-catogory',adminAuth.verifyAdmin,adminController.toEditcategory)
admin.get('/edit-catogory/:id',adminAuth.verifyAdmin,adminController.editCatagory)
admin.post('/DoneEdit-category/:id',adminAuth.verifyAdmin,adminController.afterEditCatagory)
admin.get('/delete-catogory/:id',adminAuth.verifyAdmin,adminController.deleteCatagory)

module.exports=admin;

