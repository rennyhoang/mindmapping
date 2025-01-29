import uuid

import networkx as nx
import numpy as np
import spacy
import whisper
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.responses import JSONResponse

app = FastAPI()
model = whisper.load_model("small.en")
nlp = spacy.load("en_core_web_sm")
transcript_store = {}


@app.websocket("/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    session_id = str(uuid.uuid4())
    transcript_store[session_id] = ""

    try:
        while True:
            # TODO: figure out how to avoid splitting words
            audio_chunk = await websocket.receive_bytes()
            audio_np = np.frombuffer(audio_chunk, dtype=np.int16)
            audio_np = audio_np.astype(np.float32) / np.iinfo(np.int16).max
            result = model.transcribe(audio_np, fp16=False)
            text = result["text"]
            transcript_store[session_id] += text + " "
            await websocket.send_text(text)

    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")

    finally:
        await websocket.send_text(f"Session ID: {session_id}")
        await websocket.close()


@app.get("/graph/{session_id}")
async def generate_graph(session_id: str):
    if session_id not in transcript_store:
        raise HTTPException(status_code=404, detail="Session not found")

    transcript = transcript_store[session_id]
    doc = nlp(transcript)
    G = nx.Graph()

    for entity in doc.ents:
        print(entity.text)
        G.add_node(entity.text, label=entity.label_)

    # TODO: Actually define mindmap relationships
    for sent in doc.sents:
        entities_in_sent = [ent.text for ent in sent.ents]
        for i in range(len(entities_in_sent)):
            for j in range(i + 1, len(entities_in_sent)):
                G.add_edge(entities_in_sent[i], entities_in_sent[j])

    pos = nx.spring_layout(G, k=20)

    for node, (x, y) in pos.items():
        print((x, y))

    nodes = [
        {
            "id": node,
            "position": {"x": float(x) * 100, "y": float(y) * 100},
            "data": {"label": node},
        }
        for node, (x, y) in pos.items()
    ]

    edges = [
        {
            "id": f"e-{source}-{target}",
            "source": str(source),
            "target": str(target),
        }
        for source, target in G.edges()
    ]

    return JSONResponse(content={"nodes": nodes, "edges": edges})
