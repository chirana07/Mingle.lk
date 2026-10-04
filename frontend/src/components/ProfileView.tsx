"use client";

import React, { useState } from "react";
import { UserProfile, ConnectionCard } from "@/lib/types";
import { VoicePromptCard } from "@/components/VoicePromptCard";
import { VoicePromptRecorderModal } from "@/components/VoicePromptRecorderModal";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Briefcase,
  Sparkles,
  Lock,
  LogOut,
  Check,
  Mic,
  Crown,
  Eye,
  Zap,
  ChevronRight,
} from "lucide-react";

interface ProfileViewProps {
  profile: UserProfile | null;
  cards: ConnectionCard[];
  myCardAnswers: any[];
  onSaveCardAnswer: (cardId: string, optionKey: string) => Promise<void>;
  onUpdatePrivacy: (discoveryEnabled: boolean, showNeighborhoodOnly: boolean) => Promise<void>;
  onLogout: () => void;
  onOpenKathaPlus?: () => void;
  onOpenResponders?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  cards,
  myCardAnswers,
  onSaveCardAnswer,
  onUpdatePrivacy,
  onLogout,
  onOpenKathaPlus,
  onOpenResponders,
}) => {
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const [neighborhoodOnly, setNeighborhoodOnly] = useState(true);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  if (!profile) {
    return (
      <div className="pb-24 pt-6 px-4 max-w-md mx-auto text-center text-slate-400 text-xs">
        Profile loading or please log in to view your profile.
      </div>
    );
  }

  const primaryPhoto =
    profile.photos[0]?.url ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  const handleSelectCardOption = async (cardId: string, optionKey: string) => {
    setSavingCardId(cardId);
    try {
      await onSaveCardAnswer(cardId, optionKey);
      setActiveCardId(null);
    } catch (e: any) {
      alert("Failed to update card answer.");
    } finally {
      setSavingCardId(null);
    }
  };

  const handleToggleDiscovery = async (val: boolean) => {
    setDiscoveryEnabled(val);
    await onUpdatePrivacy(val, neighborhoodOnly);
  };

  const handleToggleNeighborhood = async (val: boolean) => {
    setNeighborhoodOnly(val);
    await onUpdatePrivacy(discoveryEnabled, val);
  };

  const handleSaveVoice = async (url: string, key: string, title: string) => {
    await api.saveVoicePrompt({
      voice_intro_url: url,
      voice_prompt_key: key,
      voice_prompt_title: title,
    });
    profile.voice_intro_url = url;
    profile.voice_prompt_key = key;
    profile.voice_prompt_title = title;
  };

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-4">
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="relative h-64 w-full bg-slate-950">
          <img src={primaryPhoto} alt={profile.first_name} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          {/* Verification Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {profile.is_phone_verified && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Phone Verified</span>
              </span>
            )}
            {profile.is_selfie_verified && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-[10px] font-semibold text-sky-300 border border-sky-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                <span>Selfie Verified</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3 -mt-6 relative z-10">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-bold text-white">{profile.first_name}, {profile.age}</h2>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{profile.neighborhood || profile.city}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.occupation && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 flex items-center space-x-1">
                <Briefcase className="w-2.5 h-2.5 text-slate-400" />
                <span>{profile.occupation}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/30">
              {profile.relationship_intent}
            </span>
          </div>

          {profile.bio && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              &quot;{profile.bio}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Katha Plus Membership & Entitlements (Issue #4) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-slate-900 border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm text-white">Katha Plus</h3>
                {profile.is_katha_plus ? (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Member
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LKR Micro-Pass
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                {profile.is_katha_plus
                  ? `Spotlight active in ${profile.spotlight_district || "Colombo"}`
                  : "Unlock extra cards, responder reveals & district spotlight"}
              </p>
            </div>
          </div>

          {onOpenKathaPlus && (
            <button
              onClick={onOpenKathaPlus}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
            >
              {profile.is_katha_plus ? "Manage" : "Upgrade"}
            </button>
          )}
        </div>

        {/* View Who Responded To Cards CTA */}
        {onOpenResponders && (
          <div
            onClick={onOpenResponders}
            className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Card Responders</span>
                <span className="text-[11px] text-slate-400">
                  {profile.is_katha_plus
                    ? "See who answered your Connection Cards"
                    : "Responders waiting • Unlock to reveal profiles"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* 15-Second Voice Intro Section (Issue #1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400">
            <Mic className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">15s Voice Intro</h3>
          </div>
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline"
          >
            {profile.voice_intro_url ? "Re-record" : "Record Voice"}
          </button>
        </div>

        <VoicePromptCard
          audioUrl={profile.voice_intro_url}
          promptTitle={profile.voice_prompt_title || "How to pronounce my name & what it means"}
          userName={profile.first_name}
        />
      </div>

      <VoicePromptRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSaveVoiceIntro={handleSaveVoice}
      />

      {/* Privacy & Discovery Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center space-x-2 text-rose-400">
          <Lock className="w-4 h-4" />
          <h3 className="font-bold text-sm text-white">Privacy & Discovery Mode</h3>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-white block">Discovery Mode</span>
              <span className="text-[11px] text-slate-400">Visible to compatible Sri Lankan members</span>
            </div>
            <input
              type="checkbox"
              checked={discoveryEnabled}
              onChange={(e) => handleToggleDiscovery(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <div>
              <span className="text-xs font-medium text-white block">Neighborhood Visibility Only</span>
              <span className="text-[11px] text-slate-400">Hides precise distance; displays &quot;Colombo 05&quot; only</span>
            </div>
            <input
              type="checkbox"
              checked={neighborhoodOnly}
              onChange={(e) => handleToggleNeighborhood(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* My Connection Cards Answers */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">My Connection Cards</h3>
          </div>
          <span className="text-[10px] text-slate-400">Tap to change answer</span>
        </div>

        <div className="space-y-2.5">
          {cards.map((card) => {
            const answer = myCardAnswers.find((a) => a.card_id === card.id);
            const isEditing = activeCardId === card.id;

            return (
              <div key={card.id} className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setActiveCardId(isEditing ? null : card.id)}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                      {card.category}
                    </span>
                    <h4 className="font-medium text-xs text-white">{card.question}</h4>
                  </div>
                  <span className="text-[10px] text-rose-400 font-semibold underline">
                    {isEditing ? "Close" : "Change"}
                  </span>
                </div>

                {!isEditing && (
                  <div className="mt-2 text-xs text-emerald-300 font-medium bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    Selected: {answer?.selected_option_label || "Not answered yet"}
                  </div>
                )}

                {isEditing && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-700">
                    {card.options.map((opt) => (
                      <button
                        key={opt.key}
                        disabled={savingCardId === card.id}
                        onClick={() => handleSelectCardOption(card.id, opt.key)}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${answer?.selected_option_key === opt.key
                          ? "bg-rose-600 text-white font-semibold"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                          }`}
                      >
                        <span>{opt.emoji} {opt.label}</span>
                        {answer?.selected_option_key === opt.key && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log Out of Katha</span>
      </button>
    </div>
  );
};
