"use client";

import React, { useState } from "react";
import { DiscoveryProfileItem, UserProfile } from "@/lib/types";
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
  Compass,
  Briefcase,
  GraduationCap,
  Languages,
  Coffee,
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
  // Modal state
  const [activeProfile, setActiveProfile] = useState<DiscoveryProfileItem | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<{
    type: "card" | "prompt" | "general";
    cardId?: string;
    cardKey?: string;
    promptKey?: string;
    label?: string;
  }>({ type: "general" });
  const [introNote, setIntroNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  const handleOpenConnectModal = (item: DiscoveryProfileItem, defaultAnchor?: any) => {
    setActiveProfile(item);
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
    if (!activeProfile) return;
    setIsSubmitting(true);
    try {
      await onSendConnection({
        receiver_id: activeProfile.profile.user_id,
        card_id: selectedAnchor.cardId,
        card_option_key: selectedAnchor.cardKey,
        prompt_key: selectedAnchor.promptKey,
        intro_note: introNote.trim() || undefined,
      });
      setSentSuccessId(activeProfile.profile.user_id);
      setActiveProfile(null);
      setIntroNote("");
    } catch (e: any) {
      alert(e.message || "Failed to send connection request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto">
      {/* Discovery Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-4 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            <span>Curated Sri Lankan Discovery</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {profiles.length} profiles available
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* City Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-medium">Region / City</label>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Sri Lanka</option>
              <option value="Colombo">Colombo (Western)</option>
              <option value="Kandy">Kandy (Central)</option>
              <option value="Galle">Galle (Southern)</option>
              <option value="Negombo">Negombo (Western)</option>
            </select>
          </div>

          {/* Intent Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-medium">Relationship Intent</label>
            <select
              value={selectedIntent}
              onChange={(e) => onIntentChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Intentions</option>
              <option value="Serious relationship">Serious relationship</option>
              <option value="Dating intentionally">Dating intentionally</option>
              <option value="Open to seeing where it goes">Open to seeing where it goes</option>
              <option value="New connections">New connections</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profiles Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 animate-pulse">
              <div className="h-72 bg-slate-800 rounded-2xl mb-4" />
              <div className="h-5 bg-slate-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-4" />
              <div className="h-20 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-rose-400">
            <Compass className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-white font-semibold text-base mb-1">Feed Reviewed for Today</h3>
          <p className="text-slate-400 text-xs mb-4">
            You've explored the available discovery profiles with current filters. Adjust your location or intention filters above to see more people!
          </p>
          <button
            onClick={() => {
              onCityChange("all");
              onIntentChange("all");
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {profiles.map((item) => {
            const p = item.profile;
            const primaryPhoto = p.photos.find((ph) => ph.is_primary)?.url || p.photos[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
            const isAlreadySent = sentSuccessId === p.user_id;

            return (
              <div
                key={p.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700/80 transition-all duration-300"
              >
                {/* Profile Hero Image & Basic Overlay */}
                <div className="relative h-96 w-full overflow-hidden bg-slate-950">
                  <img
                    src={primaryPhoto}
                    alt={p.first_name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Trust & Verification Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {p.is_phone_verified && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Phone Verified</span>
                      </span>
                    )}
                    {p.is_selfie_verified && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-semibold text-sky-300 border border-sky-500/30">
                        <CheckCircle2 className="w-3 h-3 text-sky-400" />
                        <span>Photo Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Compatibility Score Tag */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur text-white text-[11px] font-bold shadow-lg flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{Math.round(item.compatibility_score)}% Match</span>
                    </div>
                  </div>

                  {/* Main Identity on Image Bottom */}
                  <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                    <div className="flex items-baseline space-x-2">
                      <h2 className="text-2xl font-bold tracking-tight">{p.first_name}</h2>
                      <span className="text-xl font-normal text-slate-300">{p.age}</span>
                    </div>

                    {/* Approximate Neighborhood Location */}
                    <div className="flex items-center space-x-1 text-slate-300 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{p.neighborhood}</span>
                    </div>

                    {/* Occupation & Intent */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.occupation && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur text-[11px] text-slate-200 flex items-center space-x-1">
                          <Briefcase className="w-2.5 h-2.5" />
                          <span className="truncate">{p.occupation}</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium">
                        {p.relationship_intent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details & Compatibility Content */}
                <div className="p-4 space-y-4">
                  {/* Bio */}
                  {p.bio && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                      "{p.bio}"
                    </p>
                  )}

                  {/* Explainable Match Reasons */}
                  {item.match_reasons.length > 0 && (
                    <div className="bg-gradient-to-br from-rose-950/30 to-amber-950/20 border border-rose-900/30 rounded-2xl p-3">
                      <div className="flex items-center space-x-1.5 text-rose-300 text-xs font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Why you two match</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {item.match_reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Signature Feature: Interactive Connection Cards */}
                  {item.card_comparisons.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>Connection Cards</span>
                        <span className="text-[10px] text-slate-400 font-normal">Tap to start conversation</span>
                      </div>
                      <div className="space-y-2">
                        {item.card_comparisons.map((card) => (
                          <div
                            key={card.card_id}
                            onClick={() =>
                              handleOpenConnectModal(item, {
                                type: "card",
                                cardId: card.card_id,
                                cardKey: card.user_choice_key,
                                label: card.question,
                              })
                            }
                            className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                              card.is_identical
                                ? "bg-emerald-950/20 border-emerald-600/40 hover:border-emerald-500"
                                : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <span className="font-medium text-slate-200">{card.question}</span>
                              {card.is_identical && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                                  You both picked this!
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-rose-300 font-medium flex items-center space-x-1.5">
                              <span>👉 {card.target_choice_label}</span>
                            </div>
                            <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                              💬 Starter: "{card.conversation_starter}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompts Section */}
                  {p.prompt_answers.length > 0 && (
                    <div className="space-y-2">
                      {p.prompt_answers.map((prompt) => (
                        <div
                          key={prompt.id}
                          onClick={() =>
                            handleOpenConnectModal(item, {
                              type: "prompt",
                              promptKey: prompt.prompt_key,
                              label: prompt.prompt_question,
                            })
                          }
                          className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/50 rounded-2xl p-3 cursor-pointer transition"
                        >
                          <p className="text-[11px] font-medium text-amber-300 mb-1">
                            {prompt.prompt_question}
                          </p>
                          <p className="text-xs text-white leading-snug">{prompt.answer_text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shared Interests & Lifestyle */}
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {p.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium ${
                            item.shared_interests.includes(interest)
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Languages className="w-3 h-3 text-slate-400" />
                        <span>{p.languages.join(", ")}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate">{p.communication_style}</span>
                    </div>
                  </div>

                  {/* Action Button: Send Connection */}
                  <div className="pt-2">
                    {isAlreadySent ? (
                      <div className="w-full py-3 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Connection Request Sent</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenConnectModal(item)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-900/30 flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Send Connection Request</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connection Modal with Organic Icebreaker Anchor */}
      {activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 text-white max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-semibold text-sm">
                  Connect with {activeProfile.profile.first_name}
                </h3>
              </div>
              <button
                onClick={() => setActiveProfile(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Context Anchor Notice */}
              {selectedAnchor.label && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">
                    Connecting Over
                  </span>
                  <p className="text-slate-200">{selectedAnchor.label}</p>
                </div>
              )}

              {/* Suggested Icebreakers */}
              {activeProfile.suggested_starters.length > 0 && (
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                    Suggested Sri Lankan Icebreakers:
                  </span>
                  <div className="space-y-1.5">
                    {activeProfile.suggested_starters.map((starter, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIntroNote(starter)}
                        className="w-full text-left text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 p-2.5 rounded-xl text-slate-300 transition"
                      >
                        "{starter}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Opening Note (Optional, but increases response rate)
                </label>
                <textarea
                  value={introNote}
                  onChange={(e) => setIntroNote(e.target.value)}
                  placeholder="Share a thoughtful thought or ask about their favourite Colombo coffee spot..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Submit Button */}
              <button
                disabled={isSubmitting}
                onClick={handleSend}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs shadow-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Sending..." : "Send Connection Request"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
