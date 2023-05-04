import { Router } from "express";
import jwt from "jsonwebtoken";

import { userValidation } from "../../validator.js";
import { auth } from "../../middlewares.js";
import {
  createUser,
  getUserById,
  getUserByEmail,
  passwordValidator,
} from "../../models/users.js";
import { config } from "../../config.js";

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
  await res.json({
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
    const userId = req.user.id;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.token = null;
    await user.save();
    return res.status(204).end();
  } catch (error) {
    console.error(error);
  }
});

router.get("/current", auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.json({
      status: "success",
      code: 200,
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
  }
});

export default router;
