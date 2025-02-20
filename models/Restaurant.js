var mongoose = require("mongoose");

var Restaurant = new mongoose.Schema({
    restaurantId: {
        type: Number,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        trim: true,
        default: ''
    },
    contactNo: {
        type: String,
        required: false,
        match: [/^\+971 (5\d{8}|4\d{7})$/, 'Enter a valid Dubai contact number (e.g., +971 5XXXXXXXX or +971 4XXXXXXX)'],
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    menuSummary: {
        type: String,
        required: false,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        },
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    menuUploaded: {
        type: Boolean,
        default: false
    },
    stripeAccountId: {
        type: String,
        required: false
    },
    paymentsEnabled: {
        type: Boolean,
        default: false
    },
    solanaDepositAddress: {
        type: String,
        required: false
    },
    bscBaseDepositAddress: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", Restaurant);