const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

const token = process.env.TOKEN;
const port = process.env.PORT || 3000;
const app = express();



app.use(express.json());

const bot = new TelegramBot(token,{polling: true});
//bot.setWebHook(`${url}/bot${token}`);

const qaDatabase = new Map([
  [/^(hello|hi|hey)$/i, "Hello there! 👋 How are you doing?"],
  [/^good (morning|night|evening)$/i, "Good day to you too! 🌸"],
  [/^(your name|who are you)$/i, "I am a friendly Telegram bot 🤖"],
  [/^how are you$/i, "I'm just code, but I feel awesome when you talk to me 😎"],
  [/^(thank(s| you))$/i, "You're most welcome! 🙏"],
  [/^(bye|goodbye)$/i, "Goodbye! Take care 👋"],
  [/^what (is|are) your features?$/i, "I can answer your questions and show your user info!"],
  [/^help$/i, "Just ask me anything or say 'info' to see your details!"],
]);

function findAnswer(text) {
    for (const [pattern, response] of qaDatabase) {
        if (pattern.test(text)) {
            return response;
        }
    }
    return null;
}

function getUserInfo(msg) {
    const user = msg.from;
    const chat = msg.chat;
    const currentDate = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        dateStyle: 'full',
        timeStyle: 'long'
    });
    
    return `📊 User Information:

🆔 User ID: ${user.id}
👤 Name: ${user.first_name || 'N/A'} ${user.last_name || ''}
🔖 Username: @${user.username || 'No username'}
🌐 Language: ${user.language_code || 'Unknown'}
💬 Chat ID: ${chat.id}
📅 Current Date: ${currentDate}
🤖 Is Bot: ${user.is_bot ? 'Yes' : 'No'}`;
}

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  
console.log(meg)

  const chatId = msg.chat.id;
    const name = msg.from.first_name || "User";
    bot.sendMessage(chatId, `👋 Welcome ${name}!\n\nAsk me questions or type 'info' to see your details.`);
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage || userMessage.startsWith('/')) {
        return;
    }

    const answer = findAnswer(userMessage);
    
    if (answer) {
        return bot.sendMessage(chatId, answer);
    }

    const userInfo = getUserInfo(msg);
    bot.sendMessage(chatId, userInfo);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
