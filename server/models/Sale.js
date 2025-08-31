import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "transfer", "pos", "other"],
    default: "cash",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Sale", saleSchema);
