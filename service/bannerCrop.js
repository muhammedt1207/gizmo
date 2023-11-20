const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function cropImage (image) {
  console.log(image,"..");
  try {
    sharp(`./public/banner-image/${image}`).metadata((err, metadata) => {
      if (err) {
        console.log(`Error reading image metadata: ${err}`);
      } else {
        console.log("Image Metadata:", metadata);
      }
    })
    
      .resize({
        width: 1500,
        height: 400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("jpeg") 
      .toFile(`./public/banner-image/cropped_images/${image}`, (err) => {
        if (err) {
          console.log(`an error happened ${err}`);
          throw err;
        } else {
          console.log(`cropping image ${image}`);
        }
      });
  } catch (error) {
    console.log(`an error happened ${error}`);
  }
}
module.exports = cropImage;
