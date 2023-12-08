const users = require('../models/users');
const Category = require('../models/category');
const { ObjectId } = require('mongodb');
const productUpload = require('../models/model');
const orders = require('../models/orders')
const imgCrop = require('../service/bannerCrop')
const banner = require('../models/banner')
const mongoose = require('mongoose')
const moment = require('moment')
const Returns = require('../models/returnSchema');
const Users = require('../models/users');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Admin login credentials
const credential = {
    email: 'admin1@gmail.com',
    password: '123',
};

const loginadmin = async (req, res) => {
    const Email = req.body.email;
    const Password = req.body.password;
    if (Email === credential.email && Password === credential.password) {
        req.session.adminlogged = true;
        res.render('./admin/dashboard', { title: 'dashboard', err: false });
    } else {
        res.render('./admin/login', { err: 'Invalid password or email' });
    }
};


const toLogin = (req, res) => {
    res.render('admin/login', { title: "admin Login" })
}

const toEditcategory = (req, res) => {
    res.redirect('./admin/edit-cotogory')
}

const toDashBoard = (req, res) => {
    res.render('./admin/dashboard', { title: "dash board" })
}

const toProduct = (req, res) => {
    res.render('/admin/products', { title: "products" })
}

const signout = async (req, res) => {
    req.session.adminlogged = false;
    res.redirect('/');
};







//------------------------------------------<<<<<<<<<<<USER MANEGEMENT>>>>>>>>>>>>>>>>>-----------------------------------
const UserStatus = async (req, res) => {
    const id = req.params.id;

    const user = await users.findOne({ _id: id });

    if (!user) {
        return res.status(404).send('User not found');
    }
    const newStatus = !user.status;
    await users.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );
    res.redirect('/admin/costomers');
};

const userDataSharing = async (req, res) => {
    var i = 0
    const page = parseInt(req.query.page) || 1;
    const count = await users.find().count()
    const pageSize = 5;
    const totaldata = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
    const data = await users.find().skip(skip).limit(pageSize)
    res.render('./admin/costomers.ejs', {
        title: 'Costomers', userData: data,
        Count: totaldata,
        page: page,
        i
    });
};

const categoryData = async (req, res) => {
    const data = await Category.find();
    res.render('./admin/catogory', { title: 'category', categoryData: data });
};






//---------------------------------------------------PRODUCT ---------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const toproducts = async (req, res) => {
    try {
        var i = 0
        const page = parseInt(req.query.page) || 1;
        const count = await productUpload.find().count();
        const pageSize = 7;
        const totalOrder = Math.ceil(count / pageSize);
        const skip = (page - 1) * pageSize;
        const data = await productUpload.find().skip(skip).limit(pageSize)
        res.render('admin/products', {
            title: 'category', data,
            productDataCount: totalOrder,
            page: page
        });
    } catch (error) {
        console.error('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const toAddProduct = async (req, res) => {
    let catogory = await Category.find()
    res.render('./admin/add-product', { title: 'Add Products', catogory });
};

const productData = async (req, res) => {
    try {
        const data = await productUpload.find();
        res.render('admin/products', { title: 'category', data });
    } catch (error) {
        console.error('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const addProduct = async (req, res) => {
    const productDetails = req.body;
    try {
        const allfiles = req?.files;
        const images = req.files;
        let allImage = [];
        for (const fieldImages of Object.values(images)) {        
            for (const image of fieldImages) {
                allImage.push(image.filename);             
            }
        }



        const uploaded = await productUpload.create({
            ...productDetails,
            images: allImage,
        });

        if (uploaded) {
            res.redirect('/admin/toproducts');
        }
    } catch (error) {
        throw error;
    }
};



const toEditProduct = async (req, res) => {
    const id = req.params.id;

    const data = await productUpload.findOne({ _id: id });
const catogory=await Category.find()
    res.render("admin/edit-product", { data,catogory });
}



const EditProduct = async (req, res) => {
    try {
        let id = req.params.id;
        const productDetails = req.body;
        const files = req.files;

        const ProductData = await productUpload.findById(id);
        if (!ProductData) {
            return res.render('errorView/404admin')
        }

        const updateData = {
            ProductName: req.body.ProductName,
            Description: req.body.Description,
            Specification1: req.body.Specification1,
            Specification2: req.body.Specification2,
            Specification3: req.body.Specification3,
            Specification4: req.body.Specification4,
            Price: req.body.Price,
            DiscountAmount: req.body.DiscountAmount,
            AvailableQuantity: req.body.AvailableQuantity,
            Category: req.body.Category,
            BrandName: req.body.BrandName,
            images: []
        };

        // Handle main image
        if (files && files.main) {
            updateData.images[0] = files.main[0].filename;
        } else {
            updateData.images[0] = ProductData.images[0];
        }

        // Handle additional images (image1, image2, image3)
        for (let i = 1; i <= 3; i++) {
            const imageName = `image${i}`;
            if (files && files[imageName]) {
                updateData.images[i] = files[imageName][0].filename;
       
            } else {
                updateData.images[i] = ProductData.images[i]
        
            }
        }

        const uploaded = await productUpload.updateOne({ _id: id }, { $set: updateData });
      
        if (uploaded) {
      
            res.redirect('/admin/toproducts');
        } else {
           
        }
    } catch (error) {
      
        throw error;
    }
};


const deleteProduct = async (req, res) => {
    
    const id = req.params.id;


    const data = await productUpload.findOne({ _id: id });

    if (!data) {
        return res.status(404).send('Product not found');
    }
    const newStatus = !data.status;
    await productUpload.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );


    res.redirect('/admin/toproducts');
};





const deleteImage = async (req, res) => {
    try {
        
        const productId = req.params.id;

        const imageIndex = req.params.index;
      

        const product = await productUpload.findById(productId);
       
        if (!product) {
            res.status(404).send('Product not found');
            return;
        }
        
        product.images.splice(imageIndex, 1);

        await product.save();

        res.status(200).send('Image deleted successfully');

    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).send('Failed to delete image');
    }
}

//------------------------------------------------CATEGARY----------------------------------------------------------

const tocategory = async (req, res) => {
    res.render('./admin/add-category', { title: 'category', err: false });
};


const addCategory = async (req, res) => {
    try {
        const { CategoryName } = req.body;
        const uppercaseCategoryName = CategoryName.toUpperCase();

        const data = {
            CategoryName: uppercaseCategoryName,
        };

        const check = await Category.find({ CategoryName: uppercaseCategoryName });
        if (check.length === 0) {
            const insert = await Category.create(data);

           
            res.status(201).json({ message: 'Category Added' });
        } else {
            res.status(409).json({ err: 'Category Already Exists' });
        }
    } catch (err) {
        res.status(500).json({ err: 'Internal Server Error' });
        console.error('Error found', err);
    }
};



const deleteCatagory = async (req, res) => {
    try {
        // Delete category by ID
        const id = req.params.id;
        const cetagory = await Category.deleteOne({ _id: id });
        res.redirect('/admin/catogory');
    } catch (error) {
        req.render('admin/404')
     
    }
};




const editCatagory = async (req, res) => {
    try {
        const id = req.params.id;
      

        const catagory = await Category.findOne({ _id: id });
      
        res.render("admin/edit-catogory", { catagory });
    } catch (error) {
        res.render('admin/404')
       
    }
}

const afterEditCatagory = async (req, res) => {
    try {
        const id = req.params.id;
        const catagoryname = req.body.catagoryname;

        const uppercaseCategoryName = catagoryname.toUpperCase();

        const categoryExist=await Category.findOne({ CategoryName: uppercaseCategoryName})
        if(categoryExist>0){
            res.json({success:false,error: "This Category already exist"})
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                $set: {
                    CategoryName: uppercaseCategoryName,
                },
            },
            { new: true } // This ensures that the returned value is the updated document
        );


        res.json({ success: true, updatedCategory });
    } catch (error) {
    
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


//------------------------------------<<<<<<<<<<<<<<<<< ORDER MANEGEMENT   >>>>>>>>>>>>>>>>>>>>>>>-------------------

const toOrders = async (req, res) => {
    var i = 0
    const page = parseInt(req.query.page) || 1;
    const count = await orders.find().count()
    const pageSize = 10;
    const totaldata = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
    const data = await orders.find({
        paymentMethod: { $ne: "online" },
        paymentStatus: { $ne: "pending" },
      })
      .sort({ OrderDate: -1 })
      .skip(skip)
      .limit(pageSize)

    res.render('./admin/orders', {
        title: 'Orders', orderData: data,
        Count: totaldata,
        page: page,
        i
    })
}

const orderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
       
        const newStatus = req.body.status;  
        const order = await orders.findByIdAndUpdate(orderId, { Status: newStatus });
        if (order) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        
        res.render('admin/404')
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}


const orderview = async (req, res) => {
    try {
        const orderId = req.params.id;
     
        const orderData = await orders.findOne({ _id: orderId }).populate('Items.productId');
        res.render('admin/OrderDetialsView', { orderData })

    } catch (error) {
        console.error("order view getting some errors ", error)
        res.render('admin/404')
    }

}



const changeBanner = async (req, res) => {

    try {
        const uploadedImage = req.file;
        const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/tiff', 'image/avif'];

        if (!supportedFormats.includes(uploadedImage.mimetype)) {
            return res.redirect('/banner');
        }
        const imageBuffer = fs.readFileSync(uploadedImage.path);

        const croppedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 750, height: 279, fit: sharp.fit.cover })
            .toBuffer();
   
        const savePath = path.join(__dirname, '../public/banner-image/cropped_images');
        const fileName = uploadedImage.originalname;
    
        fs.writeFileSync(path.join(savePath, fileName), croppedImageBuffer);
        const currentDate = new Date();
        const newBanner = new banner({
            image: fileName,
            date: currentDate,
        });


        const savedBanner = await newBanner.save();
        const latestBanner = await banner.findOne({}, {}, { sort: { date: -1 } });


        if (savedBanner) {
         
            res.render('admin/banner', { latestBanner });
        } else {
       
            res.render('admin/404');
        }
    } catch (error) {
        console.error('An error happened', error);
        res.render('admin/404');
        // Handle the error appropriately, for example, send an error response to the client
    }
};




const toReturnPage = async (req, res) => {

    const returns = await Returns.find().sort({returnedDate:-1})
    res.render('admin/return', { returns })
}

const verifyReturn = async (req, res) => {
    try {
       
        const orderId = req.params.id
        const returnOrder = await Returns.findOne({ _id: orderId })
     
        returnOrder.Status = "Verified"
        returnOrder.save()
 
        const updatedUser = await Users.findByIdAndUpdate(
            { _id: returnOrder.userId },
            {
              $inc: { 'wallet.amount': returnOrder.price },
              $push: {
                'wallet.transactions': {
                  amount: returnOrder.price,
                  transactionType: 'credit', 
                  timestamp: new Date(),
                  description: 'Return order refund', 
                },
              },
            },
            { new: true }
          );

        if (!returnOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, message: 'Order status updated successfully', updatedOrder });
    } catch (error) {
        res.render('admin/404')
    }
}


const returnView = async (req, res) => {
    try {
        const returnId = req.params.id;
     
        const returnData=await Returns.findById(returnId)
        const orderId=returnData.orderId
       
        const orderData = await orders.findOne({ _id: orderId }).populate('Items.productId').sort({returnedDate:-1});
        


        res.render('admin/OrderDetialsView', { orderData,returnData })

    } catch (error) {
        console.error("order view getting some errors ", error)
        res.render('admin/404')
    }

}



const toCoupens = async (req, res) => {
    res.render('admin/coupens')
}


const userSearch = async (req, res) => {
    var i = 0;
    const getdata = req.body;
   
    let userData = await users.find({
        userName: { $regex: "^" + getdata.search, $options: "i" },
    });

    res.render("./admin/costomers", { title: "Home", userData, i });
}



const productSearch = async (req, res) => {
    var i = 0
    const page = parseInt(req.query.page) || 1;
    const count = await productUpload.find().count();
    const pageSize = 7;
    const totalOrder = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
    const getdata = req.body;

    let data = await productUpload.find({
        ProductName: { $regex: "^" + getdata.search, $options: "i" },
    }).skip(skip).limit(pageSize)
   
    res.render("./admin/products", {
        title: "Home", data, i, productDataCount: totalOrder,
        page: page
    });
}
module.exports = {
    loginadmin,
    UserStatus,
    userDataSharing,
    addProduct,
    toAddProduct,
    categoryData,
    addCategory,
    tocategory,
    toproducts,
    productData,
    signout,
    deleteCatagory,
    editCatagory,
    afterEditCatagory,
    deleteProduct,
    toEditProduct,
    EditProduct,
    toLogin,
    toEditcategory,
    toDashBoard,
    toProduct,
    toOrders,
    orderStatus,
    orderview,
    deleteImage,
  
    toReturnPage,
    verifyReturn,
    toCoupens,
    userSearch,
    productSearch,
    changeBanner,
    returnView

};
