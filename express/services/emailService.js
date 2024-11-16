const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendTwoFactorEmail(userEmail, twoFactorCode) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Kétlépcsős azonosítás',
            text: `A kétlépcsős azonosításhoz használja a következő kódot: ${twoFactorCode}`,
        });
    } catch (error) {
        console.error('Hiba az email küldése során!', error);
        return res.status(500).json({ message: 'Sikertelen 2FA kód küldés.' });
    }
}

module.exports = { sendTwoFactorEmail };