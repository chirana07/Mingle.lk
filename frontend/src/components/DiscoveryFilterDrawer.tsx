"use client";
import { useDialog } from "@/hooks/useDialog";

import React from "react";
import { motion } from "framer-motion";
import { X, Filter, RotateCcw, Check, MapPin, Sparkles, Compass } from "lucide-react";

export const SRI_LANKAN_DISTRICTS = [
    "All",
    "Colombo",
    "Gampaha",
    "Negombo",
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
    { value: "Serious relationship", label: "Serious Relationship" },
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
  const dialogRef = useDialog(isOpen, onClose);
    if (!isOpen) return null;

    const activeCount =
        (selectedDistrict !== "All" && selectedDistrict !== "all" ? 1 : 0) +
        (selectedIntent !== "all" ? 1 : 0) +
        (selectedLifestyle !== "all" ? 1 : 0);

    return (
        <div className="fixed inset-0 z-50 bg-white backdrop-blur-md flex justify-end">
            <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Discovery filters" tabIndex={-1}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
                className="w-full max-w-md bg-white border-l border-[#e6e1ed] h-full flex flex-col text-[#262131] shadow-sm relative"
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-[#e6e1ed] flex items-center justify-between bg-white backdrop-blur-md">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-sm tracking-tight text-[#262131]">Discovery Filters</h3>
                                {activeCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 border border-rose-500/30 text-[10px] font-bold">
                                        {activeCount} active
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500">Refine by Sri Lankan province, intent & pace</p>
                        </div>
                    </div>
                    <button
                        aria-label="Close discovery filters" onClick={onClose}
                        className="p-2 rounded-xl bg-[#f5f2f8] hover:bg-[#f5f2f8] text-slate-500 hover:text-[#262131] transition cursor-pointer"
                                >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable Filter Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                    {/* 1. Sri Lankan District */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
                            <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">
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
                                                ? "bg-rose-500 mingle-filled text-[#262131] font-bold shadow-md border border-rose-400/40"
                                                : "bg-[#f5f2f8] text-slate-600 hover:text-[#262131] hover:bg-[#f5f2f8] border border-[#e6e1ed]"
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
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">
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
                                                ? "bg-amber-500/15 border-amber-500/40 text-amber-800 font-semibold shadow-sm"
                                                : "bg-[#f5f2f8] border-[#e6e1ed] text-slate-600 hover:text-[#262131] hover:bg-[#f5f2f8]"
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-amber-700 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Lifestyle Rhythm & Pace */}
                    <div>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                            <Compass className="w-3.5 h-3.5 text-sky-700" />
                            <label className="text-[11px] uppercase font-bold text-slate-600 tracking-wider">
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
                                                ? "bg-sky-500/15 border-sky-500/40 text-sky-800 font-semibold shadow-sm"
                                                : "bg-[#f5f2f8] border-[#e6e1ed] text-slate-600 hover:text-[#262131] hover:bg-[#f5f2f8]"
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-sky-700 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-[#e6e1ed] bg-white backdrop-blur-md flex items-center space-x-3">
                    <button
                        onClick={onResetAll}
                        className="px-4 py-3 rounded-xl bg-[#f5f2f8] hover:bg-[#f5f2f8] text-slate-600 hover:text-[#262131] text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-[#e6e1ed]"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={() => {
                            onApply();
                            onClose();
                        }}
                        className="flex-1 py-3 rounded-xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                        Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
