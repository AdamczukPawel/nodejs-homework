import { Router } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";

import { userValidation } from "../../validator.js";
import { auth } from "../../middlewares/authentication.js";
import {
  createUser,
  getUserById,
  getUserByEmail,
  passwordValidator,
  updateAvatar,
  verifyUser,
} from "../../models/users.js";
import { config } from "../../config.js";
import {
  UPLOAD_DIR,
  AVATAR_DIR,
  upload,
  shortAvatarURL,
} from "../../middlewares/upload.js";
import { sendVerificationEmail } from "../../middlewares/sendgrid.js";

const router = Router();

router.post("/signup", userValidation, async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Register", { email, password });
  const isEmailTaken = await getUserByEmail(email);

  if (isEmailTaken) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email in use",
      data: "Conflict",
    });
  }
  try {
    const user = await createUser(email, password);
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
        verificationToken: user.verificationToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", userValidation, async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login", { email, password });
  const user = await getUserByEmail(email);
  if (!user)
    return res.status(401).json({ message: "Email or password is wrong" });

  const isValidPassword = await passwordValidator(password, user.password);
  if (!isValidPassword)
    return res.status(401).json({ message: "Email or password is wrong" });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    config.JWT_SECRET
  );
  user.token = token;

  await user.save();
  return res.json({
    status: "success",
    code: 200,
    data: {
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    },
  });
});

router.get("/logout", auth, async (req, res) => {
  try {
    req.user.token = null;
    await req.user.save();
    return res.status(204).end();
  } catch (error) {
    console.error(error);
  }
});

router.get("/current", auth, async (req, res, next) => {
  res.json({
    status: "success",
    code: 200,
    data: {
      email: req.user.email,
      subscription: req.user.subscription,
    },
  });
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const { path: tempName, originalname } = req.file;
    const avatarURL = path.join(AVATAR_DIR, originalname);
    const { email } = req.user;
    Jimp.read(tempName)
      .then((avatar) => {
        return avatar.resize(250, 250).write(AVATAR_DIR);
      })
      .catch((error) => {
        console.log(error);
      });
    try {
      await fs.rename(tempName, avatarURL);
      await updateAvatar(email, shortAvatarURL(avatarURL));
    } catch (error) {
      await fs.unlink(tempName);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json({ avatarURL: shortAvatarURL(avatarURL) });
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    console.log("verificationToken:", verificationToken);
    const verifiedUser = await verifyUser(verificationToken);
    console.log("verifiedUser: ", verifiedUser);
    verifiedUser
      ? res.status(200).json({ message: "Verification successful" })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/verify/", async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else if (user.verify) {
      res.status(400).json({
        message: "Verification has already been passed",
      });
      return;
    }
    await sendVerificationEmail(email, user.verificationToken);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.log(error);
  }
});

export default router;
