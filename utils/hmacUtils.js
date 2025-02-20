const crypto = require('crypto');
const dotenv = require('dotenv')
dotenv.config()
const apiSecret = process.env.hmacSecret; // This should be securely stored
const timeWindow = 3; // 30 seconds
const EAclientSecret = process.env.EAclientSecret

function createHmac(data, timestamp) {
    return crypto.createHmac('sha256', apiSecret)
        .update(data + timestamp)
        .digest('hex');
}

function createEAHmac(data) {
    return crypto.createHmac('sha256', EAclientSecret)
        .update(data)
        .digest('hex');
}

function validateHmac(receivedHmac, data, timestamp) {
    const computedHmac = createHmac(data, timestamp);
    return receivedHmac === computedHmac;
}

function isTimestampValid(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);
    return Math.abs(now - requestTime) <= timeWindow;
}


module.exports = {
    validateHmac,
    isTimestampValid,
    createEAHmac
}

