import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Transcription from "./components/Transcription";
import MindMap from "./components/MindMap";

import "@xyflow/react/dist/style.css";

const App = () => {
  const [sessionId, setSessionId] = useState("");

  return (
    <Router>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Real-Time Mindmapping</h1>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>
            Home
          </Link>
          <Link to="/signup" style={{ marginRight: "15px" }}>
            Sign Up
          </Link>
          <Link to="/login">Login</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <Transcription
                sessionId={sessionId}
                setSessionId={setSessionId}
              />
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <MindMap sessionId={sessionId} />
      </div>
    </Router>
  );
};

export default App;
