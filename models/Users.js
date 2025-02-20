var mongoose = require("mongoose");

var User = new mongoose.Schema({
    signUpVia: {
        type: Object,
        required: true,
        via: {
            type: String,
            enum: [
                'GMAIL', 'TELEGRAM'
            ],
            required: true
        },
        handle: {
            type: String,
            required: true
        }
    },
    externalWalletAddress: {
        type: String,
        default: "",
        required: false
    },
    walletProvider: {
        type: String,
        default: "",
        required: false
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    lastUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now()
    },
    addresses: {
        type: Array,
        default: []
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalOrdersValue: {
        type: Number,
        default: 0
    },
    gobblBalance: {
        type: Number,
        default: 0
    }
});

const Users = mongoose.model("Users", User, "Users");

module.exports = Users;
