import { join } from "node:path";
import multer from "multer";

export const PUBLIC_DIR = join(process.cwd(), "public");
export const UPLOAD_DIR = join(process.cwd(), "tmp");

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

export const upload = multer({
  storage: storage,
});
