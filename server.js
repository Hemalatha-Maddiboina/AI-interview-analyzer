import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(cors());

const fsPromises = fs.promises;
const appRoot = process.cwd();
const uploadFolder = path.join(appRoot, "uploads");
const originalsFolder = path.join(uploadFolder, "originals");
const convertedFolder = path.join(uploadFolder, "converted");
const MIN_FILE_BYTES = 80 * 1024; // ~80KB to ensure at least a few seconds of footage

[uploadFolder, originalsFolder, convertedFolder].forEach((folder) => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

app.use("/uploads", express.static(uploadFolder));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, originalsFolder),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `video_${timestamp}.webm`);
  },
});
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 1024 } });

const convertToMp4 = (inputPath, outputPath) =>
  new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-preset veryfast", "-movflags +faststart"])
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });

app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const originalPath = req.file.path;
  const mp4Filename = req.file.filename.replace(/\.webm$/, ".mp4");
  const convertedPath = path.join(convertedFolder, mp4Filename);

  try {
    const { size } = await fsPromises.stat(originalPath);

    if (size < MIN_FILE_BYTES) {
      await fsPromises.unlink(originalPath).catch(() => {});
      return res.status(422).json({
        message: "Recording is too short to process. Please record for a few seconds before uploading.",
        details: { receivedBytes: size, minimumBytes: MIN_FILE_BYTES },
      });
    }

    await convertToMp4(originalPath, convertedPath);
    const relativeConverted = path.relative(appRoot, convertedPath).replace(/\\/g, "/");
    res.json({
      message: "✅ Upload converted successfully",
      original: path.relative(appRoot, originalPath),
      mp4: relativeConverted,
      mp4Url: `/uploads/${relativeConverted.replace(/^uploads\//, "")}`,
    });
  } catch (error) {
    console.error("FFmpeg conversion failed", error);
    await Promise.all([
      fsPromises.unlink(convertedPath).catch(() => {}),
    ]);
    return res.status(500).json({ message: "Conversion failed", error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));