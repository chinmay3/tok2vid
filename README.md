# tok2vid

Transcribe, summarize, and chat with any YouTube video using Whisper + RAG.

## Setup

1. Clone the repo and add your OpenAI API key:

```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
```

2. Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Install frontend dependencies:

```bash
cd frontend && npm install
```

## Run

**Backend** (terminal 1):

```bash
cd backend && uvicorn main:app --reload --port 8000
```

**Frontend** (terminal 2):

```bash
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Requirements

- Python 3.10+
- Node.js 18+
- ffmpeg (`brew install ffmpeg`)
- OpenAI API key
