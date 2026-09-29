"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DateRecommendation } from "@/lib/types";
import { api } from "@/lib/api";
import {
  CalendarHeart,
  MapPin,
  ShieldCheck,
  Coffee,
  DollarSign,
  Clock,
  Sparkles,
  X,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Send,
} from "lucide-react";

interface DateModeModalProps {
  matchId?: string | null;
  onClose: () => void;
  onProposeDateSuccess?: () => void;
}

export const DateModeModal: React.FC<DateModeModalProps> = ({
  matchId,
  onClose,
  onProposeDateSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"spots" | "safety">("spots");
  const [recommendations, setRecommendations] = useState<DateRecommendation[]>([]);
  const [selectedCity, setSelectedCity] = useState("Colombo");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Proposal form state
  const [selectedSpot, setSelectedSpot] = useState<DateRecommendation | null>(null);
  const [invitationNote, setInvitationNote] = useState("");
  const [isProposing, setIsProposing] = useState(false);
  const [proposedSuccess, setProposedSuccess] = useState(false);

  // Safety plan state
  const [trustedName, setTrustedName] = useState("Amaya Perera (Sister)");
  const [trustedPhone, setTrustedPhone] = useState("+94779876543");
  const [emergencyNotes, setEmergencyNotes] = useState("Meeting at Barefoot Garden Cafe Colombo around 4:30 PM");
  const [safetyActive, setSafetyActive] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [selectedCity, selectedBudget]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDateRecommendations(selectedCity, selectedBudget);
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropose = async () => {
    if (!matchId || !selectedSpot) return;
    setIsProposing(true);
    try {
      await api.proposeDate({
        match_id: matchId,
        category: selectedSpot.category,
        venue_name: selectedSpot.venue_name,
        neighborhood: selectedSpot.neighborhood,
        budget_bracket: selectedSpot.budget_bracket,
        invitation_note: invitationNote.trim() || undefined,
      });
      setProposedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F43F5E", "#F59E0B", "#10B981"],
      });
      toast.success("Date Proposal Sent!", {
        description: `Invitation sent for ${selectedSpot.venue_name} (${selectedSpot.neighborhood}).`,
      });
      if (onProposeDateSuccess) onProposeDateSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      toast.error(e.message || "Failed to propose date.");
    } finally {
      setIsProposing(false);
    }
  };

  const handleActivateSafety = () => {
    if (!trustedName.trim() || !trustedPhone.trim()) {
      toast.error("Please provide trusted contact details.");
      return;
    }
    setSafetyActive(true);
    toast.success("Private Safety Plan Activated!", {
      description: `${trustedName} will receive a notification if check-in is missed.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 text-white max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <CalendarHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Date Mode & Safety</h3>
              <p className="text-[11px] text-slate-400">Curated low-pressure dates in Sri Lanka</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("spots")}
            className={`py-2 rounded-xl transition ${
              activeTab === "spots" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Curated Safe Spots
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
              activeTab === "safety" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private Safety Plan</span>
          </button>
        </div>

        {/* Tab 1: Curated Spots */}
        {activeTab === "spots" && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Budget Bracket</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none"
                >
                  <option value="all">All Budgets</option>
                  <option value="Free">Free</option>
                  <option value="Under LKR 2,000">Under LKR 2,000</option>
                  <option value="LKR 2,000–5,000">LKR 2,000–5,000</option>
                </select>
              </div>
            </div>

            {/* List of Vetted Venues */}
            {isLoading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading verified spots...</div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((spot, idx) => (
                  <div
                    key={idx}
                    className={`bg-slate-800/60 border rounded-2xl p-3.5 transition cursor-pointer ${
                      selectedSpot?.venue_name === spot.venue_name
                        ? "border-rose-500 bg-rose-950/20"
                        : "border-slate-700/70 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                          {spot.category}
                        </span>
                        <h4 className="font-bold text-sm text-white">{spot.venue_name}</h4>
                        <div className="flex items-center space-x-1 text-slate-400 text-xs">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{spot.neighborhood}, {spot.city}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-semibold shrink-0">
                        {spot.budget_bracket}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                      {spot.vibe_description}
                    </p>

                    <div className="bg-slate-950/60 rounded-xl p-2 text-[11px] text-emerald-300 flex items-start space-x-1.5 border border-emerald-900/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{spot.safety_highlights}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Proposal actions if a match is selected */}
            {matchId && selectedSpot && (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[10px] text-amber-300 font-bold block mb-1 uppercase">
                    Proposing date at: {selectedSpot.venue_name}
                  </span>
                  <input
                    type="text"
                    value={invitationNote}
                    onChange={(e) => setInvitationNote(e.target.value)}
                    placeholder="Add an invitation note (e.g., Saturday afternoon?)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {proposedSuccess ? (
                  <div className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Date Proposal Sent!</span>
                  </div>
                ) : (
                  <button
                    disabled={isProposing}
                    onClick={handlePropose}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isProposing ? "Proposing..." : "Propose Date to Match"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Private Safety Plan */}
        {activeTab === "safety" && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-3.5">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Shame Safety Plan</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Before meeting in person, register your trusted friend or family member. Your match will never know. If you do not check in, Katha will alert your contact.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Trusted Contact Name</label>
                <input
                  type="text"
                  value={trustedName}
                  onChange={(e) => setTrustedName(e.target.value)}
                  placeholder="e.g., Dilini (Best Friend)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Trusted Contact Phone Number</label>
                <input
                  type="text"
                  value={trustedPhone}
                  onChange={(e) => setTrustedPhone(e.target.value)}
                  placeholder="+94771234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Private Venue & Time Notes</label>
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleActivateSafety}
                className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition ${
                  safetyActive
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{safetyActive ? "Safety Plan Active" : "Activate Private Safety Plan"}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
