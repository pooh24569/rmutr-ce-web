// backend/src/services/otpService.js
import crypto from "crypto";

export const generateOtp = () => {
  return String(crypto.randomInt(100000, 999999));
};

export const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const verifyOtp = (providedOtp, hashedOtp) => {
  const otpHash = hashOtp(providedOtp);
  const a = Buffer.from(otpHash, "hex");
  const b = Buffer.from(hashedOtp, "hex");

  // ป้องกัน timing attack
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const isOtpExpired = (expiryTimestamp) => {
  return expiryTimestamp < Date.now();
};
