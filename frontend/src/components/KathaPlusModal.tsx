"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  Eye,
  MapPin,
  ShieldCheck,
  CreditCard,
  Smartphone,
  X,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { SubscriptionPlanItem, SubscriptionStatus } from "@/lib/types";
import { api } from "@/lib/api";

export interface KathaPlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDistrict?: string;
}

const DISTRICT_OPTIONS = [
  "Colombo",
  "Colombo 05",
  "Colombo 07",
  "Galle Fort",
  "Kandy City",
  "Gampaha",
  "Negombo",
  "Kurunegala",
  "Matara",
  "Jaffna",
];

export const KathaPlusModal: React.FC<KathaPlusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDistrict = "Colombo",
}) => {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("katha_plus_monthly_special");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("payhere");
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getSubscriptionPlans()
        .then((data) => {
          if (data && data.length > 0) {
            setPlans(data);
          }
        })
        .catch((e) => console.error("Failed to load plans", e));

      api.getSubscriptionStatus()
        .then((st) => setStatus(st))
        .catch((e) => console.error("Failed to load status", e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];

  const handlePayHereCheckout = async () => {
    if (!selectedPlan) return;
    setIsLoading(true);
    try {
      const params = await api.checkoutSubscription({
        plan_id: selectedPlan.id,
        spotlight_district: selectedDistrict,
        payment_method: selectedPaymentMethod,
      });

      // Construct and submit PayHere Form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = params.action_url;
      form.target = "_blank";

      const fields: Record<string, string> = {
        merchant_id: params.merchant_id,
        return_url: params.return_url,
        cancel_url: params.cancel_url,
        notify_url: params.notify_url,
        order_id: params.order_id,
        items: params.items,
        currency: params.currency,
        amount: params.amount,
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone,
        address: "Colombo",
        city: params.city,
        country: params.country,
        hash: params.hash,
      };

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      toast.info("PayHere Checkout Initialized", {
        description: "Complete checkout in the sandbox tab or use Instant Demo Simulation below.",
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to initialize PayHere checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoSimulation = async () => {
    if (!selectedPlan) return;
    setIsSimulating(true);
    try {
      const res = await api.simulateSubscription({
        plan_id: selectedPlan.id,
        spotlight_district: selectedDistrict,
        payment_method: selectedPaymentMethod,
      });
      setStatus(res);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#F43F5E", "#10B981", "#EAB308"],
      });

      toast.success("Katha Plus Activated!", {
        description: `Upgraded to ${res.active_plan_name}. 5 extra cards and ${res.spotlight_district} spotlight active!`,
      });

      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (e: any) {
      toast.error(e.message || "Failed to simulate payment.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 22 }}
        className="bg-[#0B0F19] border border-amber-500/30 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 sm:p-7 text-white max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/40 font-bold">
              <Crown className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">Katha Plus</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  LKR Micro-Pass
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">
                Proof of LKR Monetization &amp; Unit Economics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#162034] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Current Active Status Alert if already Plus */}
        {status?.is_katha_plus && (
          <div className="mt-3.5 p-3.5 bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">Active Katha Plus Member</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  {status.days_remaining} days remaining • Spotlight: {status.spotlight_district || "Colombo"}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Active
            </span>
          </div>
        )}

        {/* 3 Core Entitlements Showcase */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-[#121828] border border-white/[0.07] rounded-2xl p-3.5 flex flex-col shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-2.5">
              <Zap className="w-4 h-4" />
            </div>
            <strong className="text-white text-xs">+5 Extra Cards</strong>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Unlock 5 extra situational Connection Cards every week.
            </p>
          </div>

          <div className="bg-[#121828] border border-white/[0.07] rounded-2xl p-3.5 flex flex-col shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2.5">
              <Eye className="w-4 h-4" />
            </div>
            <strong className="text-white text-xs">Reveal Responders</strong>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              See who answered your cards and view their exact choices.
            </p>
          </div>

          <div className="bg-[#121828] border border-white/[0.07] rounded-2xl p-3.5 flex flex-col shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2.5">
              <MapPin className="w-4 h-4" />
            </div>
            <strong className="text-white text-xs">District Spotlight</strong>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Top discovery feed placement in your selected district.
            </p>
          </div>
        </div>

        {/* Pricing Tiers Selection */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Select Your Plan:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between active:scale-98 ${
                    isSelected
                      ? "bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-950/40"
                      : "bg-[#121828] border-white/[0.07] hover:border-white/[0.14]"
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{plan.name}</h4>
                    <span className="text-base font-extrabold text-amber-300 block mt-1">
                      {plan.formatted_price}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-2 font-medium">
                    {plan.duration_days} days access
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Spotlight Customization */}
        <div className="bg-[#121828] border border-white/[0.07] rounded-2xl p-3.5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 stroke-[2]" />
              <span>Choose Your Spotlight District</span>
            </label>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Priority Boost</span>
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-[#090D16] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {DISTRICT_OPTIONS.map((dist) => (
              <option key={dist} value={dist} className="bg-[#090D16]">
                {dist}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
            Your profile will receive top priority for daters in {selectedDistrict}.
          </span>
        </div>

        {/* Local Payment Methods Supported */}
        <div className="bg-[#121828] border border-white/[0.07] rounded-2xl p-3.5 mb-5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
            Supported Sri Lankan Payment Rails:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-[#090D16] border border-white/[0.08] text-slate-200 text-[11px] font-semibold flex items-center space-x-1.5">
              <CreditCard className="w-3 h-3 text-amber-400" />
              <span>PayHere (Visa / MC)</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#090D16] border border-white/[0.08] text-slate-200 text-[11px] font-semibold flex items-center space-x-1.5">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>FriMi</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#090D16] border border-white/[0.08] text-slate-200 text-[11px] font-semibold flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Genie</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#090D16] border border-white/[0.08] text-slate-200 text-[11px] font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span>Carrier Billing (Dialog)</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto pt-2">
          {/* PayHere Sandbox Checkout */}
          <button
            disabled={isLoading || isSimulating}
            onClick={handlePayHereCheckout}
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <CreditCard className="w-4 h-4 stroke-[2.2]" />
            <span>
              {isLoading ? "Connecting PayHere..." : `Pay ${selectedPlan?.formatted_price} via PayHere`}
            </span>
          </button>

          {/* Instant Sandbox Simulation (For Investors & Evaluators) */}
          <button
            disabled={isLoading || isSimulating}
            onClick={handleInstantDemoSimulation}
            className="w-full py-2.5 rounded-2xl bg-[#162034] hover:bg-[#1C2A44] border border-amber-500/30 text-amber-300 font-semibold text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSimulating ? "Simulating..." : "⚡ 1-Click Sandbox Approval (Demo)"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
