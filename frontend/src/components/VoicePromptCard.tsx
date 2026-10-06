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

  // Synthesized fallback sound generator if no real audio URL is uploaded yet
  const playFallbackDemoSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio context not allowed or unsupported
    }
  };

  const togglePlay = () => {
    if (!audioUrl) {
      playFallbackDemoSound();
      setIsPlaying(true);
      let count = 0;
      const interval = setInterval(() => {
        count += 0.5;
        setCurrentTime(count);
        setProgress(Math.min((count / durationSeconds) * 100, 100));
        if (count >= durationSeconds) {
          clearInterval(interval);
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
        }
      }, 500);
      return;
    }

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
    <div className="bg-[#0C121E]/95 border border-white/[0.08] hover:border-rose-500/30 rounded-2xl p-3.5 shadow-lg shadow-black/40 transition-all">
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
            <Mic className="w-3 h-3 text-rose-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-rose-300">
            {userName ? `${userName}'s Voice Note` : "Voice Note"}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-[10px] font-semibold text-slate-300">
          15s Audio
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-100 mb-3 line-clamp-1 italic text-slate-200">
        &ldquo;{promptTitle}&rdquo;
      </p>

      {/* Waveform Player Bar */}
      <div className="flex items-center space-x-3 bg-[#101726] rounded-xl px-3 py-2 border border-white/[0.06]">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-rose-600 hover:brightness-110 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-950/50 hover:scale-105 active:scale-95 transition cursor-pointer"
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
        <span className="text-[11px] font-mono text-slate-300 shrink-0 w-8 text-right font-medium">
          {Math.floor(currentTime)}s
        </span>
      </div>
    </div>
  );
};
