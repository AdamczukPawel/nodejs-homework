import { join } from "node:path";
import multer from "multer";
import path from "node:path";

export const PUBLIC_DIR = path.join(process.cwd(), "public");
export const UPLOAD_DIR = path.join(process.cwd(), "tmp");
export const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");

export const shortAvatarURL = (avatarURL) =>
  path.relative(PUBLIC_DIR, avatarURL);

export const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const { id } = req.user;
    const date = Date.now();
    const filename = [id, date, file.originalname].join("_");

    callback(null, filename);
  },
  limits: { fileSize: 1_000_000 },
});

export const upload = multer({ storage });
