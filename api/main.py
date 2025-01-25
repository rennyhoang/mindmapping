import uuid

import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import spacy
import whisper
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.responses import FileResponse

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

    # Process the transcript using spaCy
    doc = nlp(transcript)

    # Create a graph representation
    G = nx.Graph()

    # Add named entities as nodes
    for ent in doc.ents:
        G.add_node(ent.text, label=ent.label_)

    for sent in doc.sents:
        entities_in_sent = [ent.text for ent in sent.ents]
        for i in range(len(entities_in_sent)):
            for j in range(i + 1, len(entities_in_sent)):
                G.add_edge(entities_in_sent[i], entities_in_sent[j])

    # Save the graph visualization to a file
    plt.figure(figsize=(8, 6))
    pos = nx.spring_layout(G, k=1)
    nx.draw(
        G,
        pos,
        with_labels=True,
        node_color="lightblue",
        edge_color="black",
        width=2,
        node_size=3000,
        font_size=10,
    )
    plt.title("Named Entity Relationship Graph")
    plt.savefig("graph.png")
    plt.close()

    # Return the graph image
    return FileResponse("graph.png")
