import { useState } from "react";

export default function VideoInput({ onProcess, loading, error, compact }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onProcess(url.trim());
      setUrl("");
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={loading}
            className={`w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all ${compact ? "py-2.5 text-sm" : "py-3.5"}`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className={`px-5 rounded-xl font-semibold transition-all whitespace-nowrap ${
            loading || !url.trim()
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          } ${compact ? "text-sm py-2.5" : "py-3.5"}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing…
            </span>
          ) : (
            "Process"
          )}
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 px-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-white/40">
            Downloading and transcribing — takes a couple of minutes…
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 px-1">
          {error}
        </p>
      )}
    </div>
  );
}
