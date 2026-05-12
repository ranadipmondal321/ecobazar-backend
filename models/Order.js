import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      img: String,
    },
  ],

  totalAmount: Number,

  currency: { type: String, default: "USD" },   
  currencySymbol: { type: String, default: "$" },      

  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
  },

  status: { type: String, default: "Pending" },

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);