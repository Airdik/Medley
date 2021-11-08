const sgMail = require('@sendgrid/mail');
const config = require("./config.json");
sgMail.setApiKey(config.SENDGRID_API_KEY);



exports.sendVerifyEmailMessage = async (to, emailToken) => {
    console.log("Sending email to", to);
    
    let msg = {
        from: 'eshrestha961@gmail.com',
        to: to,
        subject: "MEDLEY - Verify you email",
        text: `
                    Welcome to the Medley family!

                    Please go to the link below to verify your account.
                    localhost:3000/email-verification?token=${emailToken}
                `,
        html: `
                    <h1>Welcome ot the Medley family!</h1>
                    <p>Please go to the link below to verify your account.</p>
                    <a href="http://localhost:3000/email-verification?token=${emailToken}">Verify your account</a>
                `
    }
    // Sending the verification email
    try {
        await sgMail.send(msg);
    } catch (err) {
        console.error("SENDING EMAIL ERR:", err);
    }
}


exports.sendUserAcceptedListing = async (message, fromData, toData, listingData) => {
    let msg = {
        from: 'eshrestha961@gmail.com',
        to:toData.email,
        subject: `MEDLEY - ${fromData.username} replied to your listing!`,
        text: `
                    ${toData.firstName}, ${fromData.username} replied:
                        ${message}
                    to your listing "${listingData.title}"

                    Message them at: ${fromData.email}
                `,
        html: `
                    <h3>${toData.firstName}, ${fromData.username} replied:</h3>
                    <h4>${message}</h4>
                    <h3>to your listing "${listingData.title}"</h3>
                    <h3>Message them at: ${fromData.email}</h3>
                `
    }
    // Sending the verification email
    try {
        await sgMail.send(msg);
    } catch (err) {
        console.error("sendUserAcceptedListing::", err);
    }
}