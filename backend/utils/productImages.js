const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");

const BUCKET = "productImages";

function getBucket() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB not connected");
  }
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
}

function isValidFileId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
}

function saveProductImage(buffer, filename, contentType) {
  const bucket = getBucket();
  const id = new ObjectId();
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStreamWithId(id, filename || "product.jpg", {
      contentType: contentType || "image/jpeg",
    });
    stream.on("error", reject);
    stream.on("finish", () => resolve(id.toString()));
    stream.end(buffer);
  });
}

function openProductImageStream(fileId) {
  return getBucket().openDownloadStream(new ObjectId(fileId));
}

module.exports = {
  saveProductImage,
  openProductImageStream,
  isValidFileId,
};
