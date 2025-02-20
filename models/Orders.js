var mongoose = require("mongoose");

var Order = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
  },
  estimatedDeliveryTime: {
    type: Number,
    default: 0,
  },
  restaurantId: {
    type: Number
  },
  orderId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["PROCESSING", "COOKING", "OUT_FOR_DELIVERY", "COMPLETED"],
    default: "PROCESSING",
  },
  items: {
    type: Array,
    default: {},
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    enum: ["AED", "USD"],
    default: "AED",
  },
  paymentStatus: {
    type: String,
    enum: ["succeeded", "failed", "requires_payment_method"],
    default: "requires_payment_method",
  },
  paymentMethod: {
    type: String,
    enum: ["CRYPTO", "FIAT"],
    default: "FIAT",
  },
  paymentId: {
    type: String,
    default: "",
  },
  restaurantName: {
    type: String,
    default: "",
  },
  customerDetails: {
    type: Object,
    default: {},
  }
});

module.exports = mongoose.model("Order", Order);
