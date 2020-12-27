const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main(email, link) {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "mail.nazimleulmi.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'naz@nazimleulmi.com',
        pass: 'baqlawa',
      },
    });

    // send mail with defined transport object
    transporter.sendMail({
      from: '"HAMSA 👻" <naz@nazimleulmi.com>',
      to: email,
      subject: "Account Activision", // Subject line
      html: `
    <p> Click on this link to activate your account : </p>
    <a href="${link}">Activision Link</a>
    <p>
      end-to-end encryption keeps your conversations secure. We can't read your
      messages and no one else can either. Privacy isn’t an optional mode —
      it’s just the way Hamsa was designed.
    </p>
    `, // html body
    });
  } catch (err) { console.log(err) }
}


module.exports = main;

