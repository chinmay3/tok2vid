import chromadb
from openai import OpenAI
from pathlib import Path

CHROMA_DIR = Path(__file__).parent / "data" / "chroma"


class RAGEngine:
    def __init__(self):
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        self.chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.openai = OpenAI()

    def _chunk_text(
        self, text: str, chunk_size: int = 500, overlap: int = 50
    ) -> list[str]:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i : i + chunk_size])
            if chunk:
                chunks.append(chunk)
        return chunks

    def _get_embeddings(self, texts: list[str]) -> list[list[float]]:
        response = self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=texts,
        )
        return [item.embedding for item in response.data]

    def index_transcript(self, video_id: str, transcript: str, title: str) -> str:
        chunks = self._chunk_text(transcript)
        if not chunks:
            return "No content to summarize."

        collection = self.chroma_client.get_or_create_collection(
            name=f"video_{video_id}",
            metadata={"hnsw:space": "cosine"},
        )

        embeddings = self._get_embeddings(chunks)
        collection.add(
            ids=[f"chunk_{i}" for i in range(len(chunks))],
            embeddings=embeddings,
            documents=chunks,
            metadatas=[
                {"video_id": video_id, "chunk_index": i} for i in range(len(chunks))
            ],
        )

        return self._summarize(transcript, title)

    def _summarize(self, transcript: str, title: str) -> str:
        text = transcript[:12000]
        response = self.openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You summarize video transcripts. Provide a clear, concise summary with key points as bullet points.",
                },
                {
                    "role": "user",
                    "content": f"Summarize this transcript from '{title}':\n\n{text}",
                },
            ],
            max_tokens=500,
        )
        return response.choices[0].message.content

    def chat(self, video_id: str, question: str) -> str:
        collection = self.chroma_client.get_collection(f"video_{video_id}")
        query_embedding = self._get_embeddings([question])[0]

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
        )

        context = "\n\n".join(results["documents"][0])

        response = self.openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You answer questions about a video using transcript excerpts as context. "
                        "If the answer isn't in the context, say so.\n\n"
                        f"Context:\n{context}"
                    ),
                },
                {"role": "user", "content": question},
            ],
            max_tokens=500,
        )
        return response.choices[0].message.content
