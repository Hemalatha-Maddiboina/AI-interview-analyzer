import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";


const Recorder = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      setVideoURL(null);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setTimer(0);
      const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
      setIntervalId(id);
    } catch (error) {
      alert("⚠️ Please allow camera and microphone access.");
      console.error(error);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    clearInterval(intervalId);
  };

  // Download
  const downloadVideo = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
  };

  // Upload
  const uploadVideo = async () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const formData = new FormData();
  formData.append("video", blob, "recording.webm");

  try {
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Uploaded successfully!");
      console.log("Server response:", data);
    } else {
      alert("❌ Upload failed!");
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("⚠️ Error uploading video!");
  }
};
  // Format time

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, [intervalId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center justify-center p-6 transition-all duration-500">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4 text-center animate-fade-in">
        🧑‍💼 AI MOCK INTERVIEW
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg text-lg">
        Record the interview. Start recording your interview, download, & upload!
      </p>

      <div className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-md flex flex-col items-center transition-all hover:scale-105 duration-300">
        {!videoURL ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className="rounded-2xl border border-gray-300 w-full mb-4 shadow-md"
          ></video>
        ) : (
          <video
            src={videoURL}
            controls
            className="rounded-2xl border border-gray-300 w-full mb-4 shadow-lg"
          ></video>
        )}

        {recording && (
          <div className="flex items-center gap-2 mb-4 animate-pulse">
            <div className="w-4 h-4 bg-red-600 rounded-full shadow-glow"></div>
            <p className="text-sm font-semibold text-red-600 tracking-wider">
              Recording ... {formatTime(timer)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {!recording ? (
            <button
              onClick={startRecording}
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              🎥 Start recording your interview
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              ⏹ Stop Recording
            </button>
          )}

          {videoURL && (
            <>
              <button
                onClick={downloadVideo}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                ⬇️ Download
              </button>
              <button
                onClick={uploadVideo}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                ☁️ Upload for Review
              </button>
              <button
                onClick={() => {
                  setVideoURL(null);
                  setRecordedChunks([]);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                🔄 Re-take
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Recorder />);
