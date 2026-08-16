import "server-only";

const ORANGE = "#f97316";

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export function otpEmailSubject() {
  return "Your FileViewer sign-in code";
}

export function otpEmailText(code: string) {
  return [
    "Your FileViewer sign-in code",
    "",
    `Use this code to sign in: ${code}`,
    "",
    "It expires in 10 minutes and can only be used once.",
    "",
    "Didn't request this? You can safely ignore this email — your account is secure.",
  ].join("\n");
}

export function otpEmailHtml(code: string) {
  const logoUrl = `${appUrl()}/logo.png`;
  const year = new Date().getFullYear();
  const spacedCode = code.split("").join(" ");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="background:#0a0a0a;padding:32px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle" style="padding-right:8px;">
                            <img src="${logoUrl}" width="28" height="28" alt="FileViewer" style="display:block;" />
                          </td>
                          <td valign="middle" style="font-size:20px;font-weight:700;color:#ffffff;">
                            File<span style="color:${ORANGE};">Viewer</span>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:8px;color:#a1a1aa;font-size:13px;">View any file. Instantly.</div>
                    </td>
                    <td valign="middle" align="right" width="80">
                      <img src="${logoUrl}" width="56" height="56" alt="" style="display:block;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:40px;text-align:center;">
                <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                  <tr>
                    <td style="width:64px;height:64px;border-radius:50%;background:#fff1e6;text-align:center;font-size:26px;line-height:64px;">✉️</td>
                  </tr>
                </table>

                <h1 style="margin:0 0 8px;font-size:22px;color:#111111;">Your FileViewer sign-in code</h1>
                <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
                  Use the code below to sign in. It will expire in 10 minutes.
                </p>

                <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;border:1px dashed ${ORANGE};border-radius:12px;background:#fff7ed;">
                  <tr>
                    <td style="padding:20px 32px;font-size:34px;font-weight:700;letter-spacing:6px;color:${ORANGE};font-family:'Courier New',Courier,monospace;">
                      ${spacedCode}
                    </td>
                  </tr>
                </table>

                <table role="presentation" align="center" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background:${ORANGE};">
                      <a href="${appUrl()}/login" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                        Sign in to FileViewer
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0;" />

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align:left;">
                  <tr>
                    <td width="44" valign="top" style="padding-bottom:16px;">
                      <div style="width:32px;height:32px;border-radius:50%;background:#fff1e6;text-align:center;line-height:32px;font-size:15px;">⏱</div>
                    </td>
                    <td valign="top" style="padding-bottom:16px;">
                      <div style="font-weight:700;font-size:14px;color:#111111;">This code expires in 10 minutes.</div>
                      <div style="font-size:13px;color:#6b7280;">For your security, this code can only be used once.</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="44" valign="top">
                      <div style="width:32px;height:32px;border-radius:50%;background:#fff1e6;text-align:center;line-height:32px;font-size:15px;">🛡️</div>
                    </td>
                    <td valign="top">
                      <div style="font-weight:700;font-size:14px;color:#111111;">Didn't request this?</div>
                      <div style="font-size:13px;color:#6b7280;">You can safely ignore this email. Your account is secure.</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#f4f4f5;padding:24px 40px;text-align:center;font-size:12px;color:#9ca3af;">
                © ${year} FileViewer. All rights reserved.<br />
                Terms of Service &middot; Privacy Policy &middot; Contact Us
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
