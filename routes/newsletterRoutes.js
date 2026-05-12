import express from "express";
import Newsletter from "../models/Newsletter.js";

const router = express.Router();

// ── POST /api/newsletter/subscribe ──
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: "This email is already subscribed! 📧" });
      } else {
        // Re-subscribe if they had unsubscribed
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return res.json({ message: "Welcome back! You've been re-subscribed. 🎉", resubscribed: true });
      }
    }

    await Newsletter.create({ email: email.toLowerCase() });

    res.status(201).json({
      message: "Successfully subscribed! 🎉",
      coupon: "ECO20OFF",
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/newsletter/unsubscribe ──
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({ message: "Email not found in our list." });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ message: "You've been unsubscribed successfully." });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/newsletter/subscribers ── (admin — protect in production)
router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 });
    res.json({
      total: subscribers.length,
      subscribers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;