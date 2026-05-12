import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, default: 1 },
  img:       { type: String },
  unit:      { type: String },
  stock:     { type: String },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items:  [cartItemSchema],
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);