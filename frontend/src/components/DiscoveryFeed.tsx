"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DiscoveryProfileItem } from "@/lib/types";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Heart,
  MessageCircle,
  Filter,
  Send,
  X,
  Briefcase,
  ChevronDown,
  Info,
  Flame,
  ArrowRight,
  Compass,
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
  onRefresh,
}) => {
  // Active Profile Modal for Deep Story / Inspection
  const [detailProfile, setDetailProfile] = useState<DiscoveryProfileItem | null>(null);

  // Connect Modal state
  const [connectProfile, setConnectProfile] = useState<DiscoveryProfileItem | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<{
    type: "card" | "prompt" | "general";
    cardId?: string;
    cardKey?: string;
    label?: string;
  }>({ type: "general" });
  const [introNote, setIntroNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  // Hidden/Passed profile IDs in session
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
      {/* City & Intent Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
        {[
          { label: "All Lanka", value: "all" },
          { label: "Colombo", value: "Colombo" },
          { label: "Kandy", value: "Kandy" },
          { label: "Galle", value: "Galle" },
          { label: "Negombo", value: "Negombo" },
        ].map((c) => (
          <button
            key={c.value}
            onClick={() => onCityChange(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedCity === c.value
                ? "bg-rose-500 text-white shadow-rose-900/30"
                : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {c.label}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 shrink-0" />

        {[
          { label: "All Vibes", value: "all" },
          { label: "Intentional Dating", value: "Intentional dating" },
          { label: "Long-term", value: "Long-term with marriage mindset" },
          { label: "Exploring", value: "Open to exploring" },
        ].map((i) => (
          <button
            key={i.value}
            onClick={() => onIntentChange(i.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedIntent === i.value
                ? "bg-amber-500 text-slate-950 font-bold shadow-amber-900/30"
                : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* Discovery Feed Profiles */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Finding compatible Sri Lankan singles...</p>
        </div>
      ) : visibleProfiles.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-8 text-center my-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Profiles Remaining</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
            You've explored all active profiles matching your current filters.
          </p>
          <button
            onClick={() => {
              setPassedProfileIds(new Set());
              onCityChange("all");
              onIntentChange("all");
            }}
            className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-rose-950/40"
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

            // Highlight: Top connection card comparison if identical or top match reason
            const topCard = item.card_comparisons[0];
            const topReason = item.match_reasons[0];

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                className="group relative bg-slate-900 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-700/80"
              >
                {/* Clean Photo Hero */}
                <div
                  onClick={() => setDetailProfile(item)}
                  className="relative h-[440px] sm:h-[480px] w-full cursor-pointer overflow-hidden bg-slate-950"
                >
                  <img
                    src={primaryPhoto}
                    alt={p.first_name}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-1.5">
                      {p.is_phone_verified && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 shadow-sm">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur-md text-white text-[11px] font-bold shadow-lg flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{Math.round(item.compatibility_score)}% Match</span>
                    </div>
                  </div>

                  {/* Identity & Glanceable Info at Bottom of Image */}
                  <div className="absolute bottom-4 inset-x-4 z-10">
                    <div className="flex items-baseline space-x-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {p.first_name}
                      </h2>
                      <span className="text-xl sm:text-2xl text-slate-300 font-light drop-shadow-sm">
                        {p.age}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-200 text-xs mt-1 drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="font-medium">{p.neighborhood}</span>
                    </div>

                    {/* Quick Clean Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {p.occupation && (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-950/75 backdrop-blur-md text-xs font-medium text-slate-200 border border-white/10 flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{p.occupation}</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/25 backdrop-blur-md text-rose-200 border border-rose-500/30 text-xs font-medium">
                        {p.relationship_intent}
                      </span>
                    </div>

                    {/* Single Highlight Hook Pill */}
                    {topCard ? (
                      <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 truncate pr-2">
                          <span className="text-amber-400 font-bold text-sm">✨</span>
                          <div className="truncate">
                            <span className="text-slate-300 block text-[11px] truncate">
                              {topCard.question}
                            </span>
                            <span className="text-white font-semibold text-xs truncate">
                              "{topCard.target_choice_label}"
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {topCard.is_identical ? "Identical Pick" : "Card Answer"}
                        </span>
                      </div>
                    ) : topReason ? (
                      <div className="mt-3 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-rose-300 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{topReason}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Streamlined Action Bar (3 Clean Buttons) */}
                <div className="p-3 bg-slate-900 flex items-center justify-between space-x-2">
                  {/* Pass / Skip */}
                  <button
                    onClick={() => handlePass(p.user_id)}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-all active:scale-95"
                    title="Pass profile"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* View Details / Story */}
                  <button
                    onClick={() => setDetailProfile(item)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700/70 transition-all flex items-center justify-center space-x-1.5 active:scale-98"
                  >
                    <Info className="w-4 h-4 text-sky-400" />
                    <span>View Story & Cards</span>
                  </button>

                  {/* Connect */}
                  <button
                    disabled={isAlreadySent}
                    onClick={() => handleOpenConnect(item)}
                    className={`py-3 px-5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95 ${
                      isAlreadySent
                        ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default"
                        : "bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white shadow-rose-900/40"
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

      {/* Progressive Disclosure: Full Profile & Story Sheet */}
      <AnimatePresence>
        {detailProfile && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-white p-5 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setDetailProfile(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/90 text-slate-400 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo & Header */}
              <div className="relative h-64 rounded-2xl overflow-hidden mb-4 bg-slate-950">
                <img
                  src={
                    detailProfile.profile.photos[0]?.url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={detailProfile.profile.first_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-2xl font-bold">
                    {detailProfile.profile.first_name}, {detailProfile.profile.age}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{detailProfile.profile.neighborhood}</span>
                  </p>
                </div>
              </div>

              {/* Bio */}
              {detailProfile.profile.bio && (
                <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-4 mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    About Me
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{detailProfile.profile.bio}"
                  </p>
                </div>
              )}

              {/* Explainable Match Reasons */}
              {detailProfile.match_reasons.length > 0 && (
                <div className="bg-gradient-to-br from-rose-950/20 to-amber-950/20 border border-rose-900/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-center space-x-1.5 text-rose-300 text-xs font-semibold mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Why you two match ({Math.round(detailProfile.compatibility_score)}%)</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {detailProfile.match_reasons.map((r, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Connection Cards */}
              {detailProfile.card_comparisons.length > 0 && (
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-bold text-slate-200 block">
                    Interactive Connection Cards (Tap to Reply)
                  </span>
                  {detailProfile.card_comparisons.map((c) => (
                    <div
                      key={c.card_id}
                      onClick={() =>
                        handleOpenConnect(detailProfile, {
                          type: "card",
                          cardId: c.card_id,
                          cardKey: c.user_choice_key,
                          label: c.question,
                        })
                      }
                      className={`p-3 rounded-2xl border cursor-pointer transition hover:scale-[1.01] ${
                        c.is_identical
                          ? "bg-emerald-950/30 border-emerald-600/40 hover:border-emerald-500"
                          : "bg-slate-800/70 border-slate-700/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{c.question}</span>
                        {c.is_identical && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Same Answer ✨
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        They chose: <strong className="text-rose-300">{c.target_choice_label}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Passions & Interests */}
              {detailProfile.profile.interests.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-200 block mb-2">Passions & Hobbies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailProfile.profile.interests.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Connect Action in Modal */}
              <button
                onClick={() => handleOpenConnect(detailProfile)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition hover:opacity-95"
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
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-sm">
                    Connect with {connectProfile.profile.first_name}
                  </h3>
                </div>
                <button
                  onClick={() => setConnectProfile(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedAnchor.label && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mb-3 text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">
                    Anchored to:
                  </span>
                  {selectedAnchor.label}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Opening Note (Optional)
                </label>
                <textarea
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                  placeholder={`Say hi or answer their card prompt...`}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSend}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
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
