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
        <div className="fixed inset-0 z-50 bg-[#090D16]/80 backdrop-blur-md flex justify-end">
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
                className="w-full max-w-md bg-[#0E1424] border-l border-white/[0.08] h-full flex flex-col text-white shadow-2xl relative"
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#101623]/80 backdrop-blur-md">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-sm tracking-tight text-white">Discovery Filters</h3>
                                {activeCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                        {activeCount} active
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400">Refine by Sri Lankan province, intent & pace</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition cursor-pointer"
                        aria-label="Close filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable Filter Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                    {/* 1. Sri Lankan District */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <label className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
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
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                                            isSelected
                                                ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-950/60 border border-rose-400/40"
                                                : "bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]"
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
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <label className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
                                Relationship Intention
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            {INTENT_OPTIONS.map((opt) => {
                                const isSelected = selectedIntent === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => onIntentChange(opt.value)}
                                        className={`w-full p-2.5 sm:p-3 rounded-xl text-xs flex items-center justify-between transition border cursor-pointer ${
                                            isSelected
                                                ? "bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold shadow-sm"
                                                : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Lifestyle Rhythm & Pace */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <Compass className="w-3.5 h-3.5 text-sky-400" />
                            <label className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
                                Lifestyle Pace & Rhythm
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            {LIFESTYLE_OPTIONS.map((opt) => {
                                const isSelected = selectedLifestyle === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => onLifestyleChange(opt.value)}
                                        className={`w-full p-2.5 sm:p-3 rounded-xl text-xs flex items-center justify-between transition border cursor-pointer ${
                                            isSelected
                                                ? "bg-sky-500/15 border-sky-500/40 text-sky-200 font-semibold shadow-sm"
                                                : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#101623]/90 backdrop-blur-md flex items-center space-x-3">
                    <button
                        onClick={onResetAll}
                        className="px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-white/[0.06]"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={() => {
                            onApply();
                            onClose();
                        }}
                        className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition cursor-pointer"
                    >
                        Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
