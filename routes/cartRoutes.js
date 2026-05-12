import express from "express";
import jwt from "jsonwebtoken";
import Cart from "../models/Cart.js";

const router = express.Router();

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ecobazar_secret");
    req.userId = decoded.id || decoded._id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET /api/cart  — fetch user's cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    res.json(cart ? cart.items : []);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cart/sync  — save full cart array (replaces existing)
router.post("/sync", auth, async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.userId },
      { items },
      { upsert: true, new: true }
    );
    res.json(cart.items);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cart  — clear cart
router.delete("/", auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.userId }, { items: [] });
    res.json({ message: "Cart cleared" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;