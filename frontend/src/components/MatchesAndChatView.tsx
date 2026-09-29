"use client";

import React, { useState, useEffect, useRef } from "react";
import { MatchItem, ConversationSummaryItem, MessageItem } from "@/lib/types";
import {
  CalendarHeart,
  ShieldAlert,
  Send,
  ArrowLeft,
  Sparkles,
  MapPin,
  Check,
  CheckCheck,
  AlertTriangle,
  X,
  Flag,
  UserX,
} from "lucide-react";

interface MatchesAndChatViewProps {
  matches: MatchItem[];
  conversations: ConversationSummaryItem[];
  activeConversationId: string | null;
  onSelectConversation: (convId: string | null) => void;
  onSendMessage: (convId: string, content: string) => Promise<void>;
  currentMessages: MessageItem[];
  onOpenDatePlan: (matchId: string) => void;
  onReportUser: (userId: string, category: string, details: string) => Promise<void>;
  onBlockUser: (userId: string) => Promise<void>;
}

export const MatchesAndChatView: React.FC<MatchesAndChatViewProps> = ({
  matches,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  currentMessages,
  onOpenDatePlan,
  onReportUser,
  onBlockUser,
}) => {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("Harassment");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const targetUser = activeConv?.target_profile;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversationId || !inputText.trim() || isSending) return;
    setIsSending(true);
    const content = inputText.trim();
    setInputText("");
    try {
      await onSendMessage(activeConversationId, content);
    } catch (err: any) {
      alert(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReport = async () => {
    if (!targetUser || !reportDetails.trim()) return;
    setIsReporting(true);
    try {
      await onReportUser(targetUser.user_id, reportCategory, reportDetails.trim());
      alert("Report submitted. The user has been blocked to protect your comfort.");
      setShowSafetyModal(false);
      onSelectConversation(null);
    } catch (err: any) {
      alert(err.message || "Failed to submit report.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlock = async () => {
    if (!targetUser) return;
    if (confirm(`Block ${targetUser.first_name}? You will no longer see each other.`)) {
      try {
        await onBlockUser(targetUser.user_id);
        setShowSafetyModal(false);
        onSelectConversation(null);
      } catch (err: any) {
        alert(err.message || "Failed to block user.");
      }
    }
  };

  // If inside an active conversation thread:
  if (activeConversationId && activeConv && targetUser) {
    const photo = targetUser.photos[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

    return (
      <div className="flex flex-col h-[calc(100vh-115px)] max-w-md mx-auto bg-slate-950 text-white">
        {/* Thread Header */}
        <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex items-center justify-between z-10 backdrop-blur">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onSelectConversation(null)}
              className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img src={photo} alt={targetUser.first_name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="font-bold text-sm leading-none">{targetUser.first_name}</h4>
                <span className="text-[10px] text-emerald-400 font-medium">• Online</span>
              </div>
              <span className="text-[10px] text-slate-400">{targetUser.neighborhood}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onOpenDatePlan(activeConv.match_id)}
              className="text-[11px] font-semibold bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 text-white px-2.5 py-1.5 rounded-xl shadow flex items-center space-x-1"
            >
              <CalendarHeart className="w-3.5 h-3.5" />
              <span>Plan Date</span>
            </button>
            <button
              onClick={() => setShowSafetyModal(true)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title="Safety & Controls"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Top connection notice */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-center my-2">
            <div className="inline-flex items-center space-x-1 text-rose-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>You found a connection</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Connected over shared intentions and lifestyle compatibility. Be respectful and comfortable.
            </p>
          </div>

          {currentMessages.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No messages yet. Send an icebreaker below to kick off the conversation!
            </div>
          ) : (
            currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.is_mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.is_mine
                      ? "bg-rose-600 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/50"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
                <div className="flex items-center space-x-1 text-[9px] text-slate-500 mt-1 px-1">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {msg.is_mine && (
                    <span>
                      {msg.read_at ? (
                        <CheckCheck className="w-3 h-3 text-sky-400" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Icebreaker Suggestions */}
        {activeConv.suggested_starters && activeConv.suggested_starters.length > 0 && (
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex space-x-2">
            {activeConv.suggested_starters.map((starter, i) => (
              <button
                key={i}
                onClick={() => setInputText(starter)}
                className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
              >
                💬 {starter}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a friendly message..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-9 h-9 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0 shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Safety & Moderation Modal */}
        {showSafetyModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 text-white animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-white">Safety & Moderation</h3>
                </div>
                <button onClick={() => setShowSafetyModal(false)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Reason for Report</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs focus:outline-none"
                  >
                    <option value="Harassment">Harassment or Disrespectful Behavior</option>
                    <option value="Financial Solicitation/Scam">Scam / Financial Solicitation (Money, Crypto)</option>
                    <option value="Impersonation/Fake">Fake Profile or Impersonation</option>
                    <option value="Inappropriate Media">Inappropriate Photos or Links</option>
                    <option value="Other">Other Safety Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Details (Confidential)</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe what occurred. The reported user will NOT see your identity."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    disabled={isReporting || !reportDetails.trim()}
                    onClick={handleReport}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{isReporting ? "Submitting..." : "Report & Auto-Block User"}</span>
                  </button>

                  <button
                    onClick={handleBlock}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center justify-center space-x-1.5"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Block User Only</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise: Conversation list & Active Matches View
  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-5">
      {/* Active Matches Carousel */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-white font-bold text-sm">Mutual Matches</h3>
            <span className="text-[11px] text-rose-400 font-medium">{matches.length} active</span>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {matches.map((m) => {
              const tp = m.target_profile;
              const photo = tp.photos[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={m.id}
                  onClick={() => m.conversation_id && onSelectConversation(m.conversation_id)}
                  className="flex flex-col items-center shrink-0 cursor-pointer group"
                >
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow-md group-hover:scale-105 transition">
                    <img src={photo} alt={tp.first_name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-center py-0.5">
                      <span className="text-[9px] font-bold text-amber-300">
                        {Math.round(m.compatibility_score)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-200 mt-1 truncate max-w-[68px]">
                    {tp.first_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div>
        <h3 className="text-white font-bold text-sm mb-2.5 px-1">Recent Conversations</h3>

        {conversations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Sparkles className="w-6 h-6 text-rose-400" />
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">No Active Chats</h4>
            <p className="text-slate-400 text-xs">
              When you and another user mutually connect, your conversation will appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const tp = conv.target_profile;
              const photo = tp.photos[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3 cursor-pointer transition shadow-sm"
                >
                  <img src={photo} alt={tp.first_name} className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-white font-bold text-sm truncate">{tp.first_name}</h4>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.last_message ? conv.last_message.content : "Tap to say hello..."}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
