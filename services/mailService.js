const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD
    }
});

const mailSerice = {
    sendEmail({to, subject, text}) {
        const mailOptions = {
            from: process.env.APP_EMAIL,
            to, 
            subject, 
            text
        };
        return transporter.sendMail(mailOptions);
    }
}
module.exports = mailSerice;