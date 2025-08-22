import { useState, useRef, useEffect } from "react";

const API = "/api";

const SUGGESTIONS = [
  "What is this video about?",
  "What are the key takeaways?",
  "Summarize the main argument",
];

export default function Chat({ videoId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Chat failed");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden flex flex-col h-[60vh]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white/70">Ask anything</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
            <p className="text-white/25 text-sm">Ask a question about the video</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                <span className="text-[10px] font-bold text-white">AI</span>
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-pink-600 text-white rounded-tr-md shadow-lg shadow-violet-500/20"
                  : "bg-white/8 text-white/80 rounded-tl-md border border-white/8"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">AI</span>
            </div>
            <div className="bg-white/8 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-md flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-white/5 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the video…"
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            loading || !input.trim()
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
