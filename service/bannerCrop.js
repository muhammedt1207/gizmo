const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function cropImage(file) {
    console.log("image cropping area");
  sharp(`/public/banner-image/${file}`)
    .resize({
      width: 1500,
      height: 557,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(`/public/banner-image/cropped_images/${file}`, (err) => {
        if (!err) {
          console.log("image cropping....");
        console.log(`Cropping image ${file}`);
      } else {
          console.log("image crop filed");
        throw err;
      }
    });
}

module.exports = cropImage;
