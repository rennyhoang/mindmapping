import { useState, useRef } from "react";
import RecordRTC from "recordrtc";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const wsRef = useRef(null);
  const recorderRef = useRef(null);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Establish WebSocket connection
      wsRef.current = new WebSocket("wss://127.0.0.1:8000/transcribe");

      wsRef.current.onopen = () => {
        console.log("WebSocket connection established");
      };

      wsRef.current.onmessage = (event) => {
        setTranscript((prev) => prev + " " + event.data);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Use RecordRTC for capturing audio in real time
      recorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav", // Send uncompressed audio
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 1000, // Send chunks every second
        desiredSampRate: 16000, // Recommended for speech recognition
        numberOfAudioChannels: 1, // Mono channel for better compatibility
        ondataavailable: (blob) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(blob);
          }
        },
      });

      recorderRef.current.startRecording();
      console.log("Recording started...");
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        console.log("Recording stopped");
      });
    }
    if (wsRef.current) {
      wsRef.current.close();
      console.log("WebSocket connection closed");
    }
  };

  return (
    <div>
      <h1>Real-Time Audio Transcription</h1>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <p>
        <strong>Transcript:</strong> {transcript}
      </p>
    </div>
  );
};

export default App;
