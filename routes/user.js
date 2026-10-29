
const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/userSchema");

const router = express.Router();


// ========================================
// GET ALL USERS
// ========================================

router.get("/user", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);

  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});


// ========================================
// CREATE USER
// ========================================

router.post("/user", async (req, res) => {
  console.log("Create user:", req.body);

  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});


// ========================================
// UPDATE USER
// ========================================

router.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    console.log("Update user:", id, req.body);

    // Check ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email and role are required",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({
      email: email,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    // Data to update
    const updateData = {
      name,
      email,
      role,
    };

    // Update password only if entered
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});


// ========================================
// DELETE USER
// ========================================

router.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Delete user:", id);

    // Check ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        _id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });

  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
});


module.exports = router;
