import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { config } from "../config.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const strategyOptions = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(strategyOptions, (payload, done) => {
    User.findOne({ _id: payload.id })
      .then((user) =>
        !user ? done(new Error("User not existing")) : done(null, user)
      )
      .catch(done);
  })
);

export const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (error, user) => {
    if (!user || error)
      return res.status(401).json({ message: "Unauthorized" });

    const token = req.get("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decodedToken = jwt.verify(token, config.JWT_SECRET);
      const userId = decodedToken.id;
      const foundUser = await User.findById(userId);
      if (!foundUser || foundUser.token !== token)
        return res.status(401).json({ message: "Unauthorized" });
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};
