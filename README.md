# Personal Telegram Bot

A lightweight, secure Node.js Telegram bot built with `node-telegram-bot-api` and `express`. It supports regex-based Q&A responses, formatted user/chat diagnostics in the `Asia/Dhaka` timezone, strict owner-only access control, and both **Long Polling** and **Webhook** modes.

## Features

* **Owner-Only Allowlist:** Validates `msg.from.id` against `OWNER_USER_ID` on every command and message, silently ignoring unauthorized users.
* **Dual Transport Support:** Switch cleanly between local Long Polling (`USE_WEBHOOK=false`) and Express Webhooks (`USE_WEBHOOK=true`) without polling/webhook conflicts.
* **Timing-Safe Webhook Verification:** Validates incoming `X-Telegram-Bot-Api-Secret-Token` headers using `crypto.timingSafeEqual` and avoids exposing the bot token in the webhook URL path.
* **Pattern-Based Q&A:** Matches common greetings and help prompts using a `Map` of regular expressions.
* **User & Chat Info (`/info`):** Displays your Telegram User ID, username, language code, Chat ID, and current timestamp in `Asia/Dhaka`.

## Project Structure

```text
telegram-bot/
├── .gitignore
├── index.js
├── package.json
└── .env              # Local environment variables (gitignored)
```

## Prerequisites

* Node.js v18 or higher
* A Telegram Bot Token from [@BotFather](https://t.me/BotFather)
* Your numeric Telegram User ID (obtainable via [@userinfobot](https://t.me/userinfobot))

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
TOKEN=your_bot_token_here
OWNER_USER_ID=your_numeric_telegram_id
USE_WEBHOOK=false
WEBHOOK_SECRET=replace_with_a_random_secret_string
PORT=3000
```

### Environment Variables

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `TOKEN` | Yes | — | Bot token issued by BotFather |
| `OWNER_USER_ID` | Yes | — | Numeric Telegram ID allowed to interact with the bot |
| `USE_WEBHOOK` | No | `false` | Set to `true` for Express webhook mode, `false` for polling |
| `WEBHOOK_SECRET` | When webhook is `true` | — | Secret token sent in `X-Telegram-Bot-Api-Secret-Token` |
| `PORT` | No | `3000` | HTTP port for the Express webhook server |

## Running the Bot

### Polling Mode (Local / Behind NAT)

Ensure `USE_WEBHOOK=false` in `.env`, then run:

```bash
npm start
```

### Webhook Mode (VPS / Cloud / Reverse Proxy)

1. Set `USE_WEBHOOK=true` and provide a strong `WEBHOOK_SECRET` in `.env`.
2. Start the server:

```bash
npm start
```

3. Register your HTTPS webhook URL with Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/telegram-webhook",
    "secret_token": "<WEBHOOK_SECRET>"
  }'
```

## Commands & Usage

| Input | Description |
| :--- | :--- |
| `/start` | Displays the welcome message |
| `/info` or `info` | Returns your Telegram user ID, username, chat ID, and `Asia/Dhaka` time |
| `hello`, `hi`, `hey`, `help` | Responds with matching entries from `qaDatabase` |
