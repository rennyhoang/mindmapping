import whisper
from fastapi import FastAPI, WebSocket

app = FastAPI()
model = whisper.load_model("base")


@app.websocket("/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        audio_chunk = await websocket.receive_bytes()
        text = model.transcribe(audio_chunk, fp16=False)
        await websocket.send_text(text['text'])
