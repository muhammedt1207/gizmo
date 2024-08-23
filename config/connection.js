const mongoose=require("mongoose");
require("dotenv").config()

console.log(process.env.DB_URI,'mogno db url');

module.exports=
mongoose.connect(process.env.DB_URI)
.then(()=>{
    console.log("DB connected......");
})
.catch(err=>{
    console.log("Error connection to MongoDB:......",err);
})