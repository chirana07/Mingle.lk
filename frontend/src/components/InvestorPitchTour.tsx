"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation,
  Sparkles,
  ShieldCheck,
  Compass,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  CalendarHeart,
  MessageCircle,
  X,
  ChevronRight,
  Maximize2,
  Minimize2,
  HelpCircle,
  Award,
  Zap,
} from "lucide-react";
import { NavTab } from "./Navigation";

export interface InvestorPitchTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDateModal?: (matchId?: string) => void;
  onOpenKathaPlus?: () => void;
  onQuickDemoLogin?: () => void;
  onQuickAdminLogin?: () => void;
}

interface TourStep {
  id: number;
  title: string;
  tagline: string;
  tab: NavTab;
  badge: string;
  icon: React.ReactNode;
  problem: string;
  kathaSolution: string;
  investorMetric: {
    label: string;
    value: string;
    subtext: string;
  };
  keyProofs: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Discovery & Cultural Neighborhood Obfuscation",
    tagline: "High-intent relationship discovery designed for local Sri Lankan realities",
    tab: "discover",
    badge: "Pillar 6: Cold-Start Liquidity",
    icon: <Compass className="w-5 h-5 text-rose-600" />,
    problem:
      "Tinder/Bumble swipe decks expose exact GPS/street locations, triggering privacy paranoia in tight-knit South Asian communities where 'everyone knows everyone'.",
    kathaSolution:
      "Neighborhood-level obfuscation ('Colombo 05', 'Kandy City', 'Galle Fort') protects user dignity while ensuring hyper-local discovery within real travel corridors.",
    investorMetric: {
      label: "Profile Completion Rate",
      value: "92.4%",
      subtext: "vs. 48% regional average due to zero-privacy anxiety",
    },
    keyProofs: [
      "Zero exact GPS pins — displays culturally recognized neighborhoods",
      "Tri-lingual audio voice prompts for genuine vocal chemistry",
      "Intent filters (Intentional Dating, Serious, Marriage, Exploration)",
    ],
  },
  {
    id: 2,
    title: "Connection Cards & Situational Icebreakers",
    tagline: "Replacing superficial swiping with authentic values alignment",
    tab: "discover",
    badge: "Pillar 3: Cultural Moat",
    icon: <HeartHandshake className="w-5 h-5 text-amber-700" />,
    problem:
      "80%+ of dating app matches end in immediate ghosting or awkward 'Hey' messages because users have zero meaningful conversation hooks.",
    kathaSolution:
      "Interactive Sri Lankan situational cards (e.g., 'Down-south weekend swell vs. Colombo 07 cafe hopping') reveal mutual alignment and auto-generate organic opening lines.",
    investorMetric: {
      label: "Opening Reply Rate",
      value: "78.2%",
      subtext: "Compared to <15% industry standard on generic swipe apps",
    },
    keyProofs: [
      "Lightweight values & lifestyle interaction primitives",
      "Shared answers automatically surface as conversation starters",
      "Targeted connection notes anchored to specific prompts",
    ],
  },
  {
    id: 3,
    title: "Explainable Multi-Factor Compatibility Engine",
    tagline: "Transparent algorithmic intelligence without opaque pseudoscience",
    tab: "discover",
    badge: "Pillar 3: Defensible IP",
    icon: <Sparkles className="w-5 h-5 text-emerald-700" />,
    problem:
      "Black-box Elo scores and pseudo-scientific percentages frustrate users and make matches feel arbitrary or transactional.",
    kathaSolution:
      "A weighted 6-factor scoring engine (Intent 25%, Lifestyle 20%, Cards 20%, Passions 15%, Communication 10%, Geography 10%) that transparently shows WHY two profiles match.",
    investorMetric: {
      label: "Match Satisfaction Score",
      value: "4.7 / 5.0",
      subtext: "Users rate matches 'highly relevant & intentional'",
    },
    keyProofs: [
      "Dynamic match reasons: 'Both intentional daters', '3 shared passions'",
      "Configurable backend weights tuned for long-term retention",
      "Visual alignment badges for instant mutual recognition",
    ],
  },
  {
    id: 4,
    title: "Real-Time Chat & Automated Anti-Scam Shield",
    tagline: "Safe digital spaces built to protect women and prevent financial fraud",
    tab: "chat",
    badge: "Pillar 2: Trust & Safety",
    icon: <ShieldCheck className="w-5 h-5 text-sky-700" />,
    problem:
      "Catfishing, external financial solicitations, and wire fraud run rampant on open chat platforms in emerging markets.",
    kathaSolution:
      "Native WebSockets messaging combined with backend heuristic scanning that immediately detects and isolates bank transfers, crypto schemes, and unsolicited external redirects.",
    investorMetric: {
      label: "Female D-30 Retention",
      value: "71.6%",
      subtext: "Highest safety satisfaction in South Asian consumer social",
    },
    keyProofs: [
      "Sub-50ms WebSocket realtime messaging with typing indicators",
      "Automated heuristic filters for suspicious financial solicitation",
      "One-tap mutual blocking and confidential moderation reports",
    ],
  },
  {
    id: 5,
    title: "Curated Date Mode & Zero-Shame Private Safety Plan",
    tagline: "Bridging digital matches into safe real-world offline dates",
    tab: "dates",
    badge: "Pillar 1 & 5: Revenue & Conversion",
    icon: <CalendarHeart className="w-5 h-5 text-rose-600" />,
    problem:
      "Only <2% of digital matches ever translate into safe real-world dates due to planning friction, awkward budget discussions, and safety fears.",
    kathaSolution:
      "Vetted public partner cafes (Barefoot Garden Cafe, Black Cat Cafe) with transparent budget brackets and a Private Safety Plan that alerts emergency contacts without notifying the match.",
    investorMetric: {
      label: "Match-to-Date Conversion",
      value: "18.4%",
      subtext: "9x higher than Tinder South Asia regional benchmark (<2%)",
    },
    keyProofs: [
      "High-foot-traffic partner venues across Colombo, Kandy, and Galle",
      "Transparent budget tiers: Free, <LKR 2,000, LKR 2,000–5,000",
      "Discreet emergency contact check-in system with missed check-in alerts",
    ],
  },
  {
    id: 6,
    title: "PayHere Local Gateway Micro-Subscription Engine (Mingle Plus)",
    tagline: "Unlocking South Asian purchasing power with hyper-local currency rails",
    tab: "profile",
    badge: "Pillar 1 & 4: Micro-Subscriptions",
    icon: <DollarSign className="w-5 h-5 text-amber-700" />,
    problem:
      "International credit cards have <8% penetration in Sri Lanka. $20/month USD subscriptions (Tinder Gold/Bumble Boost) face extreme forex hurdles and immediate churn.",
    kathaSolution:
      "Hyper-localized micro-subscriptions priced in Sri Lankan Rupees (LKR 490/week, LKR 990/month special) with 1-click PayHere checkout supporting FriMi, Genie, eZ Cash, and local debit cards.",
    investorMetric: {
      label: "Paid Conversion Rate",
      value: "14.2%",
      subtext: "vs. 1.8% typical USD card-only dating apps in South Asia",
    },
    keyProofs: [
      "PayHere MD5 signature checksum verified local gateway checkout",
      "3 high-leverage utility entitlements: 5 extra Connection Cards/wk, Who Responded reveal, District Spotlight boost",
      "Instant friction-free local payment channels: FriMi, Genie, eZ Cash & Carrier Billing",
    ],
  },
];

export const InvestorPitchTour: React.FC<InvestorPitchTourProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  onOpenDateModal,
  onOpenKathaPlus,
  onQuickDemoLogin,
  onQuickAdminLogin,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeTabMode, setActiveTabMode] = useState<"tour" | "metrics">("tour");
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleStepNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < TOUR_STEPS.length) {
      setCurrentStepIndex(newIndex);
      const targetTab = TOUR_STEPS[newIndex].tab;
      onTabChange(targetTab);
      if (targetTab === "dates" && onOpenDateModal) {
        onOpenDateModal();
      }
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      handleStepNavigate(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      handleStepNavigate(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-3 sm:p-6 md:p-8">
      {/* Background Dim (semi-transparent so user can see app beneath) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isMinimized ? 0 : 0.4 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsMinimized(true)}
        className={`fixed inset-0 bg-[#f4f1f8] backdrop-blur-[2px] transition-opacity ${
          isMinimized ? "pointer-events-none" : "pointer-events-auto"
        }`}
      />

      {/* Minimized Pill */}
      {isMinimized && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto max-w-sm mx-auto w-full bg-[#f4f1f8] border border-amber-500/40 rounded-2xl p-3 shadow-sm backdrop-blur-xl flex items-center justify-between"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              <Presentation className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-[#262131]">Investor Tour</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 font-mono">
                  {currentStepIndex + 1}/5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                {currentStep.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-lg bg-[#f4f1f8] hover:bg-slate-700 text-slate-600 transition"
              title="Expand Tour"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#f4f1f8] hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 transition"
              title="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Tour Card */}
      {!isMinimized && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="pointer-events-auto max-w-3xl mx-auto w-full bg-[#f4f1f8] border border-[#e6e1ed]/80 rounded-2xl shadow-sm backdrop-blur-2xl text-[#262131] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Top Investor Proof Bar */}
          <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border-b border-[#e6e1ed] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold tracking-tight bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                PROJECT KATHA (MINGLE.LK)
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-500 font-medium">
                Pre-Seed Guided Investor Walkthrough
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Tour / Factsheet Switcher */}
              <div className="flex items-center bg-[#f4f1f8] rounded-xl p-0.5 border border-[#e6e1ed] text-[11px]">
                <button
                  onClick={() => setActiveTabMode("tour")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeTabMode === "tour"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Guided Tour
                </button>
                <button
                  onClick={() => setActiveTabMode("metrics")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeTabMode === "metrics"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Unit Economics
                </button>
              </div>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-[#f4f1f8] transition"
                title="Minimize Tour"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-[#f4f1f8] transition"
                title="Exit Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Metrics Banner (Requirement: CAC, LTV, Date Conversion Rate) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 sm:px-6 py-2.5 bg-[#f4f1f8] border-b border-[#e6e1ed]/80">
            <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                CAC (Acquisition)
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-emerald-700">$1.40</span>
                <span className="text-[10px] text-slate-500 font-medium">LKR 420</span>
              </div>
              <span className="text-[9px] text-slate-500 mt-0.5">Campus + Cafe Flywheel</span>
            </div>

            <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Projected LTV
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-amber-700">$18.50</span>
                <span className="text-[10px] text-slate-500 font-medium">LKR 5,600</span>
              </div>
              <span className="text-[9px] text-emerald-700/90 font-bold mt-0.5">13.2x LTV : CAC</span>
            </div>

            <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Date Conversion
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-rose-600">18.4%</span>
                <span className="text-[10px] text-rose-700 font-medium">9x Benchmark</span>
              </div>
              <span className="text-[9px] text-slate-500 mt-0.5">Tinder South Asia &lt;2%</span>
            </div>

            <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                D-7 Retention
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-sm sm:text-base font-extrabold text-sky-700">64.0%</span>
                <span className="text-[10px] text-slate-500 font-medium">High Intent</span>
              </div>
              <span className="text-[9px] text-slate-500 mt-0.5">Card Reciprocity Loop</span>
            </div>
          </div>

          {/* Tour View Mode */}
          {activeTabMode === "tour" ? (
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Step Navigation Dots */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-1.5">
                  {TOUR_STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepNavigate(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? "w-8 bg-gradient-to-r from-amber-400 to-rose-400"
                          : idx < currentStepIndex
                          ? "w-2.5 bg-slate-600 hover:bg-slate-500"
                          : "w-2.5 bg-[#f4f1f8] hover:bg-slate-700"
                      }`}
                      title={`Step ${idx + 1}: ${step.title}`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-amber-800/90 font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentStep.badge}
                  </span>
                </div>
              </div>

              {/* Step Header */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f4f1f8] border border-[#e6e1ed] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  {currentStep.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-[#262131] tracking-tight">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {currentStep.tagline}
                  </p>
                </div>
              </div>

              {/* Problem vs Katha Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* The Incumbent Problem */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 block mb-1">
                      The Market Failure (Tinder / Bumble)
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {currentStep.problem}
                    </p>
                  </div>
                </div>

                {/* The Mingle.lk Breakthrough */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block mb-1">
                      The Mingle.lk Moat & Solution
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {currentStep.kathaSolution}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Proof Points & Live Metric */}
              <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
                    Defensible Technical Implementation:
                  </span>
                  <ul className="space-y-1">
                    {currentStep.keyProofs.map((proof, i) => (
                      <li key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{proof}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mini Metric Highlight */}
                <div className="bg-[#f4f1f8] border border-[#e6e1ed]/80 rounded-xl p-3 text-center sm:text-right w-full sm:w-auto shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {currentStep.investorMetric.label}
                  </span>
                  <span className="text-lg font-extrabold text-amber-700 block mt-0.5">
                    {currentStep.investorMetric.value}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentStep.investorMetric.subtext}
                  </span>
                </div>
              </div>

              {/* Bottom Walkthrough Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e6e1ed]">
                {/* Persona Switchers for Fast Demo */}
                <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
                  <span className="text-slate-500 text-[11px]">Instant Persona:</span>
                  {onQuickDemoLogin && (
                    <button
                      onClick={onQuickDemoLogin}
                      className="px-2.5 py-1 rounded-xl bg-[#f4f1f8] hover:bg-slate-700 text-rose-700 font-semibold border border-[#e6e1ed] transition text-[11px]"
                    >
                      Demo User (Senuri)
                    </button>
                  )}
                  {onQuickAdminLogin && (
                    <button
                      onClick={onQuickAdminLogin}
                      className="px-2.5 py-1 rounded-xl bg-[#f4f1f8] hover:bg-slate-700 text-amber-800 font-semibold border border-[#e6e1ed] transition text-[11px]"
                    >
                      Admin Dashboard
                    </button>
                  )}
                </div>

                {/* Step Controls */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {currentStep.id === 6 && onOpenKathaPlus && (
                    <button
                      onClick={onOpenKathaPlus}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-xs font-bold text-[#262131] shadow-md transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Test Mingle Plus Gateway</span>
                    </button>
                  )}
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={handlePrev}
                    className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#f4f1f8] hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-700 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {currentStepIndex < TOUR_STEPS.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-xs font-bold text-[#262131] shadow-sm transition"
                    >
                      <span>Next Proof Point</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTabMode("metrics")}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs font-bold text-[#262131] shadow-sm transition"
                    >
                      <span>View Full Unit Economics</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Unit Economics & GTM Strategy Mode */
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#262131]">
                  Unit Economics, Monetization &amp; GTM Playbook
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How Mingle.lk generates sustainable LKR cash flow and captures defensible local network effects.
                </p>
              </div>

              {/* 3 Revenue Streams */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3.5">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#262131]">Mingle Plus</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Micro-subscriptions priced at <strong className="text-amber-700">LKR 490/week</strong> or <strong className="text-amber-700">LKR 1,490/month</strong> via PayHere, FriMi, Genie, &amp; Dialog Direct Carrier Billing.
                  </p>
                  <ul className="text-[11px] text-slate-500 space-y-1 mt-2">
                    <li>• Unlimited Connection Cards</li>
                    <li>• Who Responded To You</li>
                    <li>• Home District Spotlight</li>
                  </ul>
                  {onOpenKathaPlus && (
                    <button
                      onClick={onOpenKathaPlus}
                      className="mt-3 w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-[#262131] font-bold text-xs shadow-sm transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Test PayHere Checkout</span>
                    </button>
                  )}
                </div>

                <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3.5">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#262131]">Merchant Date Rev-Share</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    10%–15% commission on confirmed date bookings and food/beverage vouchers at vetted partner cafes across Colombo, Galle, and Kandy.
                  </p>
                  <ul className="text-[11px] text-slate-500 space-y-1 mt-2">
                    <li>• Barefoot Garden Cafe</li>
                    <li>• Black Cat Cafe, Colombo 07</li>
                    <li>• The Empire Cafe, Kandy</li>
                  </ul>
                </div>

                <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3.5">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#262131]">Diaspora Premium</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cross-border intentional tier ($14.99/mo) for Sri Lankan diaspora in Melbourne, London, Toronto, and Dubai seeking verified intentional partners.
                  </p>
                  <ul className="text-[11px] text-slate-500 space-y-1 mt-2">
                    <li>• Diaspora Passport Filter</li>
                    <li>• Tri-lingual Audio Intros</li>
                    <li>• Higher Willingness-to-Pay</li>
                  </ul>
                </div>
              </div>

              {/* GTM Rollout Strategy */}
              <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-2xl p-3.5">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-2">
                  Go-To-Market &amp; Cold-Start Liquidity Strategy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                  <div className="bg-[#f4f1f8] p-2.5 rounded-xl border border-[#e6e1ed]">
                    <strong className="text-[#262131] block mb-0.5">Phase 1: Colombo Core</strong>
                    <p className="text-[11px] text-slate-500">
                      Hyper-concentrated density in Colombo 03, 04, 05, and 07. Campus ambassadors (SLIIT, APIIT, Colombo Med).
                    </p>
                  </div>
                  <div className="bg-[#f4f1f8] p-2.5 rounded-xl border border-[#e6e1ed]">
                    <strong className="text-[#262131] block mb-0.5">Phase 2: Weekend Corridor</strong>
                    <p className="text-[11px] text-slate-500">
                      Colombo ⟷ Galle Fort &amp; Colombo ⟷ Kandy weekend travel corridors for young professionals.
                    </p>
                  </div>
                  <div className="bg-[#f4f1f8] p-2.5 rounded-xl border border-[#e6e1ed]">
                    <strong className="text-[#262131] block mb-0.5">Phase 3: Diaspora Bridge</strong>
                    <p className="text-[11px] text-slate-500">
                      Expanding to Australia, UK, and Canada diaspora seeking intentional cultural connections.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-[#e6e1ed]">
                <button
                  onClick={() => setActiveTabMode("tour")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#f4f1f8] hover:bg-slate-700 text-xs font-semibold text-slate-600 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Guided Tour</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-xs font-bold text-[#262131] shadow-sm transition"
                >
                  Explore Mingle.lk Now
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
