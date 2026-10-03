"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Sparkles, ShieldCheck, Phone, Mail, ArrowRight, X, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("+94771234567");
  const [otpCode, setOtpCode] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await api.requestOtp(identifier.trim());
      if (res.demo_code) {
        setOtpCode(res.demo_code);
      }
      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const data = await api.verifyOtp(identifier.trim(), otpCode.trim());
      onSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setIdentifier("+94771234567");
    setOtpCode("123456");
    setStep("otp");
  };

  const handleQuickAdmin = () => {
    setIdentifier("admin@mingle.lk");
    setOtpCode("123456");
    setStep("otp");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 text-white animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              ක
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Join Katha (කතා)</h3>
              <p className="text-[11px] text-slate-400">Sri Lankan Relationship Discovery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* 1-Click Investor Demo Fast-Track */}
        <div className="bg-gradient-to-br from-rose-950/30 to-amber-950/30 border border-rose-500/30 rounded-2xl p-3 mb-4 text-xs">
          <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center space-x-1 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Investor Demo Quick Access</span>
          </span>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleQuickDemo}
              className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-semibold transition"
            >
              Demo Profile (Senuri)
            </button>
            <button
              onClick={handleQuickAdmin}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-[11px] font-semibold border border-slate-700 transition"
            >
              Platform Admin
            </button>
          </div>
        </div>

        {step === "identifier" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+94771234567 or email"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                We&apos;ll send a 6-digit verification code to confirm it&apos;s you.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              <span>{isLoading ? "Sending Code..." : "Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Enter Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep("identifier")}
                  className="text-[10px] text-rose-400 font-semibold"
                >
                  Change number
                </button>
              </div>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-center tracking-widest text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Demo code: <span className="text-amber-300 font-bold">123456</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 4}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              <span>{isLoading ? "Verifying..." : "Verify & Enter"}</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
