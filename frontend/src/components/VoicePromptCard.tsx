"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Mic } from "lucide-react";

interface VoicePromptCardProps {
    audioUrl?: string;
    promptTitle?: string;
    durationSeconds?: number;
    userName?: string;
}

export const VoicePromptCard: React.FC<VoicePromptCardProps> = ({
  audioUrl,
  promptTitle = "How to pronounce my name & what it means",
  durationSeconds = 15,
  userName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioUrl) return;
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    const dur = audioRef.current.duration || durationSeconds;
    setCurrentTime(curr);
    setProgress((curr / dur) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const bars = [35, 65, 45, 80, 100, 75, 55, 90, 100, 70, 45, 85, 95, 80, 60, 95, 75, 50, 85, 65, 45, 30];

  return (
    <div className="bg-white border border-[#e6e1ed] hover:border-rose-500/30 rounded-2xl p-3.5 shadow-sm transition-all">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      {/* Header Prompt Question */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
            <Mic className="w-3 h-3 text-rose-600" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-rose-700">
            {userName ? `${userName}'s Voice Note` : "Voice Note"}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#f5f2f8] border border-[#e6e1ed] text-[10px] font-semibold text-slate-600">
          {audioUrl ? `${durationSeconds}s audio` : "No voice note yet"}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-800 mb-3 leading-relaxed text-slate-700">
        &ldquo;{promptTitle}&rdquo;
      </p>

      {/* Waveform Player Bar */}
      <div className="flex items-center space-x-3 bg-[#f4f1f8] rounded-xl px-3 py-2 border border-[#e6e1ed]">
        <button
          disabled={!audioUrl}
          aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-rose-500 mingle-filled hover:brightness-110 text-[#262131] flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Dynamic Waveform Bars */}
        <div className="flex-1 flex items-center justify-between h-7 px-1 space-x-0.5">
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isFilled = progress >= barProgress;
            return (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    : isPlaying
                    ? "bg-rose-950/50"
                    : "bg-slate-700/50"
                }`}
              />
            );
          })}
        </div>

        {/* Timer */}
        <span className="text-[11px] font-mono text-slate-600 shrink-0 w-8 text-right font-medium">
          {Math.floor(currentTime)}s
        </span>
      </div>
    </div>
  );
};
