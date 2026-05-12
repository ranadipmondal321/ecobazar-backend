import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Multer setup — saves to /uploads/avatars ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // e.g. avatar-userId-1234567890.jpg
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
});

// ── POST /api/user/upload-avatar ──
router.post("/upload-avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Build public URL — e.g. http://localhost:5000/uploads/avatars/avatar-xxx.jpg
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    // Delete old avatar file if it was a local upload
    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.includes("/uploads/avatars/")) {
      const oldPath = user.avatar.split("/uploads/avatars/")[1];
      const fullOldPath = `uploads/avatars/${oldPath}`;
      if (fs.existsSync(fullOldPath)) fs.unlinkSync(fullOldPath);
    }

    // Save new avatar URL to user
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl,
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// ── GET /api/user/profile ──
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUT /api/user/profile ──
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, avatar } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing)
        return res.status(400).json({ message: "Email already in use" });
    }

    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, name: fullName || req.user.name, email, phone, avatar },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/user/change-password ──
router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;