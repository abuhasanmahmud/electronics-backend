const nodemailer = require("nodemailer");
const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASS,
    },
  });

  const mailOptions = {
    from: "mongodb.me@gmail.com",
    to: option.email,
    subject: "Reset password",
    text: option.message,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
