const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Fashion = require("./model");



const app = express();
app.use(cors()); 
app.use(express.json());

const getField = (body, spacedKey, camelKey) =>
  body[spacedKey] ?? body[camelKey];


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

// TASK 1.9: First 10 products where Units Sold > value for a given season
app.get("/api/products/top/:season/:minUnits", async (req, res) => {
  try {
    const season = req.params.season;
    const minUnits = parseInt(req.params.minUnits);

    const products = await Fashion.find({
      "Season": season,
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


// TASK 1.10: Products where average Customer Rating for a season meets a condition
app.get("/api/products/avg-rating/:season/:minRating", async (req, res) => {
  try {
    const season = req.params.season;
    const minRating = parseFloat(req.params.minRating);

    const result = await Fashion.aggregate([
      { $match: { "Season": season } },
      {
        $group: {
          _id: null,
          avgCustomerRating: { $avg: "$Customer Rating" },
          products: { $push: "$$ROOT" }
        }
      },
      {
        $match: {
          avgCustomerRating: { $gte: minRating }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({ message: "No products meet the condition" });
    }

    res.json({
      season: season,
      averageCustomerRating: result[0].avgCustomerRating,
      products: result[0].products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//1.5 add product
app.post("/addProduct", async (req, res) => {
  try {
    const product = await Fashion.create({
      "Product Category": req.body["Product Category"],
      "Product Name": req.body["Product Name"],   
      "Units Sold": req.body["Units Sold"],
      "Returns": req.body["Returns"],
      "Revenue": req.body["Revenue"],
      "Customer Rating": req.body["Customer Rating"],
      "Stock Level": req.body["Stock Level"],
      "Season": req.body["Season"],
      "Trend Score": req.body["Trend Score"]
    });

    res.json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// TASK 1.6: Update product by product name
app.post("/updateProduct", async (req, res) => {
  try {
    const updated = await Fashion.findOneAndUpdate(
      { "Product Name": req.body["Product Name"] },   
      {
        "Product Category": req.body["Product Category"],
        "Units Sold": req.body["Units Sold"],
        "Returns": req.body["Returns"],
        "Revenue": req.body["Revenue"],
        "Customer Rating": req.body["Customer Rating"],
        "Stock Level": req.body["Stock Level"],
        "Season": req.body["Season"],
        "Trend Score": req.body["Trend Score"]
      },
      { new: true }
    );

    res.json({ message: "Product updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASK 1.7: Delete product by product name
app.post("/deleteProduct", async (req, res) => {
  try {
    const deleted = await Fashion.findOneAndDelete({
      "Product Name": req.body["Product Name"]   
    });

    res.json({ message: "Product deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
