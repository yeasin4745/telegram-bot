const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

const token = process.env.TOKEN;
const ownerId = Number(process.env.OWNER_USER_ID);
const useWebhook = process.env.USE_WEBHOOK === 'true';
const webhookSecret = process.env.WEBHOOK_SECRET || '';
const port = process.env.PORT || 3000;

if (!token || !ownerId) {
  throw new Error('Missing required env vars: TOKEN and OWNER_USER_ID');
}

const bot = new TelegramBot(token, { polling: !useWebhook });

const qaDatabase = new Map([
  [/^(hello|hi|hey)$/i, 'Hello there! 👋 How are you doing?'],
  [/^good (morning|night|evening)$/i, 'Good day to you too! 🌸'],
  [/^(your name|who are you)$/i, 'I am a friendly Telegram bot 🤖'],
  [/^how are you$/i, "I'm just code, but I feel awesome when you talk to me 😎"],
  [/^(thank(s| you))$/i, "You're most welcome! 🙏"],
  [/^(bye|goodbye)$/i, 'Goodbye! Take care 👋'],
  [/^what (is|are) your features\??$/i, 'I can answer your questions and show your user info!'],
  [/^help$/i, "Just ask me anything or type 'info' to see your details!"],
]);

function isOwner(msg) {
  return msg?.from?.id === ownerId;
}

function isValidSecret(headerValue, expectedSecret) {
  if (!headerValue || !expectedSecret) return false;
  const a = Buffer.from(headerValue);
  const b = Buffer.from(expectedSecret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function findAnswer(text) {
  for (const [pattern, response] of qaDatabase) {
    if (pattern.test(text)) return response;
  }
  return null;
}

function getUserInfo(msg) {
  const user = msg.from;
  const chat = msg.chat;
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'full',
    timeStyle: 'long',
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

bot.onText(/^\/start$/, (msg) => {
  if (!isOwner(msg)) return;
  const name = msg.from.first_name || 'User';
  bot.sendMessage(
    msg.chat.id,
    `👋 Welcome ${name}!\n\nAsk me questions or type 'info' to see your details.`
  );
});

bot.onText(/^\/info$/, (msg) => {
  if (!isOwner(msg)) return;
  bot.sendMessage(msg.chat.id, getUserInfo(msg));
});

bot.on('message', (msg) => {
  if (!isOwner(msg)) return;

  const userMessage = msg.text?.trim();
  if (!userMessage || userMessage.startsWith('/')) return;

  if (/^info$/i.test(userMessage)) {
    return bot.sendMessage(msg.chat.id, getUserInfo(msg));
  }

  const answer = findAnswer(userMessage);
  if (answer) {
    return bot.sendMessage(msg.chat.id, answer);
  }

  return bot.sendMessage(msg.chat.id, "Sorry, I didn't understand that. Type 'help' or 'info'.");
});

if (useWebhook) {
  if (!webhookSecret) {
    throw new Error('WEBHOOK_SECRET is required when USE_WEBHOOK=true');
  }

  const app = express();
  app.use(express.json());

  app.post('/telegram-webhook', (req, res) => {
    const incomingSecret = req.get('X-Telegram-Bot-Api-Secret-Token');
    if (!isValidSecret(incomingSecret, webhookSecret)) {
      return res.sendStatus(401);
    }

    bot.processUpdate(req.body);
    return res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log(`Webhook server listening on port ${port}`);
  });
} else {
  bot.on('polling_error', (err) => {
    console.error('Polling error:', err.message);
  });
  console.log('Bot running in polling mode...');
}
