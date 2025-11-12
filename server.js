import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());

// ensure uploads folder exists
const uploadFolder = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `video_${timestamp}.webm`);
  },
});
const upload = multer({ storage });

// upload route
app.post("/upload", upload.single("video"), (req, res) => {
  console.log("🎬 Uploaded file:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ message: "✅ Upload successful", file: req.file.filename });
});

// run server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
