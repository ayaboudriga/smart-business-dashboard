const express = require("express");
const Product = require("../models/productSchema");

const router = express.Router();

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});

// Add product
router.post("/products", async (req, res) => {
  try {
    const { name, category, brand, price, quantity, supplier } = req.body;

    if (!name || !category || !brand || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const product = await Product.create({
      name,
      category,
      brand,
      price,
      quantity,
      supplier,
    });

    res.status(201).json({
      message: "Product added successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});
// Update product
router.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product deleted successfully.",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});

module.exports = router;