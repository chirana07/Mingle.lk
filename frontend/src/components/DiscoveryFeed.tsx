"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DiscoveryProfileItem } from "@/lib/types";
import { DiscoveryFilterDrawer } from "@/components/DiscoveryFilterDrawer";
import { VoicePromptCard } from "@/components/VoicePromptCard";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Heart,
  Send,
  X,
  Briefcase,
  Info,
  Compass,
  SlidersHorizontal,
} from "lucide-react";

interface DiscoveryFeedProps {
  profiles: DiscoveryProfileItem[];
  isLoading: boolean;
  onSendConnection: (data: {
    receiver_id: string;
    card_id?: string;
    card_option_key?: string;
    prompt_key?: string;
    intro_note?: string;
  }) => Promise<void>;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedIntent: string;
  onIntentChange: (intent: string) => void;
  selectedLifestyle?: string;
  onLifestyleChange?: (lifestyle: string) => void;
  onResetFilters?: () => void;
  onRefresh: () => void;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  profiles,
  isLoading,
  onSendConnection,
  selectedCity,
  onCityChange,
  selectedIntent,
  onIntentChange,
  selectedLifestyle = "all",
  onLifestyleChange,
  onResetFilters,
  onRefresh,
}) => {
  const [detailProfile, setDetailProfile] = useState<DiscoveryProfileItem | null>(null);
  const [connectProfile, setConnectProfile] = useState<DiscoveryProfileItem | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [selectedAnchor, setSelectedAnchor] = useState<{
    type: "card" | "prompt" | "general";
    cardId?: string;
    cardKey?: string;
    label?: string;
  }>({ type: "general" });
  const [introNote, setIntroNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  const [passedProfileIds, setPassedProfileIds] = useState<Set<string>>(new Set());

  const visibleProfiles = profiles.filter((p) => !passedProfileIds.has(p.profile.user_id));

  const handlePass = (userId: string) => {
    setPassedProfileIds((prev) => new Set([...prev, userId]));
  };

  const handleOpenConnect = (item: DiscoveryProfileItem, defaultAnchor?: any) => {
    setConnectProfile(item);
    if (defaultAnchor) {
      setSelectedAnchor(defaultAnchor);
    } else if (item.card_comparisons.length > 0) {
      const topComp = item.card_comparisons[0];
      setSelectedAnchor({
        type: "card",
        cardId: topComp.card_id,
        cardKey: topComp.user_choice_key,
        label: topComp.question,
      });
      setIntroNote(topComp.conversation_starter);
    } else if (item.suggested_starters.length > 0) {
      setIntroNote(item.suggested_starters[0]);
      setSelectedAnchor({ type: "general" });
    } else {
      setSelectedAnchor({ type: "general" });
      setIntroNote("");
    }
  };

  const handleSend = async () => {
    if (!connectProfile) return;
    setIsSubmitting(true);
    try {
      await onSendConnection({
        receiver_id: connectProfile.profile.user_id,
        card_id: selectedAnchor.cardId,
        card_option_key: selectedAnchor.cardKey,
        intro_note: introNote.trim() || undefined,
      });
      setSentSuccessId(connectProfile.profile.user_id);
      toast.success(`Request sent to ${connectProfile.profile.first_name}!`, {
        description: "They will receive your opening note and profile.",
      });
      setConnectProfile(null);
      setDetailProfile(null);
      setIntroNote("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send connection request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto w-full">
      {/* Top Filter Bar with Slide-over Drawer Trigger & Active Tags (Issue #2) */}
      <div className="flex items-center space-x-2 pb-3.5 pt-1">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#101726] hover:bg-[#162034] text-white text-xs font-semibold flex items-center space-x-2 border border-white/[0.09] shadow-sm hover:border-white/[0.16] transition shrink-0 cursor-pointer active:scale-95"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
          <span>Filters</span>
          {(selectedCity !== "all" || selectedIntent !== "all" || selectedLifestyle !== "all") && (
            <span className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-950" />
          )}
        </button>

        {/* Active Filter Pill Tags */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
          {selectedCity !== "all" && (
            <span className="px-2.5 py-1 rounded-xl bg-[#101726] text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center space-x-1.5 shrink-0">
              <span>{selectedCity}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => onCityChange("all")} />
            </span>
          )}

          {selectedIntent !== "all" && (
            <span className="px-2.5 py-1 rounded-xl bg-[#101726] text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center space-x-1.5 shrink-0">
              <span className="truncate max-w-[120px]">{selectedIntent}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => onIntentChange("all")} />
            </span>
          )}

          {selectedLifestyle !== "all" && (
            <span className="px-2.5 py-1 rounded-xl bg-[#101726] text-sky-300 border border-sky-500/30 text-xs font-medium flex items-center space-x-1.5 shrink-0">
              <span className="truncate max-w-[120px]">{selectedLifestyle}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => onLifestyleChange?.("all")} />
            </span>
          )}

          {(selectedCity !== "all" || selectedIntent !== "all" || selectedLifestyle !== "all") && (
            <button
              onClick={() => onResetFilters?.()}
              className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 shrink-0 px-1 cursor-pointer font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Discovery Feed Profiles */}
      {isLoading ? (
        <div className="py-28 text-center">
          <div className="w-12 h-12 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Finding compatible Sri Lankan singles...</p>
        </div>
      ) : visibleProfiles.length === 0 ? (
        <div className="bg-[#0E1422] border border-white/[0.08] rounded-3xl p-8 text-center my-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Compass className="w-7 h-7 stroke-[1.8] text-rose-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">No Profiles Remaining</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
            You&apos;ve reviewed all active profiles matching your current filters.
          </p>
          <button
            onClick={() => {
              setPassedProfileIds(new Set());
              onResetFilters?.();
            }}
            className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-rose-950/50 cursor-pointer active:scale-95"
          >
            Reset Filters & View All
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleProfiles.map((item, idx) => {
            const p = item.profile;
            const primaryPhoto =
              p.photos.find((ph) => ph.is_primary)?.url ||
              p.photos[0]?.url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
            const isAlreadySent = sentSuccessId === p.user_id;

            const topCard = item.card_comparisons[0];
            const topReason = item.match_reasons[0];

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                className="group relative bg-[#0E1422] border border-white/[0.08] hover:border-white/[0.14] rounded-[28px] overflow-hidden shadow-2xl transition-all duration-300"
              >
                {/* Photo Hero */}
                <div
                  onClick={() => setDetailProfile(item)}
                  className="relative h-[440px] sm:h-[480px] w-full cursor-pointer overflow-hidden bg-slate-950 select-none"
                >
                  <img
                    src={primaryPhoto}
                    alt={p.first_name}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/35 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-1.5">
                      {p.is_phone_verified && (
                        <span className="px-3 py-1 rounded-full bg-[#090D16]/80 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.2]" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#090D16]/80 backdrop-blur-md text-white text-[11px] font-bold border border-rose-500/40 shadow-lg flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
                      <span className="text-rose-200">{Math.round(item.compatibility_score)}% Match</span>
                    </div>
                  </div>

                  {/* Identity at Bottom of Image */}
                  <div className="absolute bottom-4 inset-x-4 z-10">
                    <div className="flex items-baseline space-x-2.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {p.first_name}
                      </h2>
                      <span className="text-xl sm:text-2xl text-slate-300 font-light drop-shadow-sm">
                        {p.age}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-200 text-xs mt-1 drop-shadow font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 stroke-[2]" />
                      <span>{p.neighborhood || p.city}</span>
                    </div>

                    {/* Quick Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {p.occupation && (
                        <span className="px-2.5 py-1 rounded-xl bg-[#090D16]/80 backdrop-blur-md text-xs font-medium text-slate-200 border border-white/10 flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{p.occupation}</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 backdrop-blur-md text-rose-200 border border-rose-500/30 text-xs font-semibold">
                        {p.relationship_intent}
                      </span>
                    </div>

                    {/* Connection Hook */}
                    {topCard ? (
                      <div className="mt-3 p-3 rounded-2xl bg-[#090D16]/85 backdrop-blur-md border border-white/[0.09] flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          <span className="text-amber-400 font-bold text-base">✨</span>
                          <div className="truncate">
                            <span className="text-slate-400 block text-[11px] truncate font-medium">
                              {topCard.question}
                            </span>
                            <span className="text-white font-semibold text-xs truncate">
                              &ldquo;{topCard.target_choice_label}&rdquo;
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {topCard.is_identical ? "Identical Pick" : "Card Answer"}
                        </span>
                      </div>
                    ) : topReason ? (
                      <div className="mt-3 p-2.5 rounded-2xl bg-[#090D16]/85 backdrop-blur-md border border-white/[0.09] text-xs text-rose-300 flex items-center space-x-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{topReason}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 15s Voice Intro Preview Card on Profile (Issue #1) */}
                <div className="p-3.5 bg-[#0E1422] border-t border-white/[0.06]">
                  <VoicePromptCard
                    audioUrl={p.voice_intro_url}
                    promptTitle={p.voice_prompt_title || "How to pronounce my name & what it means"}
                    userName={p.first_name}
                  />
                </div>

                {/* Streamlined Action Bar */}
                <div className="p-3.5 bg-[#0A0F1A] border-t border-white/[0.06] flex items-center justify-between space-x-2.5">
                  <button
                    onClick={() => handlePass(p.user_id)}
                    className="p-3.5 rounded-2xl bg-[#162034] hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.08] transition-all active:scale-90 cursor-pointer shadow-sm"
                    title="Pass profile"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <button
                    onClick={() => setDetailProfile(item)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#162034] hover:bg-[#1C2A44] text-slate-200 hover:text-white font-semibold text-xs border border-white/[0.08] transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer shadow-sm"
                  >
                    <Info className="w-4 h-4 text-sky-400 stroke-[2]" />
                    <span>Story &amp; Prompts</span>
                  </button>

                  <button
                    disabled={isAlreadySent}
                    onClick={() => handleOpenConnect(item)}
                    className={`py-3 px-5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer ${
                      isAlreadySent
                        ? "bg-[#162034] text-emerald-400 border border-emerald-500/40 cursor-default"
                        : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-950/50"
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{isAlreadySent ? "Sent" : "Connect"}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slide-over Filter Drawer (Issue #2) */}
      <DiscoveryFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedDistrict={selectedCity}
        onDistrictChange={onCityChange}
        selectedIntent={selectedIntent}
        onIntentChange={onIntentChange}
        selectedLifestyle={selectedLifestyle}
        onLifestyleChange={onLifestyleChange || (() => { })}
        onResetAll={() => onResetFilters?.()}
        onApply={onRefresh}
      />

      {/* Full Profile & Story Sheet */}
      <AnimatePresence>
        {detailProfile && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#0E1424] border border-white/[0.09] rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto text-white p-5 sm:p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setDetailProfile(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#162034]/90 text-slate-400 hover:text-white border border-white/[0.08] z-10 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>

              <div className="relative h-72 rounded-2xl overflow-hidden mb-4 bg-slate-950">
                <img
                  src={
                    detailProfile.profile.photos[0]?.url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={detailProfile.profile.first_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1424] via-transparent to-transparent" />
                <div className="absolute bottom-3.5 left-4 text-white">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {detailProfile.profile.first_name}, {detailProfile.profile.age}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center space-x-1.5 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 stroke-[2]" />
                    <span>{detailProfile.profile.neighborhood || detailProfile.profile.city}</span>
                  </p>
                </div>
              </div>

              {/* Voice Intro in Modal */}
              <div className="mb-4">
                <VoicePromptCard
                  audioUrl={detailProfile.profile.voice_intro_url}
                  promptTitle={detailProfile.profile.voice_prompt_title || "How to pronounce my name & what it means"}
                  userName={detailProfile.profile.first_name}
                />
              </div>

              {/* Bio */}
              {detailProfile.profile.bio && (
                <div className="bg-[#12192C] border border-white/[0.06] rounded-2xl p-4 mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                    About Me
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    &ldquo;{detailProfile.profile.bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Match Reasons */}
              {detailProfile.match_reasons.length > 0 && (
                <div className="bg-[#162034]/70 border border-rose-500/25 rounded-2xl p-4 mb-5">
                  <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold mb-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Why you two match ({Math.round(detailProfile.compatibility_score)}%)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {detailProfile.match_reasons.map((r, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Primary Connect Action in Modal */}
              <button
                onClick={() => handleOpenConnect(detailProfile)}
                className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xl shadow-rose-950/50 flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Send Connection Note</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Note Modal */}
      <AnimatePresence>
        {connectProfile && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#0E1424] border border-white/[0.09] rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-sm tracking-tight">
                    Connect with {connectProfile.profile.first_name}
                  </h3>
                </div>
                <button
                  onClick={() => setConnectProfile(null)}
                  className="p-1.5 rounded-full bg-white/[0.06] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedAnchor.label && (
                <div className="bg-[#12192C] p-3 rounded-2xl border border-white/[0.06] text-xs mb-3.5 text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5 tracking-wider">
                    Anchored to:
                  </span>
                  {selectedAnchor.label}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Opening Note (Optional)
                </label>
                <textarea
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                  placeholder={`Say hi or answer their card prompt...`}
                  rows={3}
                  className="w-full bg-[#12192C] border border-white/[0.1] rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSend}
                className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Sending..." : "Send Connection Request"}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
