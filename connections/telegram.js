const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()
const conf = require('../config/config')
// Replace with your bot's token
const BOT_TOKEN = process.env.TOKEN
// Replace with the URL of the photo you want to send
const PHOTO_URL = 'https://gobbl-bucket.s3.ap-south-1.amazonaws.com/GobblUpAssets/TelegramTwitter_Graphics_Gobbl.jpg';

// Create a bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.chat.first_name
    // Define the message and keyboard
    const message = `Hey there ${firstName}, This is GOBBL! 👋🏻

👻 Feed taps to earn GOBBL

👯 Got friends? Invite them! Spread the fun and earn your GOBBL together.

That’s all you need to know to get started. ⬇️`
    const options = {
        reply_markup: {
            "inline_keyboard": [[
                {
                    "text": "Play Game",
                    "url": conf.GAME_URL
                },
                {
                    "text": "Join the Community",
                    "url": conf.COMMUNITY_URL
                }
            ]]
        }
    };

    // Send the photo with the caption and inline keyboard
    bot.sendPhoto(chatId, PHOTO_URL, { caption: message, ...options });
});

// Handle callback queries (button clicks)
// bot.on('callback_query', (callbackQuery) => {
//     const message = callbackQuery.message;
//     const chatId = message.chat.id;
//     const data = callbackQuery.data;

//     let responseText;

//     // Respond to the callback data
//     if (data === 'button1') {
//         responseText = 'You clicked Button 1.';
//     } else if (data === 'button2') {
//         responseText = 'You clicked Button 2.';
//     }

//     // Edit the original message text or send a new message
//     bot.sendMessage(chatId, responseText);

//     // Alternatively, you can edit the original message text
//     // bot.editMessageText(responseText, {
//     //   chat_id: chatId,
//     //   message_id: message.message_id
//     // });

//     // Optionally, answer the callback query to remove the "loading" state
//     bot.answerCallbackQuery(callbackQuery.id);
// });
