import uuid
import json
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from transcriber import download_and_transcribe
from rag_engine import RAGEngine

app = FastAPI(title="YouTube RAG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
VIDEOS_DB = DATA_DIR / "videos.json"

rag = RAGEngine()


def load_videos() -> dict:
    if VIDEOS_DB.exists():
        return json.loads(VIDEOS_DB.read_text())
    return {}


def save_videos(videos: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    VIDEOS_DB.write_text(json.dumps(videos, indent=2))


class ProcessRequest(BaseModel):
    url: str


class ChatRequest(BaseModel):
    video_id: str
    message: str


@app.post("/api/process")
def process_video(req: ProcessRequest):
    video_id = uuid.uuid4().hex[:8]
    try:
        result = download_and_transcribe(req.url, video_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process video: {e}")

    summary = rag.index_transcript(video_id, result["transcript"], result["title"])

    video = {
        "id": video_id,
        "url": req.url,
        "title": result["title"],
        "transcript": result["transcript"],
        "summary": summary,
    }

    videos = load_videos()
    videos[video_id] = video
    save_videos(videos)
    return video


@app.get("/api/videos")
def list_videos():
    return list(load_videos().values())


@app.get("/api/videos/{video_id}")
def get_video(video_id: str):
    videos = load_videos()
    if video_id not in videos:
        raise HTTPException(status_code=404, detail="Video not found")
    return videos[video_id]


@app.post("/api/chat")
def chat(req: ChatRequest):
    videos = load_videos()
    if req.video_id not in videos:
        raise HTTPException(status_code=404, detail="Video not found")
    response = rag.chat(req.video_id, req.message)
    return {"response": response}
