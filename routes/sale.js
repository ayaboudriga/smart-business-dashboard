const express = require("express");
const Sale = require("../models/saleSchema");
const Product = require("../models/productSchema");

const router = express.Router();

// ================================
// Get all sales
// ================================

router.get("/sales", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(sales);

  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});


// ================================
// Add Sale
// ================================

router.post("/sales", async (req, res) => {
  try {
    const {
      product,
      quantity,
      customer,
    } = req.body;

    // Convert quantity to Number
    const saleQuantity = Number(quantity);

    // ================================
    // Validate required fields
    // ================================

    if (!product || quantity === undefined) {
      return res.status(400).json({
        message: "Product and quantity are required.",
      });
    }

    // Quantity must be greater than 0
    if (!Number.isFinite(saleQuantity) || saleQuantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0.",
      });
    }

    // ================================
    // Find product
    // ================================

    const selectedProduct = await Product.findById(product);

    if (!selectedProduct) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // ================================
    // Check stock
    // ================================

    if (selectedProduct.quantity < saleQuantity) {
      return res.status(400).json({
        message: `Not enough stock. Available stock: ${selectedProduct.quantity}`,
      });
    }

    // ================================
    // Calculate total price
    // ================================

    const totalPrice =
      selectedProduct.price * saleQuantity;

    // ================================
    // Create sale
    // ================================

    const sale = await Sale.create({
      product: selectedProduct._id,
      quantity: saleQuantity,
      totalPrice,
      customer: customer || "",
    });

    // ================================
    // Decrease product stock
    // ================================

    selectedProduct.quantity -= saleQuantity;

    await selectedProduct.save();

    // ================================
    // Return result
    // ================================

    res.status(201).json({
      message: "Sale created successfully.",
      sale,
      remainingStock: selectedProduct.quantity,
    });

  } catch (error) {
    console.error("Create sale error:", error);

    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});


module.exports = router;