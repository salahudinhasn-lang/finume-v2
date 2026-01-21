import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.SMTP_HOST) {
        console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
        console.log(`[Mock Email Body]: ${html}`);
        return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Finume" <noreply@finume.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Error sending email", error);
        return { success: false, error };
    }
}
