const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const CategoryOfferSchema = new mongoose.Schema({
    categoryId: {
    type: ObjectId,  
  },
  categoryName:{
    type:String
  },
  percentage:{
    type:Number
  },
  startDate: {
    type: Date, 
  },
  expireDate: {
    type: Date,  
  }, 
  isActive: {
    type: Boolean,
    default: true,
  },
});


CategoryOfferSchema.methods.checkAndUpdateOfferStatus = function () {
  const currentDate = new Date();

  if (currentDate < this.validFrom || currentDate > this.validUntil) {
    this.isActive = false;
  } else {
    this.isActive = true;
  }
};

const CategoryOffer = mongoose.model('CategoryOffer', CategoryOfferSchema);

module.exports = CategoryOffer;
