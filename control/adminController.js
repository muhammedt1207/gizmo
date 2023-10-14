const users = require('../models/users');
const Category = require('../models/category');
const { ObjectId } = require('mongodb');
const productUpload = require('../models/model');

// Admin login credentials
const credential = {
    email: 'admin@gmail.com',
    password: '123',
};

const loginadmin = async (req, res) => {
    const Email = req.body.email;
    const Password = req.body.password;
    if (Email === credential.email && Password === credential.password) {
        console.log('Admin logged');
        res.render('./admin/dashboard', { title: 'dashboard', err: false });
    } else {
        console.log('Admin logging failed');
        res.render('./admin/login', { err: 'Invalid password or email' });
    }
};

const signout = async (req, res) => {
    console.log('Signout');
    // req.session.destroy();
    res.redirect('/');
};

// Route functions
const toAddProduct = (req, res) => {
    res.render('./admin/add-product', { title: 'Add Products' });
};

const tocategory = async (req, res) => {
    res.render('./admin/add-category', { title: 'category' });
};

const toproducts = async (req, res) => {
    try {
        const data = await productUpload.find();
        res.render('admin/products', { title: 'category', data});
    } catch (error) {
        console.log('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

//------------------------------------user status----------------------------------------------

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
//------------------------------------------------data sharing-----------------------------------
const productData = async (req, res) => {
    try {
        const data = await productUpload.find();
        res.render('admin/products', { title: 'category', data});
    } catch (error) {
        console.log('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const userDataSharing = async (req, res) => {
    const data = await users.find();
    console.log("this is user data sharing area");
    res.render('./admin/costomers.ejs', { title: 'Costomers', userData: data });
};

const categoryData = async (req, res) => {
    const data = await Category.find();
    console.log("this is catogory data");
    res.render('./admin/catogory', { title: 'category', categoryData: data });
};


//---------------------------------------------------add data-----------------------------------
const addCategory = async (req, res) => {
    try {
        const { CategoryName } = req.body;
        console.log('Name is ' + CategoryName);

        const data = {
            CategoryName: CategoryName,
        };

        const insert = await Category.create(data);
        console.log('Category added');
        res.redirect('/admin/catogory');
    } catch (err) {
        console.log('Error found', err);
    }
};

const addProduct = async (req, res) => {
    const productDetails = req.body;
    try {
        const files = req?.files;

        if (files && files.main && files.main[0] && files.image1 && files.image1[0] && files.image2 && files.image2[0] && files.image3 && files.image3[0]) {
            const ret = [
                files.main[0].filename,
                files.image1[0].filename,
                files.image2[0].filename,
                files.image3[0].filename,
            ];

            const uploaded = await productUpload.create({
                ...productDetails,
                images: ret,
            });

            if (uploaded) {
                console.log('Product added');
                res.redirect('/admin/catogory');
            }
        } else {
            console.log('One or more files are missing.');
        }
    } catch (error) {
        console.log('An error happened');
        throw error;
    }
};


//---------------------------------------------------delete and edit----------------------------

const deleteCatagory = async (req, res) => {
    try {
        // Delete category by ID
        const id = req.params.id;
        const cetagory = await Category.deleteOne({ _id: id });
        res.redirect('admin/catogory');
    } catch (error) {
        console.log('Error occurred while deleting category');
    }
};
const editCatagory = async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);

      const catagory = await Category.findOne({ _id: id });
      console.log("this Edit catogory");
      res.render("admin/edit-catogory", { catagory});
    } catch (error) {
      console.log("an error occured while editing the catagory");
    }}
 

    const   afterEditCatagory = async (req, res) => {
        try {
          const id = req.params.id;
          const catagory = req.body.CategoryName;
          console.log(catagory);
          await Category.updateOne(
            { _id: id },
            {
              $set: {
                CategoryName: catagory,
              },
            }
          );
          console.log("Editing is done");
          res.redirect("/admin/catogory");
        } catch (error) {
          console.log("error occured while uploading catagory");
        }
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
    afterEditCatagory

};
