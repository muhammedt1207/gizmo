// offerCron.js
const cron = require("node-cron");
const Category = require("../models/category"); // Adjust the path accordingly
const Product = require("../models/model"); // Adjust the path accordingly
const Offer = require("../models/CategoryOfferSchema"); // Adjust the path accordingly

const checkOffer = async () => {
  try {
    const currentDate = new Date();
    const offers = await Offer.find({ expireDate: { $lt: currentDate } });
console.log('.');
    if (offers.length > 0) {
      for (const off of offers) {
        const category = await Category.findOne({ CategoryName: off.categoryName });

        const categoryName = category.CategoryName;
        const productsToUpdate = await Product.find({ Category: categoryName });
        console.log("offer checking....");
        productsToUpdate.forEach(async (product) => {
          const originalPrice = product.DiscountAmount;
          const discountedPrice = (discountedPrice * 100) / (100 - off.percentage)

          // Update the product price in the database
          await Product.findByIdAndUpdate(product._id, { DiscountAmount: discountedPrice });
        });

        // Remove the expired offer
        await Offer.findByIdAndRemove(off._id);
      }
    }
  } catch (error) {
    console.error("Error in the cron job:", error);
  }
};

cron.schedule("*/10 * * * * *", async () => {
  try {
    await checkOffer();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

module.exports = checkOffer;
