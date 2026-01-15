/**
 * Modern Password Reset Email Template
 * Branded design with 6-digit verification code
 */

interface PasswordResetEmailParams {
  userEmail: string;
  resetCode: string;
  expiryMinutes: number;
}

export function generatePasswordResetEmail({
  userEmail,
  resetCode,
  expiryMinutes,
}: PasswordResetEmailParams): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwort zurücksetzen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🔐 Passwort zurücksetzen
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                DeinShop - Sicherer Zugang
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hallo,
              </p>
              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Wir haben eine Anfrage erhalten, Ihr Passwort zurückzusetzen. Verwenden Sie den folgenden Code, um fortzufahren:
              </p>

              <!-- Verification Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                <tr>
                  <td align="center" style="padding: 30px; background-color: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Ihr Bestätigungscode
                    </p>
                    <p style="margin: 0; color: #6366f1; font-size: 42px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${resetCode}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Geben Sie diesen Code in der App ein, um Ihr Passwort zurückzusetzen.
              </p>

              <!-- Warning Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Wichtig:</strong> Dieser Code ist nur <strong>${expiryMinutes} Minuten</strong> gültig und kann nur einmal verwendet werden.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                Diese E-Mail wurde an <strong>${userEmail}</strong> gesendet
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.6;">
                © ${new Date().getFullYear()} DeinShop. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Passwort zurücksetzen - DeinShop

Hallo,

Wir haben eine Anfrage erhalten, Ihr Passwort zurückzusetzen.

Ihr Bestätigungscode: ${resetCode}

Geben Sie diesen Code in der App ein, um Ihr Passwort zurückzusetzen.

WICHTIG: Dieser Code ist nur ${expiryMinutes} Minuten gültig und kann nur einmal verwendet werden.

Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.

Diese E-Mail wurde an ${userEmail} gesendet.

© ${new Date().getFullYear()} DeinShop. Alle Rechte vorbehalten.
  `;

  return { html, text };
}
