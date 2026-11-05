/**
 * emailService.js
 * Servicio transaccional de correo electrónico para CicloMetrics Web utilizando Resend.
 * Soporta recuperación de contraseñas mediante tokens OTP con fallback seguro Zero-Crash para entornos locales y tests.
 */

const { Resend } = require('resend');

/**
 * Genera el cuerpo HTML responsive para el correo de restablecimiento de contraseña.
 *
 * @param {string} code - Código OTP de 6 dígitos
 * @param {number} expiresMinutes - Minutos antes de expirar
 * @returns {string} Plantilla HTML
 */
function buildPasswordResetEmailTemplate(code, expiresMinutes = 15) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña - CicloMetrics</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0b0f19;
      padding: 30px 10px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    }
    .header {
      padding: 32px 32px 24px 32px;
      text-align: center;
      border-bottom: 1px solid #334155;
      background-color: #0f172a;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 6px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .content {
      padding: 32px;
      text-align: center;
    }
    .headline {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .description {
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 28px;
    }
    .otp-box {
      background: rgba(15, 23, 42, 0.85);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 20px 24px;
      display: inline-block;
      margin-bottom: 24px;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #34d399;
      text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
      padding-left: 10px;
    }
    .badge-expiry {
      display: inline-block;
      background-color: rgba(6, 182, 212, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 28px;
    }
    .security-notice {
      background-color: rgba(30, 41, 59, 0.6);
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 6px;
      text-align: left;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin-top: 10px;
    }
    .footer {
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
      background-color: #0b0f19;
    }
  </style>
</head>
<body>
  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <h1 class="brand-title">CicloMetrics</h1>
            <p class="brand-subtitle">Planificación Inteligente de Rutas</p>
          </div>
          <div class="content">
            <h2 class="headline">Restablecimiento de Contraseña</h2>
            <p class="description">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en CicloMetrics. Usa el siguiente código de verificación de un solo uso para completar el proceso:
            </p>
            <div class="otp-box">
              <span class="otp-code">${code}</span>
            </div>
            <div>
              <span class="badge-expiry">&#9200; Válido durante los próximos ${expiresMinutes} minutos</span>
            </div>
            <div class="security-notice">
              <strong>Importante de Seguridad:</strong> Si tú no solicitaste este cambio, puedes ignorar este mensaje de manera segura. Tu contraseña actual no cambiará y nadie podrá acceder a tu cuenta sin este código.
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} CicloMetrics Web. Todos los derechos reservados.</p>
            <p style="margin: 0;">Diseñado para ciclistas que buscan precisión físico-mecánica en cada ruta.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Envía un correo con el código OTP de recuperación de contraseña.
 * Incluye tolerancia Zero-Crash: si no hay API Key o falla el proveedor, realiza fallback a logging local sin interrumpir el flujo.
 *
 * @param {Object} params
 * @param {string} params.to - Correo destinatario
 * @param {string} params.code - Código de 6 dígitos
 * @param {number} [params.expiresMinutes=15] - Minutos de vigencia
 * @returns {Promise<{ success: boolean, messageId?: string, fallback?: boolean }>}
 */
async function sendPasswordResetEmail({ to, code, expiresMinutes = 15 }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'CicloMetrics <onboarding@resend.dev>';

  console.log(`[Auth Mailer] Procesando envío de código ${code} para: ${to} | Remitente: ${fromEmail} | API Key detectada: ${Boolean(apiKey)}`);

  // Fallback para entornos locales o pruebas sin clave de Resend configurada
  if (!apiKey) {
    console.log('[Auth Mailer - Fallback Local] Código para', to, ':', code);
    return {
      success: true,
      fallback: true,
      message: 'Simulado en consola local (sin RESEND_API_KEY)'
    };
  }

  try {
    const resend = new Resend(apiKey);
    const htmlContent = buildPasswordResetEmailTemplate(code, expiresMinutes);

    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `${code} es tu código de recuperación - CicloMetrics`,
      html: htmlContent
    });

    if (result.error) {
      console.error('[Auth Mailer - Error Resend]', result.error.message || result.error);
      return {
        success: false,
        error: result.error
      };
    }

    console.log('[Auth Mailer - Éxito Resend] Correo despachado con ID:', result.data?.id);
    return {
      success: true,
      messageId: result.data ? result.data.id : null
    };
  } catch (error) {
    console.error('[Auth Mailer - Exception]', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendPasswordResetEmail,
  buildPasswordResetEmailTemplate
};
