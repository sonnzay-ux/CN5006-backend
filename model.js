const mongoose = require("mongoose");

const fashionSchema = new mongoose.Schema({
  "Product Category": String,
  "Product Name": String,
  "Units Sold": Number,
  "Returns": Number,
  "Revenue": Number,
  "Customer Rating": Number,
  "Stock Level": Number,
  "Season": String,
  "Trend Score": Number
});


const Fashion = mongoose.model("Fashion", fashionSchema);

module.exports = Fashion;
