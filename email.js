const nodemailer = require('nodemailer');

async function createTransporter() {
  // If env credentials are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Otherwise, create a test account on the fly using ethereal.email
  console.log('No SMTP configuration found in .env. Creating a test SMTP account via Ethereal Email...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

async function sendConfirmationEmail(toEmail, name, activationToken) {
  try {
    const transporter = await createTransporter();
    const fromEmail = process.env.SMTP_FROM || '"Mathpixo" <no-reply@mathpixo.com>';
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    let htmlContent = '';
    let subject = '';
    let text = '';
    
    if (activationToken) {
      const activationLink = `${appUrl}/api/auth/activate?token=${activationToken}`;
      subject = 'Activate Your Mathpixo Account! 🧮✨';
      text = `Hello ${name}! Please activate your Mathpixo account by visiting: ${activationLink}`;
      htmlContent = `
        <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #07080c; color: #f3f4f6; padding: 2rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.25);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #6366f1; font-size: 2.25rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mathpixo</h1>
            <p style="color: #8e95a5; font-size: 0.9rem; margin-top: 0.25rem;">Your STEM OCR & LaTeX Companion</p>
          </div>
          
          <div style="background-color: rgba(16, 18, 30, 0.65); padding: 1.5rem; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; margin-top: 0; color: #fff;">Activate Your Account, ${name}!</h2>
            <p style="font-size: 0.95rem; line-height: 1.6; color: #d1d5db;">
              Thank you for creating an account with Mathpixo. To complete your registration and activate your account, please click the button below to verify your email address:
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 2rem;">
            <a href="${activationLink}" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
              Activate My Account
            </a>
          </div>
          
          <p style="font-size: 0.85rem; color: #8e95a5; text-align: center; margin-top: 1rem;">
            If the button above does not work, copy and paste this URL into your browser: <br>
            <a href="${activationLink}" style="color: #6366f1; word-break: break-all;">${activationLink}</a>
          </p>
          
          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin: 2rem 0;">
          
          <div style="text-align: center; font-size: 0.8rem; color: #8e95a5;">
            <p>This is an automated activation email. If you did not sign up for Mathpixo, please ignore this email.</p>
            <p>© 2026 Mathpixo. All rights reserved.</p>
          </div>
        </div>
      `;
    } else {
      subject = 'Welcome to Mathpixo! 🧮✨';
      text = `Welcome to Mathpixo, ${name}! Your account is now active. Visit ${appUrl} to start converting your equations.`;
      htmlContent = `
        <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #07080c; color: #f3f4f6; padding: 2rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.25);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #6366f1; font-size: 2.25rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mathpixo</h1>
            <p style="color: #8e95a5; font-size: 0.9rem; margin-top: 0.25rem;">Your STEM OCR & LaTeX Companion</p>
          </div>
          
          <div style="background-color: rgba(16, 18, 30, 0.65); padding: 1.5rem; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; margin-top: 0; color: #fff;">Welcome to the Mathpixo Family, ${name}!</h2>
            <p style="font-size: 0.95rem; line-height: 1.6; color: #d1d5db;">
              Thank you for creating an account with Mathpixo. Your account is now fully active!
            </p>
            <p style="font-size: 0.95rem; line-height: 1.6; color: #d1d5db;">
              You can now upload multiple pages, organize your documents, use PDF files for mathematical OCR, edit output LaTeX, and save your workspace history securely to the cloud.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 2rem;">
            <a href="${appUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
              Go to Workspace
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin: 2rem 0;">
          
          <div style="text-align: center; font-size: 0.8rem; color: #8e95a5;">
            <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
            <p>© 2026 Mathpixo. All rights reserved.</p>
          </div>
        </div>
      `;
    }
    
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent,
      text: text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    
    // If Ethereal test account was used, print the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`==================================================`);
      console.log(`📬 TEST EMAIL SENT! Preview link:`);
      console.log(previewUrl);
      console.log(`==================================================`);
      return previewUrl;
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
  return null;
}

module.exports = { sendConfirmationEmail };
