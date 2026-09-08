const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});


const sendEmail = async (
    to,
    subject,
    text
) => {

    try {

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to,

            subject,

            text

        });

        console.log(
            "Email sent successfully to:",
            to
        );

    } catch (error) {

        console.error(
            "Email Error:",
            error
        );

        throw error;

    }

};


module.exports = sendEmail;