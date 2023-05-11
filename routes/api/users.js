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
} from "../../models/users.js";
import { config } from "../../config.js";
import { UPLOAD_DIR, upload } from "../../middlewares/upload.js";

const avatarStore = path.join(process.cwd(), "tmp");

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
    try {
      const { _id } = req.user;
      const { path: tempName, originalname } = req.file;
      const fileName = path.join(UPLOAD_DIR, originalname);
      await fs.rename(tempName, fileName);
      const img = await Jimp.read(fileName);
      await img.autocrop().cover(250, 250).quality(60).writeAsync(fileName);
      await fs.rename(
        fileName,
        path.join(process.cwd(), "public/avatars", originalname)
      );
      const shortAvatarURL = avatarURL.replace(/\\/g, "/");
      const user = await updateAvatar(_id, shortAvatarURL);
      res.status(200).json(user);
    } catch (error) {
      next(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
