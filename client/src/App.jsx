import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ReactFlow } from "@xyflow/react";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Transcription from "./components/Transcription";

import "@xyflow/react/dist/style.css";

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const App = () => {
  return (
    <Router>
      <div
        style={{
          width: "500px",
          height: "500px",
          textAlign: "center",
          marginTop: "50px",
        }}
      >
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
          <Route path="/" element={<Transcription />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <ReactFlow nodes={initialNodes} edges={initialEdges} />
      </div>
    </Router>
  );
};

export default App;
