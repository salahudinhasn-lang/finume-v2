import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Security: Don't reveal if user exists. Fake success.
            // But for this use case request, maybe returning success is fine.
            // "If the email is registered, you will receive a link."
            return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Hour

        // Save to DB
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // Send Email
        // Detect Base URL from request or env
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
        // Construct Link (Assumes HashRouter for SPA, adjust if using Browser Router without hash)
        // Since project uses HashRouter (verified in App.tsx), we need /#/
        const resetUrl = `${baseUrl}/#/reset-password?token=${resetToken}`;

        const emailResult = await sendEmail({
            to: email,
            subject: 'Reset your Finume Password',
            html: `
                <h1>Password Reset</h1>
                <p>You requested to reset your password.</p>
                <p>Click the link below to reset it:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        });

        return NextResponse.json({
            message: 'Reset link sent',
            mock: (emailResult as any)?.mock,
            resetLink: (emailResult as any)?.mock ? resetUrl : undefined
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
