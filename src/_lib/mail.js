import nodemailer from 'nodemailer';

export async function sendResetPasswordEmail(email, token, role) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetUrl = `http://${process.env.CLIENT_URL}/reset/${token}?role=${role}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);
}
