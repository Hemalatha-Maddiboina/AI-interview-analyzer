import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const Recorder = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [lastDuration, setLastDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState("idle");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [statusBanner, setStatusBanner] = useState({
    tone: "info",
    text: "You're all set. Enable your camera and start recording.",
  });
  const [permissionError, setPermissionError] = useState("");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "--";
    const units = ["B", "KB", "MB", "GB"];
    const power = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
  };

  const handleStatus = (tone, text) => setStatusBanner({ tone, text });

  const startRecording = async () => {
    try {
      setPermissionError("");
      setVideoURL(null);
      setRecordedChunks([]);
      chunksRef.current = [];
      setUploadState("idle");
      setUploadProgress(0);
      handleStatus("info", "Camera On. Speak naturally and look at the camera.");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStreamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn("Preview autoplay blocked", err);
        }
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        setFileSize(blob.size);
        setStreamActive(false);
        stream.getTracks().forEach((track) => track.stop());
        handleStatus(
          "success",
          "Recording saved. Review and upload."
        );
      };

      mediaRecorder.start();
      setRecording(true);
      setTimer(0);
      const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
      setIntervalId(id);
    } catch (error) {
      console.error(error);
      setPermissionError("Please allow camera and microphone access. ");
      handleStatus("error", "Camera access blocked. Update the browser permissions and retry.");
    }
  };

  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    setRecording(false);
    setLastDuration(timer || lastDuration);
    clearInterval(intervalId);
    mediaRecorderRef.current.stop();
  };

  const downloadVideo = () => {
    if (!recordedChunks.length) return;
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mock-interview.webm";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const uploadVideo = async () => {
    if (recording) {
      handleStatus("info", "Stop the recording before upload.");
      return;
    }

    const chunks = chunksRef.current.length ? chunksRef.current : recordedChunks;
    if (!chunks.length || uploadState === "uploading") return;

    const blob = new Blob(chunks, { type: "video/webm" });
    const formData = new FormData();
    const filename = `interview-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
    formData.append("video", blob, filename);

    setUploadState("uploading");
    setUploadProgress(0);
    handleStatus("info", "Uploading securely. Keep this tab open until it completes.");

    try {
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5000/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText || "{}"));
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setUploadedVideoUrl(response?.mp4Url ? `http://localhost:5000${response.mp4Url}` : null);
      setUploadState("success");
      setUploadProgress(100);
      handleStatus("success", "Upload complete. Converted MP4 is ready for playback.");
    } catch (error) {
      console.error("Upload error", error);
      setUploadState("error");
      handleStatus("error", "Upload failed. Check your network and try again.");
    }
  };

  const resetRecording = () => {
    setVideoURL(null);
    setRecordedChunks([]);
    chunksRef.current = [];
    setFileSize(0);
    setUploadState("idle");
    setUploadProgress(0);
    setLastDuration(0);
    setUploadedVideoUrl(null);
    handleStatus("info", "Ready for a other take when you are.");
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (streamActive && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }
  }, [streamActive]);

  const isLargeFile = fileSize > 200 * 1024 * 1024; // 200 MB
  const durationLabel = recording ? timer : videoURL ? lastDuration : 0;
  const hasRecording = recordedChunks.length > 0;
  const readinessPills = [
    { label: "Camera On", active: streamActive || recording || Boolean(videoURL) },
    { label: "Audio live", active: recording || streamActive },
    { label: "Ready to Upload", active: hasRecording },
  ];
  const uploadDescriptions = {
    idle: "Upload your recording to share it with the interviewer.",
    uploading: "Encrypting and sending your file...",
    success: "Uploaded successfully.",
    error: "Something went wrong. Retry to upload.",
  };
  const statusColors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    error: "bg-rose-50 border-rose-200 text-rose-600",
    info: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };
  const timelineBadgeClasses = {
    complete: "border-emerald-400/50 bg-emerald-500/10 text-emerald-100",
    current: "border-indigo-400/60 bg-indigo-500/10 text-indigo-100",
    upcoming: "border-white/20 bg-white/5 text-slate-400",
  };
  const renderTimelineIcon = (status) => {
    if (status === "complete") {
      return (
        <svg
          className="w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 8l2.4 2.4L12 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return (
      <span
        className={`w-2 h-2 rounded-full ${
          status === "current" ? "bg-indigo-400" : "bg-slate-500"
        }`}
      ></span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-72 h-72 bg-indigo-500/20 blur-[120px]"></div>
        <div className="absolute top-32 -left-10 w-80 h-80 bg-sky-500/20 blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-4 space-y-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-[0_20px_120px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-300/40 flex items-center justify-center text-indigo-200">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 7a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 10l5.553-3.333A1 1 0 0121 7.5v9a1 1 0 01-1.447.833L14 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg uppercase tracking-[0.15em] text-blue-300">AI MOCK INTERVIEW</p>
              <p className="text-md font-semibold text-white">Interview Studio</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {readinessPills.map((pill) => (
              <span
                key={pill.label}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  pill.active
                    ? "border-emerald-300/60 bg-emerald-400/10 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                    : "border-white/15 bg-white/5 text-slate-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pill.active ? "bg-emerald-300 animate-pulse" : "bg-slate-500"
                  }`}
                ></span>
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Your Personal Interview Coach for Career Success
          </h1>
          <p className="text-slate-300 max-w-4xl mx-auto">
            Innovate your approach, elevate your career.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4 text-xs uppercase tracking-widest text-slate-300">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${recording ? "bg-rose-400 animate-pulse" : streamActive ? "bg-emerald-400" : "bg-slate-500"}`}></span>
                {recording ? "Live recording" : streamActive ? "Camera preview" : "Standby"}
              </span>
              <span>{formatTime(durationLabel)}</span>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10">
              {videoURL ? (
                <video src={videoURL} controls className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {!videoURL && !streamActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 text-slate-300 bg-slate-950/40">
                  <span className="text-5xl mb-3">🎥</span>
                  <p className="text-lg font-medium">Camera is idle</p>
                  <p className="text-sm text-slate-400">
                    Start the recording and capture your response.
                  </p>
                </div>
              )}

              {(recording || streamActive) && (
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  {recording && (
                    <div className="bg-rose-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      Recording
                    </div>
                  )}
                  <div className="bg-black/50 text-white text-[0.7rem] px-2 py-1 rounded-full border border-white/20">
                    Live preview on
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-slate-400">Interview Duration</p>
                <p className="text-lg font-semibold text-white">
                  {formatTime(durationLabel)}
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-slate-400">File size</p>
                <p className="text-lg font-semibold text-white">{formatBytes(fileSize)}</p>
                {isLargeFile && (
                  <p className="text-amber-300 text-xs mt-1">Large file — upload may take longer.</p>
                )}
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-slate-400">Format</p>
                <p className="text-lg font-semibold text-white">WEBM (HD)</p>
                <p className="text-xs text-slate-400 mt-1">Converted to MP4</p>
              </div>
            </div>
          </section>

          <aside className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className={`rounded-2xl p-4 text-sm border ${statusColors[statusBanner.tone]}`}>
              {statusBanner.text}
            </div>

            {permissionError && (
              <div className="rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 text-sm p-4">
                {permissionError}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition ${
                  recording
                    ? "bg-rose-600 text-white hover:bg-rose-500"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {recording ? "Stop recording" : "Start recording"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetRecording}
                  disabled={!videoURL && !hasRecording}
                  className="py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40"
                >
                  Retake
                </button>
                <button
                  onClick={downloadVideo}
                  disabled={!hasRecording}
                  className="py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40"
                >
                  Download Video
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold">Upload Status</p>
                <span className="text-slate-500">{uploadProgress} %</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadState === "success"
                      ? "bg-emerald-400"
                      : uploadState === "error"
                      ? "bg-rose-500"
                      : "bg-indigo-500"
                  }`}
                  style={{ width: `${uploadState === "idle" ? 0 : uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500">
                {uploadDescriptions[uploadState]}
              </p>
              <button
                onClick={uploadVideo}
                disabled={!hasRecording || uploadState === "uploading"}
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-40"
              >
                {uploadState === "uploading" ? "Uploading..." : "Upload for review"}
              </button>
            </div>

            {uploadedVideoUrl && (
              <div className="space-y-3">
                <p className="font-semibold text-slate-800">Preview Recording</p>
                <video
                  src={uploadedVideoUrl}
                  controls
                  className="w-full rounded-2xl border border-slate-200"
                  preload="metadata"
                />
                <p className="text-xs text-slate-400">
                  MP4 available – perfect for reviewing your response.
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm text-slate-500">
              <p className="font-semibold text-slate-800">Pro tips</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use a quiet, well-lit space for the clearest capture.</li>
                <li>Ensure your voice is loud enough to be heard easily, but avoid shouting.</li>
                <li>Use open and natural hand gestures to emphasize points and appear more dynamic.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Recorder />);