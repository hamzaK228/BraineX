const nodemailer = require('nodemailer');

const isDemoMode = process.env.MONGODB_URI ? false : true; // Assuming demo mode if no mongo uri, or explicit env

// Configure transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'sendgrid'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (options) => {
    // In Demo Mode or if credentials are missing, just log the email
    if (isDemoMode || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('=================================================');
        console.log('📧 EMAIL SIMULATION (Demo Mode / No Creds)');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('--- Body ---');
        console.log(options.message);
        console.log('=================================================');
        return { success: true, message: 'Email simulated' };
    }

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'MentoraX'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        // Don't throw, just return fail so app doesn't crash
        return { success: false, error: 'Email could not be sent' };
    }
};

module.exports = sendEmail;
