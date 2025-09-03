const nodemailer = require("nodemailer");

// configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "freefiregamingop283@gmail.com",       // 🔹 replace with your Gmail
    pass: "nyik cnhj wiwd ximc",         // 🔹 use Gmail App Password (not normal password)
  },
});

// function to send OTP email
async function sendOtpEmail(to, otp) {
  try {
    await transporter.sendMail({
      from: "yourgmail@gmail.com",
      to,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });
    console.log(`✅ OTP sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

module.exports = sendOtpEmail;
