"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Filter, RotateCcw, Check, MapPin, Sparkles, Compass } from "lucide-react";

export const SRI_LANKAN_DISTRICTS = [
    "All",
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
];

export const INTENT_OPTIONS = [
    { value: "all", label: "All Relationship Intents" },
    { value: "Dating intentionally", label: "Dating Intentionally" },
    { value: "Long-term with marriage mindset", label: "Long-term (Marriage Mindset)" },
    { value: "Open to seeing where it goes", label: "Open to Exploring" },
    { value: "New connections", label: "New Connections & Friends" },
];

export const LIFESTYLE_OPTIONS = [
    { value: "all", label: "All Lifestyle Rhythms" },
    { value: "Cafe explorer & beach sunsets", label: "☕ Cafe Explorer & Beach Sunsets" },
    { value: "Early riser, yoga & weekend surf trips", label: "🌊 Early Riser & Surf Trips" },
    { value: "Night owl, live indie gigs & late-night kottu", label: "🌙 Night Owl & Live Music" },
    { value: "Creative homebody with books & specialty tea", label: "📖 Creative Homebody & Tea" },
    { value: "Active outdoors, hiking & photography", label: "🥾 Active Outdoors & Hiking" },
];

interface DiscoveryFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDistrict: string;
    onDistrictChange: (d: string) => void;
    selectedIntent: string;
    onIntentChange: (i: string) => void;
    selectedLifestyle: string;
    onLifestyleChange: (l: string) => void;
    onResetAll: () => void;
    onApply: () => void;
}

export const DiscoveryFilterDrawer: React.FC<DiscoveryFilterDrawerProps> = ({
    isOpen,
    onClose,
    selectedDistrict,
    onDistrictChange,
    selectedIntent,
    onIntentChange,
    selectedLifestyle,
    onLifestyleChange,
    onResetAll,
    onApply,
}) => {
    if (!isOpen) return null;

    const activeCount =
        (selectedDistrict !== "All" && selectedDistrict !== "all" ? 1 : 0) +
        (selectedIntent !== "all" ? 1 : 0) +
        (selectedLifestyle !== "all" ? 1 : 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col text-white shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-rose-500" />
                        <h3 className="font-bold text-base">Discovery Feed Filters</h3>
                        {activeCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                {activeCount} active
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Filter Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* 1. Sri Lankan District */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <MapPin className="w-4 h-4 text-rose-400" />
                            <label className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                                Sri Lankan District
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {SRI_LANKAN_DISTRICTS.map((dist) => {
                                const isSelected =
                                    selectedDistrict.toLowerCase() === dist.toLowerCase() ||
                                    (dist === "All" && selectedDistrict === "all");
                                return (
                                    <button
                                        key={dist}
                                        onClick={() => onDistrictChange(dist === "All" ? "all" : dist)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${isSelected
                                                ? "bg-rose-500 text-white shadow-md shadow-rose-950/40"
                                                : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                                            }`}
                                    >
                                        {dist}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Relationship Intent */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <label className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                                Relationship Intention
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            {INTENT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => onIntentChange(opt.value)}
                                    className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between transition border ${selectedIntent === opt.value
                                            ? "bg-amber-500/20 border-amber-500 text-white font-semibold"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {selectedIntent === opt.value && <Check className="w-4 h-4 text-amber-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Lifestyle Rhythm & Pace */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <Compass className="w-4 h-4 text-sky-400" />
                            <label className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                                Lifestyle Pace & Rhythm
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            {LIFESTYLE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => onLifestyleChange(opt.value)}
                                    className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between transition border ${selectedLifestyle === opt.value
                                            ? "bg-sky-500/20 border-sky-500 text-white font-semibold"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {selectedLifestyle === opt.value && <Check className="w-4 h-4 text-sky-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center space-x-3">
                    <button
                        onClick={onResetAll}
                        className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={() => {
                            onApply();
                            onClose();
                        }}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition hover:opacity-95"
                    >
                        Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
