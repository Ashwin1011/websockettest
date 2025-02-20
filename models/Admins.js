var mongoose = require("mongoose");

var Admin = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["SUPERADMIN", "ADMIN"],
        required: true
    },
    restaurantId: {
        type: Number,
        required: true
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
    }
});

const Admins = mongoose.model("Admins", Admin, "Admins");

module.exports = Admins;
