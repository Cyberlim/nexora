// ─── Dummy Email Service ─────────────────────────────────────────────────────────────
// Replaced with a dummy implementation to bypass Render SMTP restrictions
// ────────────────────────────────────────────────────────────────────────────────

const sendOTP = async (email, otp) => {
  console.log(`[OTP Request] Received request for email address: ${email}. Bypassing real email. Dummy OTP is: ${otp}`);
  // In a real production scenario, you would send the email here.
  // For this deployment, we just print the OTP to the console and pretend it succeeded.
  return true;
};

module.exports = { sendOTP };
