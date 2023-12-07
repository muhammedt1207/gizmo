require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const morgan = require('morgan');
const nocache = require('nocache');
const flash=require('connect-flash')
const bodyParser = require('body-parser');
const cronJob=require('./util/cronJob')
const cookieParser=require('cookie-parser')

const PORT = process.env.PORT || 3100;

app.use(express.json());

app.set('view engine', 'ejs');
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use('/banner-image/cropped_image', express.static(path.join(__dirname, 'public/banner-image/cropped_image')));

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use(cookieParser())

app.use(express.urlencoded({extended:true}))


cronJob()
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
