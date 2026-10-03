"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConnectionRequestItem } from "@/lib/types";
import { UserCheck, X, Sparkles, MapPin, Check, HeartHandshake, ShieldCheck } from "lucide-react";

interface ConnectionRequestsViewProps {
  requests: ConnectionRequestItem[];
  onAccept: (requestId: string) => Promise<string>;
  onReject?: (requestId: string) => void;
  onOpenMatchChat: (matchId: string) => void;
}

export const ConnectionRequestsView: React.FC<ConnectionRequestsViewProps> = ({
  requests,
  onAccept,
  onOpenMatchChat,
}) => {
  const [acceptedMatchId, setAcceptedMatchId] = useState<string | null>(null);
  const [acceptedSenderName, setAcceptedSenderName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAccept = async (req: ConnectionRequestItem) => {
    setIsProcessing(req.id);
    try {
      const matchId = await onAccept(req.id);
      setAcceptedMatchId(matchId);
      setAcceptedSenderName(req.sender_profile?.first_name || "your new connection");
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F43F5E", "#F59E0B", "#10B981", "#38BDF8"],
      });
      toast.success("Mutual Connection Established!", {
        description: `You and ${req.sender_profile?.first_name || "your match"} can now message freely.`,
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to accept connection.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 backdrop-blur">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Connection Requests</h2>
            <p className="text-slate-400 text-xs">
              People who resonated with your profile and wish to connect
            </p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">No Pending Requests</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            When someone likes your Connection Cards or profile prompts, their request will appear here with an opening note.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const sender = req.sender_profile;
            if (!sender) return null;
            const photo = sender.photos[0]?.url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80";

            return (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={photo}
                    alt={sender.first_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-white font-bold text-sm truncate">{sender.first_name}, {sender.age}</h4>
                      {sender.is_phone_verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{sender.neighborhood}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">
                      {sender.occupation || sender.relationship_intent}
                    </p>
                  </div>
                </div>

                {/* Intro Note */}
                {req.intro_note && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mb-3">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">
                      Their Opening Note:
                    </span>
                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      &quot;{req.intro_note}&quot;
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    disabled={isProcessing === req.id}
                    onClick={() => handleAccept(req)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs shadow flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isProcessing === req.id ? "Accepting..." : "Accept Connection"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Celebration Screen */}
      {acceptedMatchId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18 }}
            className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-fade-in"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-900/40">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">You Found a Connection!</h3>
            <p className="text-slate-300 text-xs mb-6">
              You and <span className="text-rose-400 font-semibold">{acceptedSenderName}</span> are now connected. Start the conversation with an organic question!
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const mId = acceptedMatchId;
                  setAcceptedMatchId(null);
                  onOpenMatchChat(mId);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg transition"
              >
                Open Conversation
              </button>
              <button
                onClick={() => setAcceptedMatchId(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Keep Browsing Requests
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
