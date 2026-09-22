const express = require('express');
const path = require('path');
const https = require('https');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;8898828564:AAE5KYSdDZvo0fg2gmHVC3SPmF1LCoDfH3s
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;8575428267

// Sirf safe/non-sensitive fields Telegram par jayengi
const allowedFields = [
  'applicationId',
  'name',
  'city',
  'purpose',
  'amount',
  'status'
];

app.post('/submit', (req, res) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({
      error: 'Telegram environment variables missing'
    });
  }

  const lines = ['New Application'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      lines.push(`${field}: ${String(req.body[field])}`);
    }
  }

  const telegramData = JSON.stringify({
    chat_id: CHAT_ID,
    text: lines.join('\n')
  });

  const telegramReq = https.request({
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(telegramData)
    }
  }, (telegramRes) => {
    let body = '';

    telegramRes.on('data', (chunk) => {
      body += chunk;
    });

    telegramRes.on('end', () => {
      if (telegramRes.statusCode === 200) {
        return res.json({ success: true });
      }

      console.error('Telegram error:', telegramRes.statusCode, body);

      return res.status(502).json({
        error: `Telegram Error: ${telegramRes.statusCode}`
      });
    });
  });

  telegramReq.on('error', (error) => {
    console.error('Telegram connection error:', error.message);

    return res.status(502).json({
      error: 'Telegram connection failed'
    });
  });

  telegramReq.write(telegramData);
  telegramReq.end();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
