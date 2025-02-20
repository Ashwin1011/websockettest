const paymentController = require("../dao/paymentController");
var express = require("express");
var router = express.Router();
var UserDao = require("../dao/userController.js");
require("dotenv").config();
const config = require("../config/config");
const { URLSearchParams } = require("url");
const { validateHmac, isTimestampValid } = require("../utils/hmacUtils.js");
const crypto = require('crypto');

const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
    try {
        let { lineItems, sellerId, userId, restaurantName, customerDetails, restaurantId, cart } = req.body;

        if (!lineItems || !sellerId || !userId || !restaurantName || !customerDetails || !restaurantId || !cart) {
            throw { message: "Missing required fields" }
        }
        const orderId = crypto.randomBytes(4).toString("hex");
        const amount = lineItems.reduce((acc, item) => acc + item.price_data.unit_amount * item.quantity, 0);
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount: amount,
                currency: 'aed',
                automatic_payment_methods: {
                    enabled: true,
                }
            },
            {
                stripeAccount: sellerId,
            }
        );

        await paymentController.createUserOrder({
            paymentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
            totalAmount: paymentIntent.amount,
            currency: lineItems[0].price_data.currency,
            items: cart,
            restaurantName: restaurantName,
            userId: userId,
            orderId: orderId,
            customerDetails: customerDetails,
            restaurantId: restaurantId
        });
        res.json({
            error: false,
            clientSecret: paymentIntent.client_secret
        });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});

router.post("/create-crypto-order", async (req, res) => {
    try {
        let { lineItems, txHash, sellerId, userId, restaurantName, customerDetails, restaurantId, cart, network } = req.body;

        if (!lineItems || !txHash || !sellerId || !userId || !restaurantName || !customerDetails || !restaurantId || !cart || !network) {
            throw { message: "Missing required fields" }
        }
        const orderId = crypto.randomBytes(4).toString("hex");
        const amount = lineItems.reduce((acc, item) => acc + item.price_data.unit_amount * item.quantity, 0);

        let order = await paymentController.createUserCryptoOrder({
            paymentId: txHash,
            paymentStatus: "requires_payment_method",
            totalAmount: amount,
            currency: 'USD',
            items: cart,
            restaurantName: restaurantName,
            userId: userId,
            orderId: orderId,
            customerDetails: customerDetails,
            restaurantId: restaurantId,
            chainId: network
        });
        res.send(order);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});


router.get("/getSolanaTx", async (req, res, next) => {
    try {
        const params = new URLSearchParams(Object.entries(req.query));
        const queryString = params.toString();
        const receivedHmac = req.header('HMAC');
        const timestamp = req.header('Timestamp');

        if (!isTimestampValid(timestamp)) {
            throw ({ error: true, message: 'Invalid or expired timestamp' });
        }

        if (!validateHmac(receivedHmac, queryString, timestamp)) {
            throw ({ error: true, message: 'Invalid HMAC' });

        }
        const txHash = req.query.txHash;
        const orderId = req.query.orderId;
        const data = await paymentController.checkForSolanaTx(txHash, orderId);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.get("/getRestaurantOnboardingLink", async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId;
        const data = await paymentController.createRestaurantOnboarding(restaurantId);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});

router.post("/incomingWebhook", async (req, res) => {
    try {
        await paymentController.processBSCBaseTx(req.body);
        return res.status(200).json({ received: true });
    }
    catch (error) {
        return res.status(400).json(error);
    }
});

router.get("/getOrderPaymentStatus", async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const data = await paymentController.getOrderPaymentStatus(orderId);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(400).json(error);
    }
});

module.exports = router;