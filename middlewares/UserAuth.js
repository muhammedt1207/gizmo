const verifyUser = (req, res, next) => {
    if (req.session.logged) {
      next();
    } else {
      res.redirect("/");
      // res.redirect('/logout')
    }  
  };
  
  
  const userExist = (req, res, next) => {
    if (req.session.logged) {
      res.redirect("/user/home");
    } else {
      next();
    }
  };
  
  module.exports = { 
      verifyUser ,
      userExist
  };