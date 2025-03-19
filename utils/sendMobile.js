import nodemailer from "nodemailer";
import twilio from "twilio";

export async function sendEmailOtp(email, otp) {
  try {
    if (!process.env.MAIL_USER_ID || !process.env.MAIL_USER_PASS) {
      throw new Error("E-mail credentials are missing.");
    }

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER_ID,
        pass: process.env.MAIL_USER_PASS,
      },
    });
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL,
    //     pass: process.env.PASSWORD,
    //   },
    // });
    const mailOptions = {
      from: process.env.MAIL_USER_ID,
      to: email,
      subject: "Your OTP for Verification",
      html: `
        <p>
          Your OTP for verification is: <strong>${otp}</strong>.
          <br />
          Please enter this OTP on the verification page to complete the process.
          <br />
          <strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>.
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

export async function sendSmsOtp(mobile, otp) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials are missing.");
    }

    const client = twilio(accountSid, authToken);
    const message = `Your OTP for verification is: ${otp}. Please enter this OTP to verify.`;

    const response = await client.messages.create({
      from: twilioPhoneNumber,
      to: mobile,
      body: message,
    });

    console.log(
      `✅ SMS sent successfully to ${mobile} (Message SID: ${response.sid})`
    );
    return true;
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    return false;
  }
}
