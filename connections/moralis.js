const Moralis = require("moralis").default;
const dotenv = require("dotenv");

dotenv.config();

Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
});

module.exports = Moralis;