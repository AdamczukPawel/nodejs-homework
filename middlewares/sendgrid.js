import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const message = (email, verificationToken) => {
  return {
    to: { email },
    from: "paweladamczuk2345@gmail.com",
    subject: "Email verification",
    text: "To verify your e-mail adress, please click link below.",
    html: `<strong>Click this <a href="${`http://localhost:3000/api/users/verify/${verificationToken}`}">link</a> to verify your email address ${email} </strong>`,
  };
};

export const sendVerificationEmail = async (email, verificationToken) => {
  await sgMail
    .send(message(email, verificationToken))
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};
