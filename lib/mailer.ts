import "server-only";
import nodemailer from "nodemailer";
import { otpEmailSubject, otpEmailText, otpEmailHtml } from "@/lib/email-templates";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, code: string) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: otpEmailSubject(),
    text: otpEmailText(code),
    html: otpEmailHtml(code),
  });
}
