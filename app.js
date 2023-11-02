require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const morgan = require('morgan');
const nocache = require('nocache');
const passport = require('./auth/passport');
const flash=require('connect-flash')
const bodyParser = require('body-parser');
const IndiaPincodeSearch = require('india-pincode-search');



const PORT = process.env.PORT || 3000;

app.use(express.json());

app.set('view engine', 'ejs');
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE: Configure express-session before Passport.js
app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended:true}))



// NOCACHE
app.use(nocache());

// MORGAN
app.use(morgan('tiny'));

app.use(flash())
// Routes
const userRouter = require('./routers/userRoute');
app.use('/', userRouter);

const adminRouter = require('./routers/adminRoute');
app.use('/admin', adminRouter);
 
const OTProutes=require("./util/otpindex")
app.use('/otp',OTProutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
