import { useState, useEffect } from "react";
import VideoInput from "./components/VideoInput";
import Transcript from "./components/Transcript";
import Chat from "./components/Chat";

const API = "/api";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("summary");

  useEffect(() => {
    fetch(`${API}/videos`)
      .then((r) => r.json())
      .then(setVideos)
      .catch(() => {});
  }, []);

  const processVideo = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Processing failed");
      }
      const video = await res.json();
      setActiveVideo(video);
      setVideos((prev) => [...prev, video]);
      setTab("summary");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ["summary", "transcript", "chat"];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 backdrop-blur-sm px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold">
              T
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              tok2vid
            </span>
            <span className="text-xs text-white/30 ml-1 mt-0.5">
              YouTube → transcript + RAG chat
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Hero + Input */}
          {!activeVideo && (
            <div className="text-center space-y-6 py-8">
              <div className="space-y-3">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Chat with any video
                </h1>
                <p className="text-white/40 text-lg">
                  Paste a YouTube URL. Get a transcript, summary, and an AI you
                  can ask anything.
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <VideoInput
                  onProcess={processVideo}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          )}

          {activeVideo && (
            <div className="space-y-6">
              <VideoInput
                onProcess={processVideo}
                loading={loading}
                error={error}
                compact
              />
            </div>
          )}

          {/* Previous videos */}
          {videos.length > 0 && !activeVideo && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                Recent
              </p>
              <div className="grid gap-2">
                {videos.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveVideo(v);
                      setTab("summary");
                    }}
                    className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/8 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-violet-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white/90 truncate group-hover:text-white transition-colors">
                        {v.title}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">{v.id}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/20 group-hover:text-violet-400 ml-auto flex-shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active video panel */}
          {activeVideo && (
            <div className="space-y-5">
              {/* Video title bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white truncate">
                      {activeVideo.title}
                    </h2>
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      ← all videos
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 flex-shrink-0">
                  {tabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                        tab === t
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/25"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "summary" && <SummaryPanel summary={activeVideo.summary} />}
              {tab === "transcript" && <Transcript text={activeVideo.transcript} />}
              {tab === "chat" && <Chat videoId={activeVideo.id} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({ summary }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white/70">Summary</span>
      </div>
      <div className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">
        {summary}
      </div>
    </div>
  );
}
