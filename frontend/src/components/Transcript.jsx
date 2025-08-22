import { useState } from "react";

export default function Transcript({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 6h16M4 10h16M4 14h10" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/70">Transcript</span>
        </div>
        <button
          onClick={copy}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            copied
              ? "border-green-500/50 text-green-400 bg-green-500/10"
              : "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-5 max-h-[55vh] overflow-y-auto scrollbar-thin">
        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
