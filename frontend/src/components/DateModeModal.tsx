"use client";
import { useDialog } from "@/hooks/useDialog";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DateRecommendation, MatchItem, DatePlanItem } from "@/lib/types";
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
  matches?: MatchItem[];
  currentUserId?: string;
  onClose: () => void;
  onProposeDateSuccess?: () => void;
}

export const DateModeModal: React.FC<DateModeModalProps> = ({
  matchId: initialMatchId,
  matches = [],
  currentUserId,
  onClose,
  onProposeDateSuccess,
}) => {
  const [latestPlan, setLatestPlan] = useState<DatePlanItem | null>(null);
  const [responding, setResponding] = useState(false);
  const [matchId, setMatchId] = useState(initialMatchId || "");
  const dialogRef = useDialog(true, onClose);
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
  const [createdDatePlanId, setCreatedDatePlanId] = useState<string | null>(null);

  // Safety plan state
  const [trustedName, setTrustedName] = useState("");
  const [trustedPhone, setTrustedPhone] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [safetyActive, setSafetyActive] = useState(false);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getDateRecommendations(selectedCity, selectedBudget);
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity, selectedBudget]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Load existing date proposal for match if available
  useEffect(() => {
    let cancelled = false;
    setCreatedDatePlanId(null);
    setLatestPlan(null);
    setProposedSuccess(false);
    setSafetyActive(false);
    if (matchId) {
      api.getLatestDatePlan(matchId)
        .then((plan) => {
          if (plan && !cancelled) {
            setCreatedDatePlanId(plan.id);
            setLatestPlan(plan);
          }
        })
        .catch((e) => {
          console.error("Failed to load match date plan", e);
        });
    }
    return () => { cancelled = true; };
  }, [matchId]);

  const handlePropose = async () => {
    if (!matchId || !selectedSpot || isProposing) return;
    setIsProposing(true);
    try {
      const planRes = await api.proposeDate({
        match_id: matchId,
        category: selectedSpot.category,
        venue_name: selectedSpot.venue_name,
        neighborhood: selectedSpot.neighborhood,
        budget_bracket: selectedSpot.budget_bracket,
        invitation_note: invitationNote.trim() || undefined,
      });
      if (planRes && planRes.id) {
        setCreatedDatePlanId(planRes.id);
        setLatestPlan(planRes);
      }
      setProposedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F43F5E", "#F59E0B", "#10B981"],
      });
      toast.success("Date Proposal Sent!", {
        description: `Invitation sent for ${selectedSpot.venue_name} (${selectedSpot.neighborhood}). You can now set up your Private Safety Plan.`,
      });
      if (onProposeDateSuccess) onProposeDateSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to propose date.");
    } finally {
      setIsProposing(false);
    }
  };

  const handleActivateSafety = async () => {
    if (!trustedName.trim() || !trustedPhone.trim()) {
      toast.error("Please provide trusted contact details.");
      return;
    }

    let planId = createdDatePlanId;
    if (!planId && matchId) {
      try {
        const plan = await api.getLatestDatePlan(matchId);
        if (plan) {
          planId = plan.id;
          setCreatedDatePlanId(plan.id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (!planId) {
      toast.error("Please propose a date first before activating a safety plan.");
      return;
    }

    try {
      await api.createSafetyPlan(planId, {
        trusted_contact_name: trustedName.trim(),
        trusted_contact_phone: trustedPhone.trim(),
        emergency_notes: emergencyNotes.trim() || undefined,
      });
      setSafetyActive(true);
      toast.success("Private Safety Plan Activated!", {
        description: `${trustedName} will receive a notification if check-in is missed.`,
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to activate safety plan.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Date plans and safety" tabIndex={-1}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-white border border-[#e6e1ed] rounded-t-[32px] sm:rounded-2xl w-full max-w-md p-6 text-[#262131] max-h-[92vh] overflow-y-auto shadow-sm flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e6e1ed] mb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <CalendarHeart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#262131] tracking-tight">Date Mode &amp; Safety</h3>
              <p className="text-xs text-slate-500 font-medium">Curated low-pressure dates in Sri Lanka</p>
            </div>
          </div>
          <button
            aria-label="Close date plans and safety" onClick={onClose}
            className="p-2 rounded-xl bg-[#f4f1f8] text-slate-500 hover:text-[#262131] transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {latestPlan && <section className="mb-4 rounded-xl bg-[#f5f2f8] p-4 text-sm" aria-label="Latest date invitation">
          <h4 className="font-semibold">{latestPlan.venue_name}</h4>
          <p className="mt-1">{latestPlan.invitation_note}</p>
          <p className="mt-2 capitalize">{latestPlan.status}</p>
          {latestPlan.status === "proposed" && latestPlan.proposed_by_id !== currentUserId && <div className="mt-3 flex gap-3">
            {[true, false].map(accept => <button key={String(accept)} disabled={responding} className="rounded-lg border border-[#d8cfdf] px-4 py-2 font-semibold disabled:opacity-50" onClick={async () => {
              setResponding(true);
              try { setLatestPlan(await api.respondToDate(latestPlan.id, accept)); toast.success(accept ? "Date accepted" : "Date declined"); }
              catch { toast.error("Couldn’t update this invitation. Please retry."); }
              finally { setResponding(false); }
            }}>{accept ? "Accept date" : "Decline"}</button>)}
          </div>}
        </section>}
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#f4f1f8] rounded-2xl border border-[#e6e1ed] mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("spots")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              activeTab === "spots"
                ? "bg-rose-500 mingle-filled text-[#262131] font-bold shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Curated Safe Spots
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === "safety"
                ? "bg-emerald-600 mingle-filled text-[#262131] font-bold shadow-md shadow-emerald-950/40"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Private Safety Plan</span>
          </button>
        </div>

        {/* Tab 1: Curated Spots */}
        {activeTab === "spots" && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl px-3 py-2 text-[#262131] text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Budget Bracket</label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl px-3 py-2 text-[#262131] text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
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
              <div className="text-center py-12 text-xs text-slate-500">Loading verified spots...</div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((spot, idx) => (
                  <div
                    key={idx}
                    className={`bg-[#f4f1f8] border rounded-2xl p-4 transition-all cursor-pointer active:scale-98 ${
                      selectedSpot?.venue_name === spot.venue_name
                        ? "border-rose-500/80 bg-rose-500/10 shadow-md"
                        : "border-[#e6e1ed] hover:border-[#e6e1ed]"
                    }`}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                          {spot.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#262131]">{spot.venue_name}</h4>
                        <div className="flex items-center space-x-1 text-slate-500 text-xs">
                          <MapPin className="w-3 h-3 text-rose-600" />
                          <span>{spot.neighborhood}, {spot.city}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#f4f1f8] border border-[#e6e1ed] text-[10px] text-slate-600 font-semibold shrink-0">
                        {spot.budget_bracket}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                      {spot.vibe_description}
                    </p>

                    <div className="bg-[#f4f1f8] rounded-xl p-2 text-[11px] text-emerald-700 flex items-start space-x-1.5 border border-emerald-900/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{spot.safety_highlights}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="block mt-5 text-sm font-semibold">Plan with
              <select aria-label="Plan with" value={matchId} onChange={(event) => setMatchId(event.target.value)} className="mt-2 w-full rounded-xl border border-[#e6e1ed] bg-white p-3">
                <option value="">Choose a connection</option>
                {matches.map((match) => <option key={match.id} value={match.id}>{match.target_profile?.first_name || "Connection"}</option>)}
              </select>
            </label>
            {matches.length === 0 && !matchId && <p className="mt-2 text-sm text-slate-600">Connect with someone first, then invite them to a date.</p>}
            {/* Proposal actions if a match is selected */}
            {matchId && selectedSpot && (
              <div className="pt-3 border-t border-[#e6e1ed] space-y-3 animate-fade-in">
                <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3">
                  <span className="text-[10px] text-amber-800 font-bold block mb-1 uppercase">
                    Proposing date at: {selectedSpot.venue_name}
                  </span>
                  <input
                    type="text"
                    value={invitationNote}
                    onChange={(e) => setInvitationNote(e.target.value)}
                    placeholder="Add an invitation note (e.g., Saturday afternoon?)"
                    className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl px-3 py-2 text-xs text-[#262131] placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {proposedSuccess ? (
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Date Proposal Sent!</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Your invitation for <strong>{selectedSpot.venue_name}</strong> was delivered. Set up your zero-shame safety plan now to notify a trusted contact if needed.
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => setActiveTab("safety")}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-[#262131] font-bold text-xs hover:opacity-95 shadow transition flex items-center justify-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Configure Safety Plan</span>
                      </button>
                      <button
                        aria-label="Close date plans and safety" onClick={onClose}
                        className="py-2 px-3 rounded-xl bg-[#f4f1f8] text-slate-600 hover:text-[#262131] text-xs font-semibold"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    disabled={isProposing}
                    onClick={handlePropose}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 text-[#262131] font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
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
              <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero-Shame Safety Plan</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Before meeting in person, register your trusted friend or family member. Your match will never know. If you do not check in, Mingle.lk will alert your contact.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Trusted Contact Name</label>
                <input
                  type="text"
                  value={trustedName}
                  onChange={(e) => setTrustedName(e.target.value)}
                  placeholder="e.g., Dilini (Best Friend)"
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl px-3 py-2 text-[#262131] text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Trusted Contact Phone Number</label>
                <input
                  type="text"
                  value={trustedPhone}
                  onChange={(e) => setTrustedPhone(e.target.value)}
                  placeholder="+94771234567"
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl px-3 py-2 text-[#262131] text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Private Venue & Time Notes</label>
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2.5 text-[#262131] text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleActivateSafety}
                className={`w-full py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition ${
                  safetyActive
                    ? "bg-emerald-600 mingle-filled text-[#262131]"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-[#262131] hover:opacity-95"
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
