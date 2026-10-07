"use client";

import React, { useState, useEffect } from "react";
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
  privacy?: { discovery_enabled?: boolean; show_neighborhood_only?: boolean };
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
  privacy,
  cards,
  myCardAnswers,
  onSaveCardAnswer,
  onUpdatePrivacy,
  onLogout,
  onOpenKathaPlus,
  onOpenResponders,
}) => {
  const [discoveryEnabled, setDiscoveryEnabled] = useState(privacy?.discovery_enabled ?? true);
  const [neighborhoodOnly, setNeighborhoodOnly] = useState(privacy?.show_neighborhood_only ?? true);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [localVoiceUrl, setLocalVoiceUrl] = useState<string | undefined>(profile?.voice_intro_url);
  const [localVoiceTitle, setLocalVoiceTitle] = useState<string | undefined>(profile?.voice_prompt_title);

  if (!profile) {
    return (
      <div className="pb-24 pt-12 px-4 max-w-md mx-auto text-center text-slate-500 text-xs">
        <div className="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-3" />
        Loading your Mingle.lk profile...
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
    } catch {
      alert("Failed to update card answer.");
    } finally {
      setSavingCardId(null);
    }
  };

  const handleToggleDiscovery = async (val: boolean) => {
    try { await onUpdatePrivacy(val, neighborhoodOnly); setDiscoveryEnabled(val); }
    catch { alert("Couldn’t save your privacy setting. Please try again."); }
  };

  const handleToggleNeighborhood = async (val: boolean) => {
    try { await onUpdatePrivacy(discoveryEnabled, val); setNeighborhoodOnly(val); }
    catch { alert("Couldn’t save your privacy setting. Please try again."); }
  };

  const handleSaveVoice = async (url: string, key: string, title: string) => {
    await api.saveVoicePrompt({
      voice_intro_url: url,
      voice_prompt_key: key,
      voice_prompt_title: title,
    });
    setLocalVoiceUrl(url);
    setLocalVoiceTitle(title);
  };

  return (
    <div className="pb-28 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Profile Hero Card */}
      <div className="bg-white border border-[#e6e1ed] rounded-2xl overflow-hidden shadow-sm">
        <div className="relative h-72 w-full bg-[#f4f1f8]">
          <img src={primaryPhoto} alt={profile.first_name} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1422] via-[#0E1422]/20 to-transparent" />

          {/* Verification Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
            {profile.is_phone_verified && (
              <span className="px-3 py-1 rounded-full bg-white backdrop-blur-md text-[11px] font-semibold text-emerald-700 border border-emerald-500/30 flex items-center space-x-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.2]" />
                <span>Phone Verified</span>
              </span>
            )}
            {profile.is_selfie_verified && (
              <span className="px-3 py-1 rounded-full bg-white backdrop-blur-md text-[11px] font-semibold text-sky-700 border border-sky-500/30 flex items-center space-x-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 stroke-[2.2]" />
                <span>Selfie Verified</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-3 relative">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#262131] tracking-tight">
              {profile.first_name}, {profile.age}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 stroke-[2]" />
            <span>{profile.neighborhood || profile.city}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.occupation && (
              <span className="px-3 py-1 rounded-xl bg-[#f4f1f8] text-xs font-medium text-slate-700 border border-[#e6e1ed] flex items-center space-x-1.5">
                <Briefcase className="w-3 h-3 text-slate-500" />
                <span>{profile.occupation}</span>
              </span>
            )}
            <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-700 text-xs font-semibold border border-rose-500/30">
              {profile.relationship_intent}
            </span>
          </div>

          {profile.bio && (
            <p className="text-xs text-slate-600 leading-relaxed bg-[#f4f1f8] p-3.5 rounded-2xl border border-[#e6e1ed] italic">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Mingle Plus Membership & Entitlements (Issue #4) */}
      <div className="bg-[#f1eaf9] border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Crown className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-[#262131] tracking-tight">Mingle Plus</h3>
                {profile.is_katha_plus ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                    Active Member
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30">
                    LKR Micro-Pass
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">
                {profile.is_katha_plus
                  ? `Spotlight active in ${profile.spotlight_district || "Colombo"}`
                  : "Extra cards, responder reveals & district spotlight"}
              </p>
            </div>
          </div>

          {onOpenKathaPlus && (
            <button
              onClick={onOpenKathaPlus}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              {profile.is_katha_plus ? "Manage" : "Upgrade"}
            </button>
          )}
        </div>

        {/* View Who Responded To Cards CTA */}
        {onOpenResponders && (
          <div
            onClick={onOpenResponders}
            className="p-3.5 bg-white border border-[#e6e1ed] hover:border-amber-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center">
                <Eye className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#262131] block">Card Responders</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {profile.is_katha_plus
                    ? "See who answered your Connection Cards"
                    : "Responders waiting • Unlock to reveal profiles"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        )}
      </div>

      {/* 15-Second Voice Intro Section (Issue #1) */}
      <div className="bg-white border border-[#e6e1ed] rounded-2xl p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-600">
            <Mic className="w-4 h-4 stroke-[2.2]" />
            <h3 className="font-bold text-sm text-[#262131] tracking-tight">15s Voice Intro</h3>
          </div>
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2 cursor-pointer"
          >
            {localVoiceUrl ? "Re-record" : "Record Voice"}
          </button>
        </div>

        <VoicePromptCard
          audioUrl={localVoiceUrl}
          promptTitle={localVoiceTitle || "How to pronounce my name & what it means"}
          userName={profile.first_name}
        />
      </div>

      <VoicePromptRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSaveVoiceIntro={handleSaveVoice}
      />

      {/* Privacy & Discovery Controls */}
      <div className="bg-white border border-[#e6e1ed] rounded-2xl p-5 shadow-sm space-y-3.5">
        <div className="flex items-center space-x-2 text-rose-600">
          <Lock className="w-4 h-4 stroke-[2.2]" />
          <h3 className="font-bold text-sm text-[#262131] tracking-tight">Privacy &amp; Discovery Controls</h3>
        </div>

        <div className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#262131] block">Discovery Mode</span>
              <span className="text-[11px] text-slate-500">Visible to compatible Sri Lankan members</span>
            </div>
            <input
              type="checkbox"
              checked={discoveryEnabled}
              onChange={(e) => handleToggleDiscovery(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#e6e1ed] pt-3">
            <div>
              <span className="text-xs font-semibold text-[#262131] block">Neighborhood Visibility Only</span>
              <span className="text-[11px] text-slate-500">Hides exact distance; shows &ldquo;Colombo 05&rdquo; only</span>
            </div>
            <input
              type="checkbox"
              checked={neighborhoodOnly}
              onChange={(e) => handleToggleNeighborhood(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* My Connection Cards Answers */}
      <div className="bg-white border border-[#e6e1ed] rounded-2xl p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-700">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#262131] tracking-tight">My Connection Cards</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Tap to change answer</span>
        </div>

        <div className="space-y-3">
          {cards.map((card) => {
            const answer = myCardAnswers.find((a: any) => a.card_id === card.id);
            const isEditing = activeCardId === card.id;

            return (
              <div key={card.id} className="bg-[#f4f1f8] border border-[#e6e1ed] hover:border-[#e6e1ed] rounded-2xl p-4 transition-all">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setActiveCardId(isEditing ? null : card.id)}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5 tracking-wider">
                      {card.category}
                    </span>
                    <h4 className="font-semibold text-xs text-[#262131] leading-snug">{card.question}</h4>
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold underline underline-offset-2 ml-2 shrink-0">
                    {isEditing ? "Close" : "Change"}
                  </span>
                </div>

                {!isEditing && (
                  <div className="mt-2.5 text-xs text-emerald-700 font-medium bg-white p-2.5 rounded-xl border border-[#e6e1ed] flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Selected: {answer?.selected_option_label || "Not answered yet"}</span>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-3 space-y-1.5 pt-2.5 border-t border-[#e6e1ed]">
                    {card.options.map((opt) => (
                      <button
                        key={opt.key}
                        disabled={savingCardId === card.id}
                        onClick={() => handleSelectCardOption(card.id, opt.key)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer active:scale-98 ${
                          answer?.selected_option_key === opt.key
                            ? "bg-rose-500 mingle-filled text-[#262131] font-bold shadow-md"
                            : "bg-white text-slate-600 hover:bg-[#f4f1f8] hover:text-[#262131]"
                        }`}
                      >
                        <span>{opt.emoji} {opt.label}</span>
                        {answer?.selected_option_key === opt.key && <Check className="w-4 h-4 stroke-[2.5]" />}
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
        className="w-full py-3.5 rounded-2xl bg-white hover:bg-[#f4f1f8] border border-[#e6e1ed] text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer active:scale-98"
      >
        <LogOut className="w-3.5 h-3.5 stroke-[2]" />
        <span>Log Out of Mingle.lk</span>
      </button>
    </div>
  );
};
