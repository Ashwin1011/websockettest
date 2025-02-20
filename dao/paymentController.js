const UserModel = require("../models/Users");
const OrderModel = require("../models/Orders");
const RestaurantModel = require("../models/Restaurant");
const TransactionModel = require("../models/Transactions");
const encrypt = require("../utils/encry");
const dotenv = require("dotenv");
dotenv.config();
const { client } = require("../connections/redis");
const RedisKeys = require("../constant/redis");
const redisUtil = require("../utils/redisUtils");
const axios = require("axios");
const WebSocket = require('ws');

async function successMessage(data) {
    let returnData = {};
    returnData["error"] = false;
    returnData["result"] = data;

    return returnData;
}

async function errorMessage(data) {
    let returnData = {};
    returnData["error"] = true;
    returnData["result"] = data;

    return returnData;
}

async function createUserOrder(body) {
    try {
        let userData = await UserModel.findOne({
            "_id": body.userId,
        });
        if (!userData) {
            throw {
                message: "User not found",
            };
        }
        const order = await OrderModel.create({
            user: userData._id,
            items: body.items,
            orderId: body.orderId,
            totalAmount: body.totalAmount,
            currency: body.currency.toUpperCase(),
            paymentStatus: body.paymentStatus,
            paymentId: body.paymentId,
            status: "PROCESSING",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            restaurantName: body.restaurantName,
            customerDetails: body.customerDetails,
            restaurantId: body.restaurantId
        });

        // Emit order created event to all connected clients
        // const wss = require('../index').app.get('wss');
        // wss.clients.forEach((client) => {
        //     if (client.readyState === WebSocket.OPEN) {
        //         client.send(JSON.stringify({
        //             type: 'orderCreated',
        //             order: order
        //         }));
        //     }
        // });

        return await successMessage(true);
    } catch (err) {
        throw await errorMessage(err.message);
    }
}

async function createUserCryptoOrder(body) {
    try {
        let userData = await UserModel.findOne({
            "_id": body.userId,
        });
        if (!userData) {
            throw {
                message: "User not found",
            };
        }
        let order = await OrderModel.create({
            user: userData._id,
            items: body.items,
            orderId: body.orderId,
            totalAmount: body.totalAmount,
            currency: body.currency.toUpperCase(),
            paymentStatus: body.paymentStatus,
            paymentId: body.paymentId,
            paymentMethod: "CRYPTO",
            status: "PROCESSING",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            restaurantName: body.restaurantName,
            customerDetails: body.customerDetails,
            restaurantId: body.restaurantId
        });
        let log = {
            txs: [{
                hash: body.paymentId,

            }],
            chainId: body.chainId
        }

        await processBSCBaseTx(log);

        // Emit order created event to all connected clients
        // const wss = require('../index').app.get('wss');
        // wss.clients.forEach((client) => {
        //     if (client.readyState === WebSocket.OPEN) {
        //         client.send(JSON.stringify({
        //             type: 'orderCreated',
        //             order: order
        //         }));
        //     }
        // });

        return await successMessage(order);
    } catch (err) {
        throw await errorMessage(err.message);
    }
}

async function updateUserOrder(body) {
    try {
        let orderData = await OrderModel.findOneAndUpdate({
            paymentId: body.paymentId
        }, {
            paymentStatus: body.paymentStatus,
            status: body.status,
            updatedAt: Date.now()
        });
        if (body.paymentStatus == "succeeded" && orderData.currency == "AED") {
            let usdValue = Number(((orderData.totalAmount / 100) * 0.27).toFixed(2));
            await UserModel.findOneAndUpdate({
                _id: orderData.user
            }, {
                $inc: {
                    totalOrdersValue: usdValue,
                    totalOrders: 1,
                    gobblBalance: usdValue * 100
                }
            });
        }
        return await successMessage(true);
    } catch (err) {
        throw await errorMessage(err.message);
    }
}


async function createRestaurantOnboarding(restaurantId) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const account = await stripe.accounts.create({
            type: 'standard',
            country: 'AE',
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            type: 'account_onboarding',
            refresh_url: 'http://localhost:3000/reauth',
            return_url: 'http://localhost:3000/return',
        });

        await RestaurantModel.findOneAndUpdate({ restaurantId }, { stripeAccountId: account.id });
        return await successMessage(accountLink);
    } catch (err) {
        throw await errorMessage(err.message);
    }
}

async function updateRestaurantOnboarding(accountId) {
    try {
        await RestaurantModel.findOneAndUpdate({ stripeAccountId: accountId }, { $set: { paymentsEnabled: true } });
        return
    } catch (err) {
        throw await errorMessage(err.message);
    }
}


async function checkForSolanaTx(txHash, orderId) {
    try {
        let data = JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTransaction",
            "params": [
                txHash,
                "json"
            ]
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.mainnet-beta.solana.com',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config);
        const transactionInfo = response.data;
        if (transactionInfo) {
            // Check if the transaction was successful
            if (transactionInfo.result.meta.preTokenBalances[0].mint !== 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') {
                throw { message: "Transaction not found" }
            }

            const receiverAddress = transactionInfo.result.meta.preTokenBalances[1].owner;
            const senderAddress = transactionInfo.result.meta.preTokenBalances[0].owner;

            const isReceiverAddress = await redisUtil.redisSIsMembers(client, RedisKeys.restaurantSolAddress, receiverAddress);
            if (isReceiverAddress == "0") {
                throw { message: "Reciever address not found" }
            }

            const isSenderAddress = await redisUtil.redisSIsMembers(client, RedisKeys.solanaAddress, senderAddress);
            if (isSenderAddress == "0") {
                throw { message: "Sender address not found" }
            }

            const isSuccess = transactionInfo.result.meta.status.Ok === null;
            console.log('Transaction Success:', isSuccess);

            // Identify the token and amount transferred
            const postTokenBalances = transactionInfo.result.meta.postTokenBalances;
            const preTokenBalances = transactionInfo.result.meta.preTokenBalances;
            let amountTransferred = 0;
            postTokenBalances.forEach((postBalance, index) => {
                const preBalance = preTokenBalances.find(
                    (b) => b.accountIndex === postBalance.accountIndex
                );

                if (preBalance) {
                    amountTransferred =
                        BigInt(preBalance.uiTokenAmount.amount) - BigInt(postBalance.uiTokenAmount.amount);
                    console.log(
                        `Token: ${postBalance.mint}, Amount Transferred: ${amountTransferred.toString()}`
                    );
                }
            });

            if (amountTransferred === 0) {
                throw { message: "Transaction not found" }
            }

            let orderData = await OrderModel.findOne({
                orderId: orderId
            });

            if (!orderData) {
                throw { message: "Order not found" }
            }

            await TransactionModel.create({
                orderId: orderId,
                amount: Number(amountTransferred),
                status: "COMPLETED",
                txHash: txHash,
                createdDate: Date.now(),
                chain: "SOLANA"
            });

            await OrderModel.findOneAndUpdate({ orderId }, { $set: { paymentStatus: "succeeded" } });

            return await successMessage(amountTransferred);
        } else {
            throw { message: "Transaction not found" }
        }
    } catch (err) {
        throw await errorMessage(err.message);
    }
}

async function processBSCBaseTx(log) {
    try {
        let txHash = log.txs[0].hash.toLowerCase()
        let chainID = log.chainId
        let txData = await TransactionModel.findOne({ transactionHash: txHash })

        if (txData == null) {
            await TransactionModel.create({
                txHash: txHash,
                status: "PENDING",
                createdDate: Date.now(),
                chain: "BSC_BASE",
                chainId: chainID
            })
        }
        return true
    } catch (err) {
        return true
    }
}

async function getOrderPaymentStatus(orderId) {
    try {
        const order = await OrderModel.findOne({ orderId });
        if (!order) {
            throw { message: "Order not found" }
        }
        return await successMessage(order.paymentStatus);
    } catch (err) {
        throw await errorMessage(err.message);
    }
}
module.exports = {
    createUserOrder,
    updateUserOrder,
    createRestaurantOnboarding,
    updateRestaurantOnboarding,
    createUserCryptoOrder,
    checkForSolanaTx,
    processBSCBaseTx,
    getOrderPaymentStatus
}