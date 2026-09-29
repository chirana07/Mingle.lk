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
  X,
  Flag,
  UserX,
  MessageSquare,
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
      alert("Report submitted. User blocked.");
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

  // Left Sidebar: Matches Carousel & Conversation List
  const conversationListPanel = (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* Mutual Matches Carousel */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">
              Matches ({matches.length})
            </h3>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {matches.map((m) => {
              const tp = m.target_profile;
              const photo =
                tp.photos[0]?.url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

              return (
                <div
                  key={m.id}
                  onClick={() => m.conversation_id && onSelectConversation(m.conversation_id)}
                  className="flex flex-col items-center shrink-0 cursor-pointer group"
                >
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow group-hover:scale-105 transition">
                    <img src={photo} alt={tp.first_name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-center py-0.5">
                      <span className="text-[8px] font-bold text-amber-300">
                        {Math.round(m.compatibility_score)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 mt-1 truncate max-w-[56px]">
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
        <h3 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 px-1">
          Messages
        </h3>

        {conversations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            <Sparkles className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold text-xs mb-1">No Active Chats</h4>
            <p className="text-slate-400 text-[11px]">
              When you connect, start chatting here!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map((conv) => {
              const tp = conv.target_profile;
              const photo =
                tp.photos[0]?.url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              const isSelected = conv.id === activeConversationId;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`rounded-2xl p-2.5 flex items-center space-x-3 cursor-pointer transition shadow-sm ${
                    isSelected
                      ? "bg-rose-500/15 border border-rose-500/40"
                      : "bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80"
                  }`}
                >
                  <img
                    src={photo}
                    alt={tp.first_name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-xs truncate">{tp.first_name}</h4>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {conv.last_message ? conv.last_message.content : "Tap to say hello..."}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
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

  // Right Chat Thread Panel
  const chatThreadPanel = activeConv && targetUser ? (
    <div className="flex flex-col h-full bg-slate-950 text-white relative">
      {/* Thread Header */}
      <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex items-center justify-between z-10 backdrop-blur">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onSelectConversation(null)}
            className="md:hidden p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={
              targetUser.photos[0]?.url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            }
            alt={targetUser.first_name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
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
        {currentMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No messages yet. Send an opening greeting to get started!
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
                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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

      {/* Icebreaker Starter Chips */}
      {activeConv.suggested_starters && activeConv.suggested_starters.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex space-x-2 scrollbar-none">
          {activeConv.suggested_starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => setInputText(starter)}
              className="text-[10px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Send Message Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${targetUser.first_name}...`}
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
    </div>
  ) : (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950">
      <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
      <h3 className="text-white font-bold text-sm mb-1">Select a Conversation</h3>
      <p className="text-xs max-w-xs text-slate-400">
        Choose a match on the left to review your chat or propose a safe date in Colombo, Kandy, or Galle.
      </p>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] max-w-4xl mx-auto md:border md:border-slate-800 md:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex flex-col md:flex-row">
      {/* Mobile: either list OR thread. Desktop: side-by-side! */}
      <div
        className={`${
          activeConversationId ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 md:border-r md:border-slate-800 flex-col h-full bg-slate-900/90`}
      >
        {conversationListPanel}
      </div>

      <div
        className={`${
          activeConversationId ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full bg-slate-950`}
      >
        {chatThreadPanel}
      </div>

      {/* Safety & Moderation Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">Safety & Moderation</h3>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
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
                  <option value="Financial Solicitation/Scam">Scam / Financial Solicitation</option>
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
                  placeholder="Describe what occurred. Reported user will not see your identity."
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
                  <span>{isReporting ? "Submitting..." : "Report & Auto-Block"}</span>
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
};
