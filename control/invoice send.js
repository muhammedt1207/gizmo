
const sendEmail=require("../util/mail");
const bcrypt=require("bcrypt");
const {AUTH_EMAIL}=process.env;
const sendInvoice=async (email)=>{
    
    try{
        if(!(email)){
            throw Error("provide values for email,subject,message")
        
        
        
        //sending email to the user
       
        await sendEmail(mailOptions);

        //save otp record
        
        // const hashedData=await bcrypt.hash(generatedOTP,10);
        // console.log('hashed data'+hashedData);
        function addMinutesToDate(date, minutes) {
            return new Date(date.getTime() + minutes * 60000); // 60000 milliseconds in a minute
          }
        const currentDate =new Date();
        const newDate = addMinutesToDate(currentDate, 10);
        const newOTP= await new OTP({
            email,
            otp:generatedOTP,
            createdAt:Date.now(),
            expireAt:newDate,
        })
        const createdOTPrecord=await newOTP.save()
        return createdOTPrecord
    }
    }catch(err){
        throw err;
    }
}

module.exports=sendInvoice;