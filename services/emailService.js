const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendReplenishmentEmail = async (drug) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.REPLENISHMENT_EMAIL,
        subject: `Replenishment Needed for Drug ID: ${drug.id}`,
        text: `Drug "${drug.name}" with ID ${drug.id} has fallen below its reorder level. Current QOH: ${drug.qoh}, Reorder Level: ${drug.reorder_level}.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Replenishment email sent successfully');
    } catch (error) {
        console.error('Error sending replenishment email:', error);
    }
};

module.exports = {
    sendReplenishmentEmail
};
