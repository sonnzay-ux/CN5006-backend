const mongoose = require("mongoose");

const fashionSchema = new mongoose.Schema({
  productCategory: String,
  productName: String,
  unitsSold: Number,
  returns: Number,
  revenue: Number,
  customerRating: Number,
  stockLevel: Number,
  season: String,
  trendScore: Number
});

const Fashion = mongoose.model("Fashion", fashionSchema);

module.exports = Fashion;
