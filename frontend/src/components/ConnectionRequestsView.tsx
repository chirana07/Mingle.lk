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
  onReject,
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
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#e6e1ed] rounded-2xl p-4 sm:p-5 mb-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[#262131] font-bold text-base tracking-tight">Connection Requests</h2>
            <p className="text-slate-500 text-xs">
              Daters who engaged with your cards and sent an opening note
            </p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-[#f5f2f8] border border-[#e6e1ed] rounded-2xl p-8 sm:p-10 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f2f8] border border-[#e6e1ed] flex items-center justify-center mx-auto mb-3.5 text-slate-500">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-[#262131] font-bold text-sm mb-1">No Pending Requests</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
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
                className="bg-white border border-[#e6e1ed] rounded-2xl p-4.5 sm:p-5 shadow-sm hover:border-[#e6e1ed] transition"
              >
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <img
                    src={photo}
                    alt={sender.first_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#e6e1ed] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-[#262131] font-bold text-sm tracking-tight truncate">{sender.first_name}, {sender.age}</h4>
                      {sender.is_phone_verified && (
                        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[10px] font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500 text-xs mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                      <span className="truncate">{sender.neighborhood}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                      {sender.occupation || sender.relationship_intent}
                    </p>
                  </div>
                </div>

                {/* Intro Note */}
                {req.intro_note && (
                  <div className="bg-white border border-[#e6e1ed] rounded-2xl p-3.5 mb-3.5">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1 tracking-wider">
                      Opening Note:
                    </span>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      &quot;{req.intro_note}&quot;
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  {onReject && <button disabled={isProcessing !== null} className="rounded-xl border border-[#e6e1ed] px-4 py-3 text-xs font-semibold disabled:opacity-50" onClick={async () => {
                    setIsProcessing(req.id);
                    try { await onReject(req.id); toast.success("Request declined"); }
                    catch { toast.error("Couldn’t decline this request. Please try again."); }
                    finally { setIsProcessing(null); }
                  }}>Decline</button>}
                  <button
                    disabled={isProcessing !== null}
                    onClick={() => handleAccept(req)}
                    className="flex-1 py-3 rounded-xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
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
        <div className="fixed inset-0 z-50 bg-white backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white border border-rose-500/30 rounded-2xl w-full max-w-sm p-6 sm:p-7 text-center shadow-sm animate-fade-in relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-600 shadow-sm">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-[#262131] mb-1.5 tracking-tight">You Found a Connection!</h3>
            <p className="text-slate-600 text-xs mb-6 leading-relaxed">
              You and <span className="text-rose-600 font-semibold">{acceptedSenderName}</span> are now mutually connected. You can now chat and coordinate safety check-ins!
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const mId = acceptedMatchId;
                  setAcceptedMatchId(null);
                  onOpenMatchChat(mId);
                }}
                className="w-full py-3 rounded-xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Open Conversation
              </button>
              <button
                onClick={() => setAcceptedMatchId(null)}
                className="w-full py-2.5 rounded-xl bg-[#f5f2f8] hover:bg-[#f5f2f8] text-slate-600 text-xs font-semibold transition cursor-pointer border border-[#e6e1ed]"
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
