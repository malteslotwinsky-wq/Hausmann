import 'server-only';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.FROM_EMAIL || 'BauLot <onboarding@resend.dev>';

function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY ist nicht konfiguriert');
    }
    return new Resend(apiKey);
}

export async function sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
    const resend = getResend();

    const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'BauLot - Passwort zurücksetzen',
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 48px; height: 48px; background: #3b82f6; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 20px; font-weight: bold;">B</span>
                    </div>
                </div>
                <h2 style="margin: 0 0 16px; font-size: 20px; color: #1a1a1a;">Passwort zurücksetzen</h2>
                <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">
                    Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den Button, um ein neues Passwort zu setzen.
                </p>
                <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                    Passwort zurücksetzen
                </a>
                <p style="color: #999; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">
                    Dieser Link ist 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
                </p>
            </div>
        `,
    });

    if (error) {
        console.error('Email send error:', error);
        throw new Error('E-Mail konnte nicht gesendet werden');
    }
}
