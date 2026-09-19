# Loan Telegram App

A simple loan application website that:
- collects user data
- sends OTP
- verifies OTP
- sends final data to Telegram via bot

## Setup

1. Install dependencies:
   npm install

2. Copy environment file:
   cp .env.example .env

3. Replace values:
   TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
   TELEGRAM_CHAT_ID=YOUR_CHAT_ID

4. Run app:
   npm start

5. Open in browser:
   http://localhost:3000

## Telegram Setup

1. Open Telegram
2. Search for @BotFather
3. Run /newbot
4. Save the token
5. Send /start to your bot
6. Open:
   https://api.telegram.org/botYOUR_TOKEN/getUpdates
7. Find chat ID
8. Put both in .env

## Important
For production:
- remove OTP from API response
- use real SMS provider such as Twilio
- keep bot token and chat id in environment variables only
