const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

// On Vercel (serverless), use memory storage so images are held in req.file.buffer.
// Controllers convert the buffer to a base64 data URL and store it in MongoDB.
// Locally, persist files to disk as usual.
const storage = process.env.VERCEL
  ? multer.memoryStorage()
  : (() => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      return multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
        },
      });
    })();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith("image/") && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Not an image! Please upload only images (jpg, jpeg, png, gif, webp).",
      ),
      false,
    );
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
