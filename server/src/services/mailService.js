import "dotenv/config";
import nodemailer from "nodemailer";

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

let transporter = null;

function getTransporter() {
  const { EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;
  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD.replace(/\s+/g, "") },
    });
  }
  return transporter;
}

export async function sendVerificationEmail({ to, name, link }) {
  const mailer = getTransporter();

  // Without Gmail details (for example on a teammate's laptop) the link is printed instead
  if (!mailer) {
    console.log(
      `\nEmail is not configured. Verification link for ${to}:\n${link}\n`,
    );
    return;
  }

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Verify your SkillLearn account",
    text: `Hi ${name},\n\nOpen this link to verify your university email and finish creating your SkillLearn account:\n${link}\n\nThe link works for 24 hours. If you did not sign up, you can ignore this email.`,
    html: `<p>Hi ${escapeHtml(name)},</p><p>Open the link below to verify your university email and finish creating your SkillLearn account.</p><p><a href="${link}">Verify my email</a></p><p>The link works for 24 hours. If you did not sign up, you can ignore this email.</p>`,
  });
}
