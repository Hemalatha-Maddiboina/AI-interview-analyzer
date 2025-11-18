# AI Mock Interview Video Recorder

A video recording experience for mock interviews. The frontend is a Vite + React single-page app that records webcam + microphone streams in the browser, while the backend is an Express server that accepts uploads, validates their size, and converts each recording to MP4 using FFmpeg.

## Features
- Browser-based recording with live preview, timer, and status banners
- Download locally or upload when satisfied
- Upload progress indicator with success/error feedback
- Express API that stores originals and outputs MP4 conversions
- Static hosting of converted assets via `/uploads`

## Project structure
```
AI INTERVIEW/
├─ recorder.jsx          # React entry point (renders the entire UI)
├─ index.html             # Root HTML template loaded by Vite
├─ index.css              # Tailwind-generated + custom styles
├─ vite.config.js         # Vite dev server settings (port 5173)
├─ tailwind.config.js     # Tailwind setup
├─ postcss.config.js      # PostCSS pipeline
├─ server.js              # Express upload + FFmpeg conversion server (port 5000)
├─ uploads/               # Runtime storage (originals + converted)
├─ dist/                  # Production build output (generated)
├─ package.json / lock    # Dependencies and scripts
└─ node_modules/          # Installed packages (generated)
```

## Requirements
- Node.js 18+ (ensures native support for top-level `await`/ESM and FFmpeg binary install)
- npm 9+ (comes with recent Node releases)

## Installation
```bash
npm install
```
This installs both frontend and backend dependencies (Express, FFmpeg installer, React, Vite, Tailwind, etc.).

## Running in development
Open two terminals from the project root.

1. **Frontend (React + Vite)**
   ```bash
   npm run dev
   ```
   - Serves the SPA at http://localhost:5173
   - Hot Module Replacement (HMR) is enabled by default

2. **Backend (Express + FFmpeg)**
   ```bash
   node server.js
   ```
   - Exposes POST `http://localhost:5000/upload`
   - Creates `uploads/originals` and `uploads/converted` if missing
   - Hosts converted files at `http://localhost:5000/uploads/...`

> Tip: use `nodemon server.js` if you want automatic reloads while tweaking the server.

Once both processes are running, visit the Vite URL. Record, stop, review, then upload; the UI sends the blob to the backend, which returns the converted MP4 URL.

## Building for production
```bash
npm run build
```
- Generates static assets inside `dist/`
- Serve `dist/` with any static host (e.g., `npm install -g serve && serve -s dist`) while keeping `server.js` running for uploads/conversions.
- Update any deployment config so the SPA points to the reachable backend URL instead of `http://localhost:5000`.

## API reference
### `POST /upload`
- **Form field**: `video` (`video/webm` blob)
- **Validations**: rejects files smaller than ~80 KB (prevents empty clips)
- **Success response** `200 OK`
  ```json
  {
    "message": "✅ Upload converted successfully",
    "original": "uploads/originals/video_1731912345678.webm",
    "mp4": "uploads/converted/video_1731912345678.mp4",
    "mp4Url": "/uploads/converted/video_1731912345678.mp4"
  }
  ```
- **Error responses**:
  - `400` – no file provided
  - `422` – recording too short
  - `500` – FFmpeg conversion failure (message includes `.error`)

Converted files are reachable at `http://localhost:5000/uploads/...` thanks to the static middleware in `server.js`.

## Troubleshooting
1. **Camera permissions blocked** – allow camera + microphone in the browser; the UI surfaces errors via the status banner.
2. **Upload fails immediately** – ensure the backend is running on port 5000 and no CORS proxy is blocking the request.
3. **FFmpeg errors** – the project bundles `@ffmpeg-installer/ffmpeg`; reinstall (`npm install`) if binaries are missing. Large files may take longer; keep the terminal open to see conversion logs.
4. **Ports already in use** – adjust `vite.config.js` (frontend) or change `PORT` in `server.js` if 5173/5000 are occupied.