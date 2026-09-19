const form = document.getElementById("loanForm");
let otpVerified = false;

const mobileInput = document.querySelector('input[name="mobile"]');
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");

function showMessage(msg, isError = false) {
  alert(msg);
  if (isError) console.error(msg);
}

async function sendOTP() {
  const mobile = mobileInput.value.trim();

  if (!mobile) {
    showMessage("Please enter mobile number first");
    return;
  }

  try {
    const response = await fetch("/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mobile })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Failed to send OTP", true);
      return;
    }

    showMessage("OTP sent successfully");
  } catch (error) {
    showMessage("OTP sending failed", true);
  }
}

mobileInput.addEventListener("blur", sendOTP);
resendOtpBtn.addEventListener("click", sendOTP);

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

  try {
    const response = await fetch("/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mobile, otp })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "OTP verification failed", true);
      return;
    }

    otpVerified = true;
    verifyOtpBtn.textContent = "Verified";
    verifyOtpBtn.disabled = true;
    showMessage("OTP verified successfully");
  } catch (error) {
    showMessage("OTP verification failed", true);
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
  } catch (error) {
    showMessage("Submission failed", true);
  }
});
