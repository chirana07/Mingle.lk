"use client";
import { useDialog } from "@/hooks/useDialog";

import React, { useState, useEffect } from "react";
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
  Info,
  Compass,
  SlidersHorizontal,
  ArrowUpRight,
  Check,
  UserRound,
} from "lucide-react";

interface DiscoveryFeedProps {
  profiles: DiscoveryProfileItem[];
  noteTarget?: DiscoveryProfileItem | null;
  onNoteTargetHandled?: () => void;
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
  noteTarget,
  onNoteTargetHandled,
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
  const detailDialogRef = useDialog(!!detailProfile, () => setDetailProfile(null));
  const connectDialogRef = useDialog(!!connectProfile, () => setConnectProfile(null));
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [selectedAnchor, setSelectedAnchor] = useState<{
    type: "card" | "prompt" | "general";
    cardId?: string;
    cardKey?: string;
    label?: string;
  }>({ type: "general" });
  const [introNote, setIntroNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentProfileIds, setSentProfileIds] = useState<Set<string>>(new Set());

  const [passedProfileIds, setPassedProfileIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!noteTarget) return;
    setConnectProfile(noteTarget);
    setIntroNote("");
    setSelectedAnchor({ type: "general" });
    onNoteTargetHandled?.();
  }, [noteTarget, onNoteTargetHandled]);

  const visibleProfiles = profiles.filter((p) => !passedProfileIds.has(p.profile.user_id));

  const handlePass = (userId: string) => {
    setPassedProfileIds((prev) => new Set([...prev, userId]));
  };

  const handleOpenConnect = (item: DiscoveryProfileItem, defaultAnchor?: any) => {
    setConnectProfile(item);
    setIntroNote("");
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
    if (!connectProfile || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSendConnection({
        receiver_id: connectProfile.profile.user_id,
        card_id: selectedAnchor.cardId,
        card_option_key: selectedAnchor.cardKey,
        intro_note: introNote.trim() || undefined,
      });
      setSentProfileIds(prev => new Set([...prev, connectProfile.profile.user_id]));
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
    <div className="discovery-feed">
      <div className="feed-heading"><div><h1>Discover</h1><p>Find your kind of people.</p></div><button className="filter-button" onClick={() => setIsFilterDrawerOpen(true)}><SlidersHorizontal size={18} /><span>Filters</span>{[selectedCity, selectedIntent, selectedLifestyle].some(value => value !== "all") && <span className="filter-count">{[selectedCity, selectedIntent, selectedLifestyle].filter(value => value !== "all").length}</span>}</button></div>
      <div className="feed-tabs"><span className="selected">For you</span><span><MapPin size={14} />{selectedCity === "all" ? "Across Sri Lanka" : selectedCity}</span></div>
      {[selectedCity, selectedIntent, selectedLifestyle].some(value => value !== "all") && <div className="active-filters">
        {selectedCity !== "all" && <button onClick={() => onCityChange("all")} aria-label={`Remove ${selectedCity} filter`}>{selectedCity}<X size={14} /></button>}
        {selectedIntent !== "all" && <button onClick={() => onIntentChange("all")} aria-label="Remove intention filter">{selectedIntent}<X size={14} /></button>}
        {selectedLifestyle !== "all" && <button onClick={() => onLifestyleChange?.("all")} aria-label="Remove lifestyle filter">{selectedLifestyle}<X size={14} /></button>}
        <button onClick={onResetFilters}>Clear all</button>
      </div>}
      {visibleProfiles.length > 0 && <section className="people-strip" aria-label="Explore profiles">
        {visibleProfiles.slice(0, 8).map(item => <button key={item.profile.id} onClick={() => setDetailProfile(item)} aria-label={`View ${item.profile.first_name}'s profile`}>
          <span className="people-avatar">{item.profile.photos[0]?.url ? <img src={item.profile.photos[0].url} alt="" /> : <UserRound size={28} />}</span><span>{item.profile.first_name}</span>
        </button>)}
      </section>}

      {/* Discovery Feed Profiles */}
      {isLoading ? (
        <div className="feed-loading" role="status">
          <div className="w-12 h-12 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Finding compatible Sri Lankan singles...</p>
        </div>
      ) : visibleProfiles.length === 0 ? (
        <div className="feed-empty">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f2f8] border border-[#e6e1ed] flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Compass className="w-7 h-7 stroke-[1.8] text-rose-600" />
          </div>
          <h3 className="text-base font-bold text-[#262131] mb-1.5">You’re all caught up</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
            You&apos;ve reviewed all active profiles matching your current filters.
          </p>
          <button
            onClick={() => {
              setPassedProfileIds(new Set());
              onResetFilters?.();
            }}
            className="text-xs bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer active:scale-95"
          >
            Reset Filters & View All
          </button>
        </div>
      ) : (
        <div className="profile-posts">
          {visibleProfiles.map(item => {
            const p = item.profile;
            const photo = p.photos.find(ph => ph.is_primary)?.url || p.photos[0]?.url;
            const topCard = item.card_comparisons[0];
            const sent = sentProfileIds.has(p.user_id);
            return <article className="profile-post" key={p.id}>
              <header className="post-header">
                <button className="post-identity" onClick={() => setDetailProfile(item)}>
                  <span className="post-avatar">{photo ? <img src={photo} alt="" /> : <UserRound size={22} />}</span>
                  <span><strong>{p.first_name}, {p.age}{p.is_phone_verified && <ShieldCheck size={16} aria-label="Phone verified" />}</strong><small>{p.neighborhood || p.city}{p.occupation ? ` · ${p.occupation}` : ""}</small></span>
                </button>
                <button className="icon-button" onClick={() => handlePass(p.user_id)} aria-label={`Skip ${p.first_name}`} title="Skip profile"><X size={19} /></button>
              </header>
              <button className="post-photo" onClick={() => setDetailProfile(item)} aria-label={`Read ${p.first_name}'s story`}>
                {photo ? <img src={photo} alt={p.first_name} loading="lazy" /> : <span className="photo-placeholder"><UserRound size={56} /><span>Get to know {p.first_name}</span></span>}
                <span className="match-label"><Heart size={14} />{Math.round(item.compatibility_score)}% compatible</span>
                <span className="photo-intent">{p.relationship_intent}</span>
              </button>
              <div className="post-content">
                <div className="post-actions"><button className={`connect-action ${sent ? "sent" : ""}`} disabled={sent} onClick={() => handleOpenConnect(item)}>{sent ? <Check size={20} /> : <Heart size={20} />}<span>{sent ? "Request sent" : "Say Hello"}</span></button><button className="story-action" onClick={() => setDetailProfile(item)}><Info size={20} /><span>View profile</span></button><button className="icon-button" onClick={() => handleOpenConnect(item)} disabled={sent} aria-label={`Write a note to ${p.first_name}`}><Send size={21} /></button></div>
                {p.bio && <p className="post-bio"><strong>{p.first_name}</strong> {p.bio}</p>}
                {item.shared_interests.length > 0 && <p className="shared-interests">You both like {item.shared_interests.slice(0, 3).join(" · ")}</p>}
                {topCard ? <button className="shared-answer" onClick={() => handleOpenConnect(item)} disabled={sent}><span><small>{topCard.is_identical ? "Something in common" : "A conversation starter"}</small><strong>{topCard.question}</strong><span>{topCard.target_choice_label}</span></span><ArrowUpRight size={21} /></button> : item.match_reasons[0] ? <p className="match-reason"><Heart size={16} />{item.match_reasons[0]}</p> : null}
                {p.voice_intro_url && <div className="post-voice"><VoicePromptCard audioUrl={p.voice_intro_url} promptTitle={p.voice_prompt_title} userName={p.first_name} /></div>}
              </div>
            </article>;
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
            <motion.div ref={detailDialogRef} role="dialog" aria-modal="true" aria-label={`${detailProfile.profile.first_name}’s profile`} tabIndex={-1}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border border-[#e6e1ed] rounded-t-[32px] sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-[#262131] p-5 sm:p-6 shadow-sm relative"
            >
              <button
                aria-label="Close profile"
                onClick={() => setDetailProfile(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#f4f1f8] text-slate-500 hover:text-[#262131] border border-[#e6e1ed] z-10 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>

              <div className="relative h-72 rounded-2xl overflow-hidden mb-4 bg-[#f4f1f8]">
                {detailProfile.profile.photos[0]?.url ? (
                  <img
                    src={detailProfile.profile.photos[0].url}
                    alt={detailProfile.profile.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <UserRound size={64} strokeWidth={1.5} />
                    <span>No photo added</span>
                  </div>
                )}
                {detailProfile.profile.photos[0]?.url && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1424] via-transparent to-transparent" />
                )}
                <div
                  className={`absolute bottom-3.5 left-4 ${
                    detailProfile.profile.photos[0]?.url ? "photo-caption" : ""
                  }`}
                >
                  <h3 className="text-2xl font-bold tracking-tight">
                    {detailProfile.profile.first_name}, {detailProfile.profile.age}
                  </h3>
                  <p className="text-xs text-slate-600 flex items-center space-x-1.5 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 stroke-[2]" />
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
                <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-4 mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 tracking-wider">
                    About Me
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{detailProfile.profile.bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Match Reasons */}
              {detailProfile.match_reasons.length > 0 && (
                <div className="bg-[#f4f1f8] border border-rose-500/25 rounded-2xl p-4 mb-5">
                  <div className="flex items-center space-x-2 text-rose-700 text-xs font-semibold mb-2.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Why you two match ({Math.round(detailProfile.compatibility_score)}%)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
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
                className="w-full py-3.5 rounded-2xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer"
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
            <motion.div ref={connectDialogRef} role="dialog" aria-modal="true" aria-label={`Connect with ${connectProfile.profile.first_name}`} tabIndex={-1}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white border border-[#e6e1ed] rounded-t-[32px] sm:rounded-2xl w-full max-w-sm p-6 text-[#262131] shadow-sm"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e6e1ed] mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-sm tracking-tight">
                    Connect with {connectProfile.profile.first_name}
                  </h3>
                </div>
                <button
                  aria-label="Close connection note"
                  onClick={() => setConnectProfile(null)}
                  className="p-1.5 rounded-full bg-[#f5f2f8] text-slate-500 hover:text-[#262131] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedAnchor.label && (
                <div className="bg-[#f4f1f8] p-3 rounded-2xl border border-[#e6e1ed] text-xs mb-3.5 text-slate-600">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5 tracking-wider">
                    Anchored to:
                  </span>
                  {selectedAnchor.label}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="opening-note" className="block text-xs text-slate-600 font-semibold mb-1.5">
                  Opening Note (Optional)
                </label>
                <textarea id="opening-note"
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                  placeholder={`Say hi or answer their card prompt...`}
                  rows={3}
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3 text-xs text-[#262131] placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSend}
                className="w-full py-3.5 rounded-2xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer active:scale-95"
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
