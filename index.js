var express = require("express");
const cors = require('cors');
var mongoose = require("mongoose");
require("dotenv").config();
var config = require("./config/config");
var userRouter = require("./routes/userRouter");
var paymentRouter = require("./routes/paymentRouter");
const paymentController = require("./dao/paymentController");
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
var restaurantRouter = require("./routes/restaurantRouter");
var uploadRouter = require("./routes/uploadRouter");
var llmRouter = require("./routes/llmRouter");
var tempImgRouter = require("./routes/tempImgRouter");
const http = require('http');
const WebSocket = require('ws');
const wsManager = require('./connections/websocketManager');
require('./connections/redis')
require('./connections/moralis')


var app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server })

// WebSocket connection handler
wss.on('connection', (ws) => {
    wsManager.addClient(ws);
});


// view engine setup
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.static("public"));
// app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

mongoose
    .connect(config.MONGODB_URL, {
        user: config.MONGODB_USER,
        pass: config.MONGODB_PASS
    })
    .catch((err) => console.log(err));



app.use("/api/user", express.json({}), userRouter);
app.use("/api/payment", express.json({}), paymentRouter);
app.use("/api/restaurant", express.json({}), restaurantRouter);
app.use("/api/upload", express.json({}), uploadRouter);
app.use("/api/llm", express.json({}), llmRouter);
app.use("/api/tempImg",express.json({}), tempImgRouter);
// Add test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    let event = request.body;
    // if (!event.data.object.livemode) {
    //     response.send();
    //     return;
    // }
    const endpointSecret = config.STRIPE_WEBHOOK_SECRET;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = request.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return response.sendStatus(400);
        }
    }

    // Handle the event
    switch (event.type) {
        case 'account.updated':
            const account = event.data.object;
            console.log(event);
            // Check if the account has completed onboarding
            if (account.charges_enabled && account.payouts_enabled) {
                paymentController.updateRestaurantOnboarding(account.id);
            }
            break;
        case 'payment_intent.succeeded':
            console.log('Payment intent succeeded');
            // console.log(event);
            paymentController.updateUserOrder({
                paymentId: event.data.object.id,
                paymentStatus: "succeeded",
                status: "PROCESSING"
            });
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment intent failed');
            // console.log(event);
            paymentController.updateUserOrder({
                paymentId: event.data.object.id,
                paymentStatus: "failed",
                status: "FAILED"
            });
            break;
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 

module.exports = app;