import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "No token, unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ decoded.id matches generateToken(user._id)
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;