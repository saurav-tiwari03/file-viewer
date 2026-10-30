// Sends a test email with the SMTP settings from .env and prints the exact error if it fails.
//   npx tsx scripts/test-email.ts you@example.com
import "dotenv/config";
import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.error("Usage: npx tsx scripts/test-email.ts you@example.com");
  process.exit(1);
}

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL } = process.env;
console.log("SMTP settings in use:");
console.log(`  host=${SMTP_HOST} port=${SMTP_PORT} secure=${SMTP_SECURE} user=${SMTP_USER ? SMTP_USER : "(none)"} password=${SMTP_PASSWORD ? "(set)" : "(empty)"}`);
console.log(`  from=${FROM_EMAIL}`);
if (SMTP_PORT === "465" && SMTP_SECURE !== "true") console.log("  ! Port 465 needs SMTP_SECURE=\"true\".");
if (["587", "25", "2525"].includes(SMTP_PORT ?? "") && SMTP_SECURE === "true") console.log("  ! Ports 587/25/2525 need SMTP_SECURE=\"false\" (they upgrade with STARTTLS).");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === "true",
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
});

async function main() {
  try {
    await transporter.verify();
    console.log("OK: connected and authenticated.");
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "FileViewer test email",
      text: "If you can read this, your SMTP settings work.",
    });
    console.log(`OK: accepted by the server for ${info.accepted.join(", ") || "nobody"}${info.rejected.length ? `, rejected: ${info.rejected.join(", ")}` : ""}.`);
    console.log("Check the inbox (and spam) of", to);
  } catch (err) {
    const e = err as Error & { code?: string; responseCode?: number; response?: string };
    console.error(`FAILED: ${e.message}`);
    if (e.code) console.error(`  code: ${e.code}${e.responseCode ? ` (${e.responseCode})` : ""}`);
    if (e.response) console.error(`  server said: ${e.response}`);
    process.exit(1);
  }
}

main();
