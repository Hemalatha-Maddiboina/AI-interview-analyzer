import React, { useState } from "react";

function App() {
  const [confidence, setConfidence] = useState(50);
  const [communication, setCommunication] = useState(50);
  const [eyeContact, setEyeContact] = useState(50);

  const average = Number(((confidence + communication + eyeContact) / 3).toFixed(1));

  return (
    <div style={{ textAlign: "center", padding: "30px", fontFamily: "Arial" }}>
      <h1>Interview Result Dashboard</h1>

      <h2>Enter Scores Manually (%)</h2>
      <div>
        <label>Confidence Score: </label>
        <input
          type="number"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          min="0"
          max="100"
        />
        %
      </div>

      <div>
        <label>Communication Clarity: </label>
        <input
          type="number"
          value={communication}
          onChange={(e) => setCommunication(Number(e.target.value))}
          min="0"
          max="100"
        />
        %
      </div>

      <div>
        <label>Eye Contact Score: </label>
        <input
          type="number"
          value={eyeContact}
          onChange={(e) => setEyeContact(Number(e.target.value))}
          min="0"
          max="100"
        />
        %
      </div>

      <hr />

      <h2>Adjust Scores Using Sliders</h2>

      <div>
        <p>Confidence Score: {confidence}%</p>
        <input
          type="range"
          min="0"
          max="100"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
        />
      </div>

      <div>
        <p>Communication Clarity: {communication}%</p>
        <input
          type="range"
          min="0"
          max="100"
          value={communication}
          onChange={(e) => setCommunication(Number(e.target.value))}
        />
      </div>

      <div>
        <p>Eye Contact Score: {eyeContact}%</p>
        <input
          type="range"
          min="0"
          max="100"
          value={eyeContact}
          onChange={(e) => setEyeContact(Number(e.target.value))}
        />
      </div>

      <hr />

      <h2>Final Result</h2>
      <h3>Average Score: {average}%</h3>

      {average >= 75 ? (
        <p style={{ color: "green" }}>Excellent performance! Keep it up! ✅</p>
      ) : average >= 50 ? (
        <p style={{ color: "orange" }}>Good, but improvement needed. ✨</p>
      ) : (
        <p style={{ color: "red" }}>Needs improvement. Keep practicing. 💪</p>
      )}
    </div>
  );
}

export default App;