import express from "express";
import jwt from "jsonwebtoken";
import Wishlist from "../models/Wishlist.js";

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

// GET /api/wishlist  — fetch user's wishlist
router.get("/", auth, async (req, res) => {
  try {
    const wl = await Wishlist.findOne({ userId: req.userId });
    res.json(wl ? wl.items : []);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/wishlist/sync  — save full wishlist array (replaces existing)
router.post("/sync", auth, async (req, res) => {
  try {
    const { items } = req.body;
    const wl = await Wishlist.findOneAndUpdate(
      { userId: req.userId },
      { items },
      { upsert: true, new: true }
    );
    res.json(wl.items);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;