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
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
        } catch (e) {
            // ignore
        }
    };

    const togglePlay = () => {
        if (!audioUrl) {
            // Play demo synthesized chirp for previewing UI
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

    const bars = [35, 60, 45, 80, 95, 70, 50, 85, 100, 65, 40, 75, 90, 85, 60, 95, 70, 50, 80, 60, 45, 30];

    return (
        <div className="bg-slate-950/80 backdrop-blur-md border border-rose-500/20 rounded-2xl p-3 shadow-lg">
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
                <div className="flex items-center space-x-1.5 text-rose-300">
                    <Mic className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                        Voice Intro • 15s
                    </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400">
                    Sinhala / Tamil / Eng
                </span>
            </div>

            <p className="text-xs font-semibold text-white mb-2.5 truncate">
                &quot;{promptTitle}&quot;
            </p>

            {/* Waveform Player Bar */}
            <div className="flex items-center space-x-3 bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition"
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
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
                                className={`w-1 rounded-full transition-all duration-150 ${isFilled
                                    ? "bg-rose-500"
                                    : isPlaying
                                        ? "bg-rose-950/60 animate-pulse"
                                        : "bg-slate-700/60"
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* Timer */}
                <span className="text-[11px] font-mono text-slate-400 shrink-0 w-8 text-right">
                    {Math.floor(currentTime)}s
                </span>
            </div>
        </div>
    );
};
