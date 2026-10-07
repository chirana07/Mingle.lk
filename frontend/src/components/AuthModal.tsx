"use client";
import { useDialog } from "@/hooks/useDialog";
import { MingleLogo } from "./MingleLogo";

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

  const dialogRef = useDialog(isOpen, onClose);
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Log in to Mingle.lk" tabIndex={-1} className="bg-white border border-[#e6e1ed] rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-6 text-[#262131] animate-fade-in shadow-sm">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e6e1ed] mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 flex items-center justify-center font-bold text-sm">
              <MingleLogo compact />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-[#262131]">Join Mingle.lk</h3>
              <p className="text-[11px] text-slate-500">Sri Lankan Relationship Discovery</p>
            </div>
          </div>
          <button
            aria-label="Close login" onClick={onClose}
            className="p-2 rounded-xl bg-[#f5f2f8] hover:bg-[#f5f2f8] text-slate-500 hover:text-[#262131] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* 1-Click Investor Demo Fast-Track */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 mb-4 text-xs">
          <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center space-x-1.5 mb-1.5 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast-Track Demo Credentials</span>
          </span>
          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="flex-1 py-1.5 px-2 bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] rounded-xl text-[11px] font-semibold transition cursor-pointer shadow-sm"
            >
              Demo (Senuri)
            </button>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="flex-1 py-1.5 px-2 bg-[#f5f2f8] hover:bg-[#f5f2f8] text-amber-800 rounded-xl text-[11px] font-semibold border border-amber-500/20 transition cursor-pointer"
            >
              Platform Admin
            </button>
          </div>
        </div>

        {step === "identifier" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+94771234567 or email"
                  className="w-full bg-white border border-[#e6e1ed] rounded-2xl px-4 py-2.5 text-xs text-[#262131] placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                We&apos;ll send a 6-digit verification code to confirm it&apos;s you.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full py-3 rounded-2xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? "Sending Code..." : "Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Enter Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep("identifier")}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
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
                className="w-full bg-white border border-[#e6e1ed] rounded-2xl px-4 py-2.5 text-center tracking-widest text-lg font-bold text-[#262131] placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition"
              />
              <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                Demo code: <span className="text-amber-800 font-bold">123456</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 4}
              className="w-full py-3 rounded-2xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
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
