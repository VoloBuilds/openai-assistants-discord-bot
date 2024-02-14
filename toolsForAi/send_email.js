const nodemailer = require('nodemailer');
require('dotenv').config();

async function send_email({recipient:recipient,subject:subject,content:content}) {
    // Create a transporter using SMTP
    console.log()
    let transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.EMAIL, // your Outlook email address
            pass: process.env.EMAIL_PASSWORD // your Outlook password
        }
    });

    // Setup email data
    let mailOptions = {
        from: 'Astra@asutora.onmicrosoft.com', // sender address
        to: recipient, // list of receivers
        subject: subject, // Subject line
        text: content, // plain text body
        html: content // html body
    };

    try {
        // Send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return {success: true, message: info.messageId};
    } catch (error) {
        console.log('Error occurred: ', error.message);
        return {success: false, error: error.message};
    }
}

// Call the function to send email
send_email({ recipient: "chongdon2000@gmail.com", subject: "Hello, World!", content: "Hello, World!" }).then((res) => {
    console.log("res:", res);
})
module.exports = { send_email }