const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;
const returnSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  Status:{type:String,
    default:"NotVerified"
    },
  product: {
    type: ObjectId,
  },
  quantity:{type:Number},
  reason: {
    type: String,
  },
  price: {
    type: Number,
  },
  returnedDate: {
    type: Date,
  },
  orderDate: {
    type: Date,
  },
});

const Returns = mongoose.model('returns', returnSchema);

module.exports= Returns;

