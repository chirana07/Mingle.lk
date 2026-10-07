"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Crown,
  Sparkles,
  Lock,
  ArrowRight,
  X,
  MapPin,
  Check,
  Send,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { CardResponderItem, SubscriptionStatus } from "@/lib/types";
import { api } from "@/lib/api";

export interface CardRespondersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKathaPlus: () => void;
  onOpenSendNote?: (targetUserId: string, cardId: string) => void;
}

export const CardRespondersDrawer: React.FC<CardRespondersDrawerProps> = ({
  isOpen,
  onClose,
  onOpenKathaPlus,
  onOpenSendNote,
}) => {
  const [responders, setResponders] = useState<CardResponderItem[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      Promise.all([
        api.getCardResponders().catch(() => []),
        api.getSubscriptionStatus().catch(() => null),
      ])
        .then(([respData, statusData]) => {
          setResponders(respData);
          setStatus(statusData);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnlocked = status?.is_katha_plus;

  return (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        className="bg-white border border-[#e6e1ed] rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 text-[#262131] max-h-[90vh] overflow-y-auto shadow-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e6e1ed] mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-tight text-[#262131]">Card Responders</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
                  Mingle Plus
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                People who engaged with your Connection Cards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#f5f2f8] hover:bg-[#f5f2f8] text-slate-500 hover:text-[#262131] transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Callout if locked */}
        {!isUnlocked && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#262131] block">Responders Hidden</span>
                <span className="text-slate-600 text-[11px] leading-tight block">
                  Upgrade to Mingle Plus to reveal full profiles and their exact choices.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenKathaPlus();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer transition"
            >
              Unlock
            </button>
          </div>
        )}

        {/* Responders List */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Loading card interactions...
            </div>
          ) : responders.length === 0 ? (
            <div className="bg-[#f5f2f8] border border-[#e6e1ed] rounded-2xl p-6 text-center">
              <Sparkles className="w-7 h-7 text-amber-700 mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-xs text-[#262131]">No Responses Yet</h4>
              <p className="text-slate-500 text-[11px] mt-1 max-w-xs mx-auto">
                Answer more Connection Cards on your profile to invite mutual responses from daters across Sri Lanka!
              </p>
            </div>
          ) : (
            responders.map((item) => {
              if (item.is_locked) {
                // Locked Teaser Card
                return (
                  <div
                    key={item.id}
                    className="relative bg-[#f5f2f8] border border-[#e6e1ed] rounded-2xl p-4 overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                          Card Interaction
                        </span>
                        <p className="text-xs text-slate-700 font-medium">
                          &quot;{item.card_question}&quot;
                        </p>
                        <p className="text-xs text-slate-500 italic mt-1">
                          {item.locked_teaser}
                        </p>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-[#f5f2f8] border border-[#e6e1ed] flex items-center justify-center shrink-0 ml-3">
                        <Lock className="w-4 h-4 text-amber-700" />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#e6e1ed] flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(item.responded_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenKathaPlus();
                        }}
                        className="text-amber-700 hover:text-amber-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Reveal Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }

              // Unlocked Full Responder Card
              const prof = item.responder_profile;
              const photo =
                prof?.photos[0]?.url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

              return (
                <div
                  key={item.id}
                  className="bg-[#f5f2f8] border border-[#e6e1ed] hover:border-[#e6e1ed] rounded-2xl p-4 shadow-sm transition"
                >
                  <div className="flex items-center space-x-3 mb-2.5">
                    <img
                      src={photo}
                      alt={prof?.first_name || "Dater"}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#e6e1ed] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-[#262131] truncate">
                          {prof?.first_name}, {prof?.age}
                        </h4>
                        {item.is_identical_choice && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                            Same Choice!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500 text-[11px] mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                        <span className="truncate">{prof?.neighborhood || prof?.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e6e1ed] rounded-xl p-2.5 space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                      {item.card_question}
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Their Choice:</span>
                      <strong className="text-amber-800 font-semibold truncate max-w-[200px]">
                        {item.responder_answer_label}
                      </strong>
                    </div>
                  </div>

                  {prof && onOpenSendNote && (
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenSendNote(prof.user_id, item.card_id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Connection Note</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
