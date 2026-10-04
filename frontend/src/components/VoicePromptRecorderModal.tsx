"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Play, Pause, RotateCcw, Check, X } from "lucide-react";
import { toast } from "sonner";

interface VoicePromptRecorderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveVoiceIntro: (audioUrl: string, promptKey: string, promptTitle: string) => Promise<void>;
}

const SRI_LANKAN_PROMPTS = [
    { key: "pronunciation", label: "How to pronounce my name & what it means 🇱🇰" },
    { key: "phrase", label: "My favorite Sinhala / Tamil expression & why" },
    { key: "sunday", label: "What my ideal slow Sunday morning sounds like ☕" },
    { key: "food", label: "The ultimate late-night Sri Lankan comfort food order 🧀" },
];

export const VoicePromptRecorderModal: React.FC<VoicePromptRecorderModalProps> = ({
    isOpen,
    onClose,
    onSaveVoiceIntro,
}) => {
    const [selectedPrompt, setSelectedPrompt] = useState(SRI_LANKAN_PROMPTS[0]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    if (!isOpen) return null;

    const startRecording = async () => {
        try {
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    setAudioBlobUrl(reader.result as string);
                };
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordSeconds(0);

            timerRef.current = setInterval(() => {
                setRecordSeconds((prev) => {
                    if (prev >= 14) {
                        stopRecording();
                        return 15;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            toast.error("Microphone permission denied", {
                description: "Please allow microphone access in your browser to record a voice intro.",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
    };

    const resetRecording = () => {
        setAudioBlobUrl(null);
        setRecordSeconds(0);
        setIsPlayingPreview(false);
    };

    const togglePreviewPlay = () => {
        if (!audioPreviewRef.current) return;
        if (isPlayingPreview) {
            audioPreviewRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            audioPreviewRef.current
                .play()
                .then(() => setIsPlayingPreview(true))
                .catch(() => setIsPlayingPreview(false));
        }
    };

    const handleSave = async () => {
        if (!audioBlobUrl) return;
        setIsSaving(true);
        try {
            await onSaveVoiceIntro(audioBlobUrl, selectedPrompt.key, selectedPrompt.label);
            toast.success("15s Voice intro saved to your profile!");
            onClose();
        } catch (e: any) {
            toast.error(e.message || "Failed to save voice intro.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 text-white shadow-2xl relative"
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center space-x-2">
                        <Mic className="w-5 h-5 text-rose-500" />
                        <h3 className="font-bold text-sm">15-Second Voice Intro</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Prompt Selector */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Select a Voice Prompt Question:
                    </label>
                    <div className="space-y-1.5">
                        {SRI_LANKAN_PROMPTS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => setSelectedPrompt(p)}
                                className={`w-full text-left p-2.5 rounded-xl text-xs transition border ${selectedPrompt.key === p.key
                                        ? "bg-rose-500/20 border-rose-500/50 text-white font-semibold"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recording Visualizer & Status */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-center mb-4">
                    <div className="text-3xl font-mono font-bold text-rose-400 mb-2">
                        00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:15
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4">
                        {isRecording
                            ? "Recording in progress... Speak clearly into your mic."
                            : audioBlobUrl
                                ? "Preview ready! Listen or re-record."
                                : "Tap the button below to start your 15s recording."}
                    </p>

                    {!audioBlobUrl ? (
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition shadow-xl ${isRecording
                                    ? "bg-rose-600 hover:bg-rose-700 animate-pulse text-white"
                                    : "bg-gradient-to-r from-rose-500 to-amber-500 hover:scale-105 text-white shadow-rose-900/40"
                                }`}
                        >
                            {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
                        </button>
                    ) : (
                        <div className="flex items-center justify-center space-x-3">
                            <audio
                                ref={audioPreviewRef}
                                src={audioBlobUrl}
                                onEnded={() => setIsPlayingPreview(false)}
                                className="hidden"
                            />
                            <button
                                onClick={togglePreviewPlay}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5"
                            >
                                {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                                <span>{isPlayingPreview ? "Pause" : "Play Preview"}</span>
                            </button>
                            <button
                                onClick={resetRecording}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Re-record</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Save button */}
                <button
                    disabled={!audioBlobUrl || isSaving}
                    onClick={handleSave}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-40"
                >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? "Saving Voice Intro..." : "Save to Profile"}</span>
                </button>
            </motion.div>
        </div>
    );
};
