import { useState, useEffect } from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const GraphVisualization = ({ sessionId }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/graph/${sessionId}`,
        );
        const graphData = await response.json();

        setNodes(graphData.nodes);
        setEdges(graphData.edges);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchGraphData();
  }, [sessionId]);

  return (
    <div style={{ height: "500px", width: "100%", marginTop: "50px" }}>
      <ReactFlow nodes={nodes} edges={edges} colorMode="dark" />
    </div>
  );
};

export default GraphVisualization;
