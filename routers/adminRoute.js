const express=require('express')
const admin=express.Router()
const users=require('../models/users')
const adminController=require('../control/adminController')
const multer=require('multer')
const upload = require("../middlewares/multer");
const Products = require("../models/model");
const category=require("../models/category")
const adminAuth=require('../middlewares/AdminAuth')
const banermulter=require('../middlewares/bannerMulter')
const banner =require('../models/banner')
const couponControll=require('../control/coupon')
const DashController=require("../control/dashBoard")
const OfferController=require('../control/offer')

const uploadFields = [
  { name: "main", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount:1},
];
//login
admin.get('/',adminAuth.adminExist,adminController.toLogin)
admin.post('/log',adminController.loginadmin)
admin.get('/costomers',adminController.userDataSharing);
admin.get('/signout',adminAuth.verifyAdmin, adminController.signout)
admin.get('/dashboard',adminAuth.verifyAdmin,adminController.toDashBoard)
admin.get('/block/:id',adminController.UserStatus)
admin.post("/userSearch",adminController.userSearch);

// product
admin.get('/add-products',adminController.toAddProduct)  
  admin.post("/addproduct", upload.fields(uploadFields),adminController.addProduct);
  admin.get('/toproducts',adminController.toproducts)
  admin.get('/products',adminController.productData)
  admin.get('/delete-product/:id',adminController.deleteProduct)
  admin.get('/edit-product/:id',adminController.toEditProduct)
  admin.post('/postEdit-product/:id',upload.fields(uploadFields),adminController.EditProduct)
  admin.delete('/delete-image/:id/:index', adminAuth.verifyAdmin, adminController.deleteImage);
admin.get('/products',adminAuth.verifyAdmin,adminController.toProduct)
admin.post("/search",adminAuth.verifyAdmin,adminController.productSearch);

//category
admin.get('/catogory',adminAuth.verifyAdmin,adminController.categoryData)
admin.get('/toAdd-category',adminAuth.verifyAdmin,adminController.tocategory)
admin.post('/add-category',adminAuth.verifyAdmin,adminController.addCategory)
admin.get('edit-catogory',adminAuth.verifyAdmin,adminController.toEditcategory)
admin.get('/edit-catogory/:id',adminAuth.verifyAdmin,adminController.editCatagory)
admin.post('/DoneEdit-category/:id',adminAuth.verifyAdmin,adminController.afterEditCatagory)
admin.get('/delete-catogory/:id',adminAuth.verifyAdmin,adminController.deleteCatagory)


//banner
admin.post('/bannerUpload', banermulter.single('image'), adminController.changeBanner);
admin.get('/banner', async(req,res)=>{
  const latestBanner = await banner.findOne({}, {}, { sort: { date: -1 } });
  res.render('admin/banner',{latestBanner})
})

//orders
admin.get('/orders',adminAuth.verifyAdmin,adminController.toOrders)
admin.put('/updateStatus/:orderId',adminAuth.verifyAdmin,adminController.orderStatus)
admin.get('/orderView/:id',adminAuth.verifyAdmin,adminController.orderview)
admin.get('/ReturnPage',adminAuth.verifyAdmin,adminController.toReturnPage)
admin.put('/updateReturnStatus/:id',adminAuth.verifyAdmin,adminController.verifyReturn)
admin.get('/returnDetails/:id',adminAuth.verifyAdmin,adminController.returnView)

//coupon
admin.get('/coupens',adminAuth.verifyAdmin,couponControll.tocoupon)
admin.post('/CreateCoupon',adminAuth.verifyAdmin,couponControll.createCoupon)
admin.get('/delete-coupon/:id',couponControll.deleteCoupon)

//dashBoard
admin.get('/count-orders-by-day',adminAuth.verifyAdmin, DashController.salesReport)
admin.get('/count-orders-by-month',adminAuth.verifyAdmin, DashController.salesReport)
admin.get('/count-orders-by-year',adminAuth.verifyAdmin, DashController.salesReport)
admin.get('/latestOrders',adminAuth.verifyAdmin, DashController.getOrdersAndSellers)
admin.post('/download-sales-report',adminAuth.verifyAdmin, DashController.genereatesalesReport)

//offer
admin.get('/category-offers',OfferController.toofferPage)
admin.post('/addOffer',OfferController.addOffer)


module.exports=admin;

