var mongoose = require("mongoose");

var TransactionSchema = new mongoose.Schema({
    orderId: {
        type: String,
        ref: "Order"
    },
    amount: {
        type: String,
        required: false
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    status: {
        type: String,
        required: true,
        enum: [
            "PENDING",
            "COMPLETED",
            "FAILED"
        ],
        default: "PENDING"
    },
    txHash: {
        type: String,
        required: true,
        unique: true
    },
    chain: {
        type: String,
        required: true,
        enum: [
            "BSC_BASE",
            "SOLANA"
        ],
        default: "BSC_BASE"
    },
    chainId: {
        type: String,
        required: false
    },
    toAddress: {
        type: String,
        required: false
    },
    fromAddress: {
        type: String,
        required: false
    },
    currency: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("Transaction", TransactionSchema);