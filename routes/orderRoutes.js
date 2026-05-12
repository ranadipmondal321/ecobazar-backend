import express from "express";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ── Simple auth middleware ──
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token, please login first" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ecobazar_secret");
    req.userId = decoded.id || decoded._id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token, please login again" });
  }
};

// ── POST /api/orders/create ──
router.post("/create", auth, async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    console.log("USER ID:", req.userId);

    const { items, totalAmount, shippingAddress, currency, currencySymbol } = req.body;

    // ✅ Validate
    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in order" });

    if (!totalAmount || totalAmount <= 0)
      return res.status(400).json({ message: "Invalid total amount" });

    if (!shippingAddress?.name || !shippingAddress?.address)
      return res.status(400).json({ message: "Shipping address is required" });

    const order = new Order({
      userId: req.userId,
      items,
      totalAmount,
      currency,        
      currencySymbol,  
      shippingAddress,
      status: "Pending",
    });
    await order.save();

    res.status(201).json({
      message: "Order placed successfully ✅",
      order,
    });

  } catch (err) {
    console.error("ORDER ERROR:", err.message);
    res.status(500).json({ message: "Order failed", error: err.message });
  }
});

// ── GET /api/orders ── get all orders for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/orders/:id ──
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUT /api/orders/:id/cancel ──
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Pending")
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    order.status = "Cancelled";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;