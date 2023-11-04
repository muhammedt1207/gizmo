// models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    
  },
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
