const dotenv = require("dotenv");
dotenv.config();

var config = {};
config.MONGODB_URL = process.env.MONGODB_URL;
config.MONGODB_USER = process.env.MONGODB_USER;
config.MONGODB_PASS = process.env.MONGODB_PASS;

// Gas
config.server = {};
config.server.port = 3000;
config.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
config.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
config.solanaRPC = "https://api.mainnet-beta.solana.com";
config.depositAddress = "DEzqTbCKUKGcXH1R88uAx1gYLD44wHv8SkTcm9m9Xn6Y";

config.nodeRPC = { "0x61": `https://bnb-testnet.g.alchemy.com/v2/lcYH1zqKsBwZXIhlIo6lhw0m5qt-3L8T` }

config.MORALIS = process.env.MORALIS_API_KEY

config.redis = {};
config.redis.host = "localhost";
config.redis.port = 6379;

config.LLM_DATA = {
    "OPENAI": {
        "API_URL": "https://api.openai.com/v1/chat/completions",
        "API_KEY": process.env.OPENAI_KEY,
        "modelName": "gpt-4o"
    },
    "DEEPSEEK": {
        "API_URL": "https://api.deepseek.com/v1/chat/completions",
        "API_KEY": process.env.DEEPSEEK_KEY,
        "modelName": "deepseek-chat"
    },
    "GROQ": {
        "API_URL": "https://api.groq.com/openai/v1/chat/completions",
        "API_KEY": process.env.GROQ_KEY,
        "modelName": "llama-3.3-70b-versatile"
    }
}



module.exports = config;
