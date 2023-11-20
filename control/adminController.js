const users = require('../models/users');
const Category = require('../models/category');
const { ObjectId } = require('mongodb');
const productUpload = require('../models/model');
const orders = require('../models/orders')
const imgCrop = require('../service/bannerCrop')
const banner = require('../models/banner')
const mongoose = require('mongoose')
const moment = require('moment')
const Returns =require('../models/returnSchema');
const Users = require('../models/users');


// Admin login credentials
const credential = {
    email: 'admin1@gmail.com',
    password: '123',
};

const loginadmin = async (req, res) => {
    const Email = req.body.email;
    const Password = req.body.password;
    if (Email === credential.email && Password === credential.password) {
        console.log('Admin logged');
        req.session.adminlogged = true;
        res.render('./admin/dashboard', { title: 'dashboard', err: false });
    } else {
        console.log('Admin logging failed');
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
    console.log('Signout');
    req.session.adminlogged=false;
    res.redirect('/');
};







//------------------------------------------<<<<<<<<<<<USER MANEGEMENT>>>>>>>>>>>>>>>>>-----------------------------------
const UserStatus = async (req, res) => {
    console.log('This is userstatus');
    const id = req.params.id;
    console.log('Receive request ' + id);

    const user = await users.findOne({ _id: id });

    if (!user) {
        return res.status(404).send('User not found');
    }
    const newStatus = !user.status;
    await users.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );

    console.log(`User ${user.userName} is ${newStatus ? 'unblocked' : 'blocked'}`);
    res.redirect('/admin/costomers');
};

const userDataSharing = async (req, res) => {
    var i=0
    const page = parseInt(req.query.page) || 1;
    const count = await users.find().count()
    const pageSize = 5;
    const totaldata = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
    const data = await users.find().skip(skip).limit(pageSize)
    res.render('./admin/costomers.ejs', { title: 'Costomers', userData: data ,
    Count:totaldata,
    page: page,
    i});
};

const categoryData = async (req, res) => {
    const data = await Category.find();
    console.log("this is catogory data");
    res.render('./admin/catogory', { title: 'category', categoryData: data });
};






//---------------------------------------------------PRODUCT ---------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const toproducts = async (req, res) => {
    try {
        var i=0
        const page = parseInt(req.query.page) || 1;
        const count = await productUpload.find().count();
        const pageSize = 7;
        const totalOrder = Math.ceil(count / pageSize);
        const skip = (page - 1) * pageSize;
        const data = await productUpload.find().skip(skip).limit(pageSize)
        res.render('admin/products', { title: 'category', data,
        productDataCount:totalOrder,
        page: page
    });
    } catch (error) {
        console.log('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const toAddProduct = async (req, res) => {
    let catogory=await Category.find()
    res.render('./admin/add-product', { title: 'Add Products' ,catogory});
};

const productData = async (req, res) => {
    try {
        const data = await productUpload.find();
        res.render('admin/products', { title: 'category', data });
    } catch (error) {
        console.log('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const addProduct = async (req, res) => {
    const productDetails = req.body;
    try {
        const allfiles = req?.files;
        const images = req.files;
        let allImage = [];
        for (let i = 0; i < images.length; i++) {
            allImage[i] = images[i].filename
        }

      


        const uploaded = await productUpload.create({
            ...productDetails,
            images: allImage,
        });

        if (uploaded) {
            console.log('Product added');
            res.redirect('/admin/toproducts');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
    }
};



const toEditProduct = async (req, res) => {
    const id = req.params.id;
    console.log("to edit product");
    const data = await productUpload.findOne({ _id: id });
    console.log(data);
    res.render("admin/edit-product", { data });
}



const EditProduct = async (req, res) => {
    try {
        let id = req.params.id;
        const productDetails = req.body;
        console.log("asss", productDetails);
        console.log(req.files,'>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        const files = req.files;

        console.log("...........",files);
        const ProductData = await productUpload.findById(id);
        if (!ProductData) {
            console.log("ProductData not found");
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
                console.log("product image changing");
            } else {
                updateData.images[i] = ProductData.images[i]
                console.log("product image not changing");; // Use the existing image if not updated
            }
        }

        const uploaded = await productUpload.updateOne({ _id: id }, { $set: updateData });
        console.log("........", uploaded);
        if (uploaded) {
            console.log('Product updated');
            res.redirect('/admin/toproducts');
        } else {
            console.log('Failed to update product');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
    }
};


const deleteProduct = async (req, res) => {
    console.log('This is delete Product');
    const id = req.params.id;
    console.log('Receive request ' + id);

    const data = await productUpload.findOne({ _id: id });

    if (!data) {
        return res.status(404).send('Product not found');
    }
    const newStatus = !data.status;
    await productUpload.updateOne(
        { _id: id },
        { $set: { status: newStatus } }
    );

    console.log(`product ${data.ProductName} is ${newStatus ? 'unBanned' : 'Banned'}`);
    res.redirect('/admin/toproducts');
};





const deleteImage = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log("product id", productId);
        const imageIndex = req.params.index;
        console.log("image index", imageIndex);

        const product = await productUpload.findById(productId);
        console.log("Product", product);
        if (!product) {
            res.status(404).send('Product not found');
            return;
        }
        console.log("..............", product);
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

            console.log('Category added');
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
        console.log('Error occurred while deleting category');
    }
};




const editCatagory = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);

        const catagory = await Category.findOne({ _id: id });
        console.log("this Edit catogory");
        res.render("admin/edit-catogory", { catagory });
    } catch (error) {
        res.render('admin/404')
        console.log("an error occured while editing the catagory");
    }
}


const afterEditCatagory = async (req, res) => {
    try {
        const id = req.params.id;
        const catagory = req.body.CategoryName;
        const uppercaseCategoryName = catagory.toUpperCase();
        console.log(catagory);
        await Category.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    CategoryName: uppercaseCategoryName,
                },
            }
        );
        console.log("Editing is done");
        res.redirect("/admin/catogory");
    } catch (error) {
        console.log("error occured while uploading catagory");

    }
}

//------------------------------------<<<<<<<<<<<<<<<<< ORDER MANEGEMENT   >>>>>>>>>>>>>>>>>>>>>>>-------------------

const toOrders = async (req, res) => {
    var i=0
    const page = parseInt(req.query.page) || 1;
    const count = await orders.find().count()
    const pageSize = 10;
    const totaldata = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
    const data = await orders.find().sort({ OrderDate: -1 }).skip(skip).limit(pageSize)
    
    res.render('./admin/orders', { title: 'Orders', orderData: data ,
    Count:totaldata,
    page: page,
    i})
}

const orderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        //   console.log('mmmmmmmmm',orderId);
        const newStatus = req.body.status;
        //   console.log('>>>>>>>>>>>>>',newStatus);  
        const order = await orders.findByIdAndUpdate(orderId, { Status: newStatus });

        // console.log('...............',order);
        if (order) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log("Updating status error");
        res.render('admin/404')
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}


const orderview = async (req, res) => {
    try {
        const orderId = req.params.id;
        // if (!mongoose.Types.ObjectId.isValid(orderId)) {
        //     // Handle invalid ObjectId here (e.g., return an error response)
        //     return res.status(400).send('Invalid ObjectId');
        // }
        console.log(orderId);
        const orderData = await orders.findOne({ _id: orderId }).populate('Items.productId');
        console.log(">>>>>>>>>>>>>",orderData);
        // const addressId = new mongoose.Types.ObjectId(orderData.Address);
        // console.log("@@@@@@@@@@",orderData.UserID);
        // const userData = await users.findOne({ _id: orderData.UserID });

        // if (!userData) {
        //     console.error('User not found');
        //     return res.render('admin/404');
        // }
        // console.log("^^^^^^",userData);
        // const Address = userData.address.find((address) => address._id.equals(addressId));
        // console.log("************",Address);

        res.render('admin/OrderDetialsView', { orderData })

    } catch (error) {
        console.error("order view getting some errors ",error)
        res.render('admin/404')
    }

}



const Addbanner = async (req, res) => {
    const productDetails = req.body;
    console.log("this add banner", productDetails);
    try {
        const uploadedImage = req.file;
        console.log("hi  >>>>>>>", uploadedImage);

        if (!uploadedImage) {
            console.log('No image uploaded');

        }
        const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/tiff', 'image/avif'];

        if (!supportedFormats.includes(uploadedImage.mimetype)) {
            console.log('Unsupported image format');
            return res.redirect('/banner');
        }
        
        console.log("image start cropping");
        // await imgCrop(uploadedImage)
        console.log("image ccropped");
        const currentDate = new Date(); 
    
        const newBanner = new banner({
            image: uploadedImage.filename,
            date: currentDate,
        });

        const savedBanner = await newBanner.save();
        const latestBanner = await banner.findOne({}, {}, { sort: { date: -1 } });
        if (savedBanner) {
            console.log('Banner added');
            res.render('admin/banner', { latestBanner })
        } else {
            console.log('Error saving the banner');
            res.render('admin/404');
        }
    } catch (error) {
        console.log('An error happened');
        res.render('admin/404')
        throw error;
    }
}


const toReturnPage=async (req,res)=>{
    console.log("return page");
    const returns= await  Returns.find()
    res.render('admin/return',{returns})
}

const verifyReturn= async (req,res)=>{
    try {
        console.log("_________------------_____________");
        const orderId= req.params.id
        const returnOrder= await Returns.findOne({_id:orderId})
        console.log(returnOrder);
        returnOrder.Status="Verified"
        returnOrder.save()
        console.log("return status shanged.....",returnOrder);
        const User = await Users.findByIdAndUpdate(
            { _id: returnOrder.userId },
            { $inc: { wallet: returnOrder.price} },
            { new: true }
          );
          console.log("user wallet updated...........",User);
          if (!returnOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
          }
      
          res.status(200).json({ success: true, message: 'Order status updated successfully', updatedOrder });
    } catch (error) {
        res.render('admin/404')
    }
}


const toCoupens=async (req,res)=>{
    res.render('admin/coupens')
}


const userSearch= async (req, res) => {
  var i = 0;
  const getdata = req.body;
  console.log(getdata);
  let userData = await users.find({
    userName: { $regex: "^" + getdata.search, $options: "i" },
  });

  res.render("./admin/costomers", { title: "Home", userData, i });
}



const productSearch=async (req, res) => {
    var i=0
    const page = parseInt(req.query.page) || 1;
    const count = await productUpload.find().count();
    const pageSize = 7;
    const totalOrder = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
    const getdata = req.body;
    console.log(getdata);
    let data = await productUpload.find({
      ProductName: { $regex: "^" + getdata.search, $options: "i" },
    }).skip(skip).limit(pageSize)
    console.log(`Search Data ${data} `);
    res.render("./admin/products", { title: "Home", data, i, productDataCount:totalOrder,
    page: page });
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
    Addbanner,
    toReturnPage,
    verifyReturn,
    toCoupens,
    userSearch,
    productSearch,
    
};
