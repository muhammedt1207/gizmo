const users = require('../models/users');
const Category = require('../models/category');
const { ObjectId } = require('mongodb');
const productUpload = require('../models/model');
const orders = require ('../models/orders')
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
        req.session.adminlogged=true;
        res.render('./admin/dashboard', { title: 'dashboard', err: false });
    } else {
        console.log('Admin logging failed');
        res.render('./admin/login', { err: 'Invalid password or email' });
    }
};


const toLogin=(req,res)=>{
    res.render('admin/login',{title:"admin Login"})
}

const toEditcategory=(req,res)=>{
    res.redirect('./admin/edit-cotogory')
}

const toDashBoard=(req,res)=>{
    res.render('./admin/dashboard',{title:"dash board"})
}

const toProduct=(req,res)=>{
    res.render('/admin/products',{title:"products"})
}

const signout = async (req, res) => {
    console.log('Signout');
    req.session.destroy();
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
    const data = await users.find();
    console.log("this is user data sharing area");
    res.render('./admin/costomers.ejs', { title: 'Costomers', userData: data });
};

const categoryData = async (req, res) => {
    const data = await Category.find();
    console.log("this is catogory data");
    res.render('./admin/catogory', { title: 'category', categoryData: data });
};






//---------------------------------------------------PRODUCT ---------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const toproducts = async (req, res) => {
    try {
        const data = await productUpload.find();
        res.render('admin/products', { title: 'category', data});
    } catch (error) {
        console.log('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const toAddProduct = (req, res) => {
    res.render('./admin/add-product', { title: 'Add Products' });
};

const productData = async (req, res) => {
    try {
        const data = await productUpload.find();
        res.render('admin/products', { title: 'category', data});
    } catch (error) {
        console.log('An error occurred', error);
        res.status(500).send('Internal Server Error');
    }
};

const addProduct = async (req, res) => {
    const productDetails = req.body;
    try {
        const allfiles = req?.files;
        const images=req.files; 
        let allImage=[];
        for(let i=0;i<images.length;i++){
            allImage[i]=images[i].filename
        }

        images.forEach((value,index)=>{
            console.log("images"+index,value);
        })

       

            const uploaded = await productUpload.create({
                ...productDetails,
                images: allImage,
            });

            if (uploaded) {
                console.log('Product added');
                res.redirect('/admin/catogory');
            }
    } catch (error) {
        console.log('An error happened');
        throw error;
    }
};



const toEditProduct= async (req, res) => {
    const id = req.params.id;
    console.log("to edit product");
    const data = await productUpload.findOne({ _id: id });
    console.log(data);
    res.render("admin/edit-product", { data });
  }
  
  
  
  const EditProduct = async (req, res) => {
      try {
          const productDetails = req.body;
          console.log('tt'+req.body);
          console.log(productDetails);
          let id = req.params.id  
          let allImages_filename=[]
          let noImage;
          const allImages = req.files;
          
          
          const uploaded = await productUpload.updateOne({_id:id},{
              $set:{
                  ProductName:req.body.ProductName,
                  Description:req.body.Description,
                  Specification1:req.body.Specification1,
                  Specification2:req.body.Specification2,
                  Specification3:req.body.Specification3,
                  Specification4:req.body.Specification4,
                  Price:req.body.Price,
                  DiscountAmount:req.body.DiscountAmount,
                  AvailableQuantity:req.body.AvailableQuantity,
                  Category:req.body.Category,
                  images: allImages_filename.length > 0 ? allImages_filename : req.body.image,
                  
                }
            });
            
            if (uploaded) {
                console.log('Product updated');
                console.log('update image : ---------------',req.files);
                res.redirect('/admin/products');
            }
    } catch (error) {
        console.log('An error happened');
        throw error;
  }
};


const deleteProduct=async (req,res)=>{
console.log('This is delete Product');
const id = req.params.id;
console.log('Receive request ' + id);

const data = await productUpload .findOne({ _id: id });

if (!data) {
    return res.status(404).send('Product not found');
}
const newStatus = !data.status;
await productUpload.updateOne(
    { _id: id },
    { $set: { status: newStatus } }
);

console.log(`product ${data.ProductName} is ${newStatus ? 'unBanned' : 'Banned'}`);
res.redirect('/admin/products');
};
       

//------------------------------------------------CATEGARY----------------------------------------------------------

const tocategory = async (req, res) => {
    res.render('./admin/add-category', { title: 'category', err:false});
};


const addCategory = async (req, res) => {
    try {
        const { CategoryName } = req.body;
        
        console.log('Name is ' + CategoryName);
        
        const data = {
            CategoryName: CategoryName,
        };
        const check=await Category.find({CategoryName: CategoryName})
        if(check.length==0){
            const insert = await Category.create(data);
            
            console.log('Category added');
        res.redirect('/admin/catogory');
    }else{
        res.render('./admin/add-category',{ err:"Catagory Already Exit"})
        
    }
    } catch (err) {
        res.render('admin/404')
        console.log('Error found', err);
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
      res.render("admin/edit-catogory", { catagory});
    } catch (error) {
        res.render('admin/404')
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

//------------------------------------<<<<<<<<<<<<<<<<< ORDER MANEGEMENT   >>>>>>>>>>>>>>>>>>>>>>>-------------------
    
const toOrders = async (req,res)=>{
    const orderData = await  orders.find()
    res.render('admin/orders',{orderData})

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
  

   const orderview= async (req,res)=>{
    try {
        const orderId=req.params.id;
        // console.log(orderId);
        const orderData= await orders.find({_id:orderId}).populate('Items.productId');
        // console.log(orderData,"*****************************");
    
         res.render('admin/OrderDetialsView',{orderData})
        
      } catch (error) {
        console.error(error)
        res.render('admin/404')
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
    orderview
    
};
