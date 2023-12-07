const mongoose=require('mongoose')

const {Schema,ObjectId}=mongoose


const WhishlistSChema=new Schema({
    userId: { type: Schema.Types.ObjectId, 
        ref: 'Users', required: true },
        productId: [{ type: Schema.Types.ObjectId,
         ref: 'productUpload'
         }],
})

const Wishlist = mongoose.model('Wishlist', WhishlistSChema);

module.exports= Wishlist;
