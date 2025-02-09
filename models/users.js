import User from "./userModel.js";
import bcrypt from "bcrypt";
import gravatar from "gravatar";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "../middlewares/sendgrid.js";

const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSaltSync(10);
  const hash = await bcrypt.hashSync(pwd, salt);
  return hash;
};

const validatePassword = (pwd, hash) => bcrypt.compare(pwd, hash);

export const createUser = async (email, password) => {
  try {
    const avatarURL = gravatar.url(email, {
      s: "250",
      r: "pg",
      d: "retro",
    });
    const hashedPassword = await hashPassword(password);
    const verificationToken = nanoid();
    const newUser = new User({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });
    const user = await newUser.save();
    await sendVerificationEmail(email, verificationToken);
    return user;
  } catch (err) {
    console.log(err);
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    return user;
  } catch (error) {
    console.error(error);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error(error);
  }
};

export const passwordValidator = async (password, userPassword) => {
  const isValidPassword = await validatePassword(password, userPassword);
  return isValidPassword;
};

export const updateAvatar = async (email, avatarURL) => {
  User.findOneAndUpdate({ email }, { avatarURL });
};

export const verifyUser = (verificationToken) =>
  User.findOneAndUpdate(
    { verificationToken },
    { verify: true, verificationToken: null }
  );
