import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  oldPrice:  { type: Number },
  img:       { type: String },
  stock:     { type: String },
  unit:      { type: String },
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items:  [wishlistItemSchema],
}, { timestamps: true });

export default mongoose.model("Wishlist", wishlistSchema);