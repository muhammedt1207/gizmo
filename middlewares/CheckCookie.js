const jwt = require('jsonwebtoken')
require('dotenv').config()


  const  verifyUser= async (req, res, next) => {
       try{ const token = req.cookies.userJwt 
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    res.redirect("/user/indexToLogin")
                }
                req.session.user = user;
                next()
            })
        }else{
            req.session.user = false
            res.redirect("/user/indexToLogin")
        }
      }catch(error){
        console.error(error)
      }
    }
    
  const  userExist= (req, res, next) => {
      try{  const token = req.cookies.userJwt;
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    next();
                }
                else {
                    res.redirect('/user/home')
                }
            })
        }
        else {
            next();
        }
      }catch(error){
        console.error(error);
      }
    }
    module.exports={
      userExist,
      verifyUser
    }