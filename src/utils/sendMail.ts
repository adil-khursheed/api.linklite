import nodemailer from "nodemailer";
import { _config } from "../config/config";

export const sendMail = async (options: MailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: _config.smtp_host,
      port: Number(_config.smtp_port),
      secure: false, // true for 465, false for other ports
      auth: {
        user: _config.smtp_user,
        pass: _config.smtp_pass,
      },
    });

    const mailOptions = {
      from: _config.smtp_user,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
