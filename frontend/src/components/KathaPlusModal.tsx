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
        className="bg-slate-900 border border-amber-500/40 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 text-white max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Crown className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-base text-white tracking-tight">Katha Plus</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LKR Micro-Pass
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Proof of LKR Monetization &amp; Unit Economics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Status Alert if already Plus */}
        {status?.is_katha_plus && (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">Active Katha Plus Member</span>
                <span className="text-slate-400 block text-[11px]">
                  {status.days_remaining} days remaining • Spotlight: {status.spotlight_district || "Colombo"}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        )}

        {/* 3 Core Entitlements Showcase */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <strong className="text-white text-xs">+5 Extra Cards</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unlock 5 extra situational Connection Cards every week.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <strong className="text-white text-xs">Reveal Responders</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              See who answered your cards and view their exact choices.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <strong className="text-white text-xs">District Spotlight</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Top discovery feed placement in your selected district.
            </p>
          </div>
        </div>

        {/* Pricing Tiers Selection */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Select Your Plan:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full shadow">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{plan.name}</h4>
                    <span className="text-base font-extrabold text-amber-300 block mt-1">
                      {plan.formatted_price}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    {plan.duration_days} days access
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Spotlight Customization */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Choose Your Spotlight District</span>
            </label>
            <span className="text-[10px] text-amber-400 font-bold">Priority Boost</span>
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {DISTRICT_OPTIONS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block mt-1">
            Your profile will receive top priority for daters in {selectedDistrict}.
          </span>
        </div>

        {/* Local Payment Methods Supported */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Local Sri Lankan Payment Channels:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1">
              <CreditCard className="w-3 h-3 text-amber-400" />
              <span>PayHere (Visa/MC)</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>FriMi</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Genie</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center space-x-1">
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
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {isLoading ? "Connecting PayHere..." : `Pay ${selectedPlan?.formatted_price} via PayHere`}
            </span>
          </button>

          {/* Instant Sandbox Simulation (For Investors & Evaluators) */}
          <button
            disabled={isLoading || isSimulating}
            onClick={handleInstantDemoSimulation}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 font-semibold text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSimulating ? "Simulating..." : "⚡ 1-Click Sandbox Approval (Investor Demo)"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
