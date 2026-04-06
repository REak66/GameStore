const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/shopping_db";

// Google Drive download link
const DOWNLOAD_LINK =
  "https://drive.google.com/file/d/17cgi9STnkhmKnyWOSiCbjzD-X09VhRYA/view?usp=drive_link";

async function seedProductDownloadLinks() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const result = await Product.updateMany(
      {},
      { $set: { downloadLink: DOWNLOAD_LINK } }
    );

    console.log(
      `Updated ${result.modifiedCount} products with the download link.`
    );
  } catch (err) {
    console.error("Error updating product download links:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seedProductDownloadLinks();
