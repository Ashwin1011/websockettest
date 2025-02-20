
const redis = require('redis');
const config = require('../config/config')
// Create a Redis client
const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    // password: config.redis.password, // Uncomment if needed
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis error: ', err);
});

// Function to close the Redis connection
const closeRedisClient = () => {
    client.quit((err) => {
        if (err) {
            console.error('Error closing Redis connection: ', err);
        } else {
            console.log('Redis connection closed');
        }
    });
};

// Export the Redis client and close function
module.exports = {
    client,
    closeRedisClient,
};
