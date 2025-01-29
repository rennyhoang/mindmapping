import { useState, useRef } from "react";
import RecordRTC from "recordrtc";

const Transcription = ({ setSessionId }) => {
  const [transcript, setTranscript] = useState("");
  const wsRef = useRef(null);
  const recorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      wsRef.current = new WebSocket("ws://localhost:8000/transcribe");

      wsRef.current.onopen = () => {
        console.log("WebSocket connection established");
      };

      wsRef.current.onmessage = (event) => {
        if (event.data.startsWith("Session ID")) {
          wsRef.current.close();
          setSessionId(event.data.split(": ")[1]);
        } else {
          setTranscript((prev) => prev + " " + event.data);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Use RecordRTC for capturing audio in real time
      recorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav", // Send uncompressed audio
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 5000, // Send chunks every second
        desiredSampRate: 16000, // Recommended for speech recognition
        numberOfAudioChannels: 1, // Mono channel for better compatibility
        ondataavailable: (blob) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(blob);
          }
        },
      });

      recorderRef.current.startRecording();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
    if (wsRef.current) {
      wsRef.current.send("STOP");
    }
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <p>
        <strong>Transcript:</strong> {transcript}
      </p>
    </div>
  );
};

export default Transcription;
