// src/config/nodemailer.js
import nodemailer from "nodemailer";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "./emailTemplates.js";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendMail({ to, subject, text, html }) {
  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  });
  return info;
}

export async function sendResetPasswordEmail({
  to,
  resetLink,
  expiresMinutes = 60,
}) {
  const subject = "Reset your password";
  const html = `
    <div style="font-family:sans-serif">
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in ${expiresMinutes} minutes.</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
    </div>`;
  return sendMail({ to, subject, html, text: `Reset link: ${resetLink}` });
}

// แทนค่า {{key}} ใน template ด้วยค่าจริงจาก vars
function fillTemplate(tpl, vars) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)),
    tpl
  );
}

// ใช้ได้ทั้ง Verify และ Reset OTP โดยส่ง purpose
export async function sendOtpEmail({
  to,
  otp,
  email = "",
  purpose = "Account Verification",
  minutes = 15,
}) {
  const subject = purpose;

  // ✅ เพิ่ม minutes เข้าไปในตัวแปรที่จะส่งเข้า template
  const baseVars = { email, otp, minutes };

  let html;
  if (purpose === "Password Reset OTP") {
    html = fillTemplate(PASSWORD_RESET_TEMPLATE, baseVars);
  } else {
    html = fillTemplate(EMAIL_VERIFY_TEMPLATE, baseVars);
  }

  const text = `Your OTP is ${otp}. It is valid for ${minutes} minutes.`;
  return sendMail({ to, subject, text, html });
}
