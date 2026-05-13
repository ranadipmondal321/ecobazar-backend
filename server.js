import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
dotenv.config();


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:3000",
    https://ecobazar-frontend1.onrender.com
  ],
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist",wishlistRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/uploads", express.static("uploads")); 


app.get('/', (req, res) => {
    res.send('Hello, your backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectDB(); 
    console.log(`Server running at http://localhost:${PORT}`);
});

