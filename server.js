const express = require("express");
const connectDB = require("./db");
const Fashion = require("./model");

const app = express();

app.use(express.json());

// connect MongoDB
connectDB();

// basic test route
app.get("/", (req, res) => {
  res.send("Backend server is running ✅");
});


// TASK 1.8: Get totals by season
app.get("/api/stats/totals/:season", async (req, res) => {
  try {
    const seasonParam = req.params.season;

    const result = await Fashion.aggregate([
      {
        $match: { Season: seasonParam }
      },
      {
        $group: {
          _id: "$Season",
          totalUnitsSold: { $sum: "$Units Sold" },
          totalReturns: { $sum: "$Returns" },
          totalRevenue: { $sum: "$Revenue" }
        }
      }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate totals" });
  }
});


// TASK 1.9: Get first 10 products where Units Sold > X
app.get("/api/products/min-sales/:minUnits", async (req, res) => {
  try {
    const minUnits = parseInt(req.params.minUnits);

    const products = await Fashion.find({
      "Units Sold": { $gt: minUnits }
    }).limit(10);

    res.json({
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch products"
    });
  }
});


// TASK 1.10: Get products where customer rating >= X
app.get("/api/products/top-rating/:minRating", async (req, res) => {
  try {
    const minRating = parseFloat(req.params.minRating);

    const products = await Fashion.find({
      "Customer Rating": { $gte: minRating }
    }).limit(10);

    res.json({
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch products by rating"
    });
  }
});



// TASK 1.5: Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const newProduct = new Fashion(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      data: savedProduct
    });
  } catch (error) {
    res.status(400).json({
      error: "Failed to add product"
    });
  }
});



// TEST READ ROUTE (read 5 records from MongoDB)
app.get("/test-data", async (req, res) => {
  try {
    const data = await Fashion.find().limit(5);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
