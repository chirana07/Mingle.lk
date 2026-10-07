"use client";
import { toast } from "sonner";
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
  isLoading?: boolean;
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
  isLoading,
  onOpenDatePlan,
  onReportUser,
  onBlockUser,
}) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const inputText = drafts[activeConversationId || ""] || "";
  const setInputText = (value: string) => setDrafts((previous) => ({ ...previous, [activeConversationId || ""]: value }));
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
  }, [currentMessages.length, activeConversationId]);
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversationId || !inputText.trim() || isSending) return;
    setIsSending(true);
    const content = inputText.trim();
    const conversationId = activeConversationId;
    try {
      await onSendMessage(conversationId, content);
      setDrafts((previous) => previous[conversationId]?.trim() === content ? { ...previous, [conversationId]: "" } : previous);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Your draft has been kept.");
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
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Mutual Matches Carousel */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              New Connections ({matches.length})
            </h3>
          </div>
          <div className="flex space-x-3.5 overflow-x-auto pb-2 scrollbar-none">
            {matches.map((m) => {
              const tp = m.target_profile;
              const photo =
                tp.photos[0]?.url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              return (
                <div
                  key={m.id}
                  role="button" tabIndex={0} aria-label={`Chat with ${tp.first_name}`}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (m.conversation_id) onSelectConversation(m.conversation_id); } }}
                  onClick={() => m.conversation_id && onSelectConversation(m.conversation_id)}
                  className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="relative w-15 h-15 rounded-2xl p-[2px] bg-gradient-to-tr from-rose-500 to-amber-400 shadow-md group-hover:scale-105 transition-transform">
                    <img src={photo} alt={tp.first_name} className="w-full h-full object-cover rounded-[14px]" />
                    <div className="absolute -bottom-1 inset-x-1 bg-white backdrop-blur-sm rounded-full text-center py-0.5 border border-[#e6e1ed]">
                      <span className="text-[9px] font-extrabold text-amber-800">
                        {Math.round(m.compatibility_score)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 mt-2 truncate max-w-[60px]">
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
          Active Conversations
        </h3>
        {conversations.length === 0 ? (
          <div className="bg-white border border-[#e6e1ed] rounded-2xl p-8 text-center">
            <Sparkles className="w-6 h-6 text-rose-600 mx-auto mb-2.5" />
            <h4 className="text-[#262131] font-bold text-xs mb-1">No Active Chats</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              When you send or accept connection requests, start chatting here!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const tp = conv.target_profile;
              const photo =
                tp.photos[0]?.url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              const isSelected = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  role="button" tabIndex={0} aria-label={`Conversation with ${tp.first_name}`}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectConversation(conv.id); } }}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`rounded-2xl p-3 flex items-center space-x-3.5 cursor-pointer transition shadow-sm ${
                    isSelected
                      ? "bg-rose-500/15 border border-rose-500/40"
                      : "bg-white hover:bg-[#f4f1f8] border border-[#e6e1ed]"
                  }`}
                >
                  <img
                    src={photo}
                    alt={tp.first_name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#e6e1ed] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[#262131] font-bold text-xs truncate">{tp.first_name}</h4>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {conv.last_message ? conv.last_message.content : "Tap to say hello..."}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 mingle-filled text-[#262131] text-[9px] font-extrabold flex items-center justify-center shrink-0">
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
    <div className="flex flex-col h-full bg-white text-[#262131] relative">
      {/* Thread Header */}
      <div className="bg-white border-b border-[#e6e1ed] px-4 py-3 flex items-center justify-between z-10 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <button
            aria-label="Back to conversations" onClick={() => onSelectConversation(null)}
            className="xl:hidden p-2 rounded-xl bg-[#f4f1f8] text-slate-600 hover:text-[#262131]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <img
            src={
              targetUser.photos[0]?.url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            }
            alt={targetUser.first_name}
            className="w-10 h-10 rounded-2xl object-cover border border-[#e6e1ed]"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="font-bold text-sm leading-tight text-[#262131]">{targetUser.first_name}</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
            </div>
            <span className="text-xs text-slate-500">{targetUser.neighborhood || targetUser.city}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDatePlan(activeConv.match_id)}
            className="text-xs font-bold bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95 transition"
          >
            <CalendarHeart className="w-3.5 h-3.5 stroke-[2]" />
            <span>Plan Date</span>
          </button>
          <button
            onClick={() => setShowSafetyModal(true)}
            className="p-2 rounded-xl bg-[#f4f1f8] hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 border border-[#e6e1ed] transition cursor-pointer"
            title="Safety & Controls"
          >
            <ShieldAlert className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
      {/* Message Thread History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {isLoading && <p role="status" className="text-sm text-slate-600">Loading conversation...</p>}
        {!isLoading && currentMessages.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No messages yet. Send an opening greeting to get started!
          </div>
        ) : (
          currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.is_mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                  msg.is_mine
                    ? "bg-rose-600 mingle-filled text-[#262131] rounded-tr-sm"
                    : "bg-[#f4f1f8] text-slate-800 rounded-tl-sm border border-[#e6e1ed]"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1 px-1">
                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.is_mine && (
                  <span>
                    {msg.read_at ? (
                      <CheckCheck className="w-3.5 h-3.5 text-sky-700" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-slate-500" />
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
        <div className="px-4 py-2 bg-white border-t border-[#e6e1ed] overflow-x-auto whitespace-nowrap flex space-x-2 scrollbar-none">
          {activeConv.suggested_starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => setInputText(starter)}
              className="text-[11px] font-medium bg-[#f4f1f8] hover:bg-[#f4f1f8] text-slate-700 hover:text-[#262131] px-3 py-1 rounded-full border border-[#e6e1ed] shrink-0 transition cursor-pointer"
            >
              {starter}
            </button>
          ))}
        </div>
      )}
      {/* Send Message Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#e6e1ed] flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="Message" placeholder={`Message ${targetUser.first_name}...`}
          className="flex-1 bg-white border border-[#e6e1ed] rounded-2xl px-4 py-2.5 text-xs text-[#262131] placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
        />
        <button
          aria-label="Send message" type="submit"
          disabled={!inputText.trim() || isSending}
          className="w-10 h-10 rounded-2xl bg-rose-600 mingle-filled hover:bg-rose-500 mingle-filled disabled:opacity-40 text-[#262131] flex items-center justify-center transition shrink-0 shadow-md cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4 stroke-[2]" />
        </button>
      </form>
    </div>
  ) : (
    <div className="hidden xl:flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500 bg-white">
      <div className="w-14 h-14 rounded-2xl bg-[#f5f2f8] border border-[#e6e1ed] flex items-center justify-center mb-3">
        <MessageSquare className="w-7 h-7 text-rose-600 stroke-[1.8]" />
      </div>
      <h3 className="text-[#262131] font-bold text-sm mb-1.5">Select a Conversation</h3>
      <p className="text-xs max-w-xs text-slate-500 leading-relaxed">
        Choose a match on the left to review your chat or propose a safe date in Colombo, Kandy, or Galle.
      </p>
    </div>
  );
  return (
    <div className="w-full h-[calc(100vh-130px)] xl:h-[calc(100vh-100px)] max-w-4xl mx-auto xl:border xl:border-[#e6e1ed] xl:rounded-2xl overflow-hidden bg-[#f4f1f8] shadow-sm flex flex-col xl:flex-row">
      {/* Mobile: either list OR thread. Desktop: side-by-side! */}
      <div
        className={`${
          activeConversationId ? "hidden xl:flex" : "flex"
        } w-full xl:w-80 xl:border-r xl:border-[#e6e1ed] flex-col h-full bg-[#f4f1f8]`}
      >
        {conversationListPanel}
      </div>
      <div
        className={`${
          activeConversationId ? "flex" : "hidden xl:flex"
        } min-w-0 flex-1 flex-col h-full bg-[#f4f1f8]`}
      >
        {chatThreadPanel}
      </div>
      {/* Safety & Moderation Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#f4f1f8] border border-[#e6e1ed] rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5 text-[#262131] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e1ed] mb-4">
              <div className="flex items-center space-x-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#262131]">Safety & Moderation</h3>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="p-1 rounded-full bg-[#f4f1f8] text-slate-500 hover:text-[#262131]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Reason for Report</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2 text-[#262131] text-xs focus:outline-none"
                >
                  <option value="Harassment">Harassment or Disrespectful Behavior</option>
                  <option value="Financial Solicitation/Scam">Scam / Financial Solicitation</option>
                  <option value="Impersonation/Fake">Fake Profile or Impersonation</option>
                  <option value="Inappropriate Media">Inappropriate Photos or Links</option>
                  <option value="Other">Other Safety Concern</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Details (Confidential)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe what occurred. Reported user will not see your identity."
                  rows={3}
                  className="w-full bg-[#f4f1f8] border border-[#e6e1ed] rounded-xl p-2.5 text-xs text-[#262131] placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-2 pt-2">
                <button
                  disabled={isReporting || !reportDetails.trim()}
                  onClick={handleReport}
                  className="w-full py-2.5 rounded-xl bg-rose-600 mingle-filled hover:bg-rose-700 text-[#262131] font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{isReporting ? "Submitting..." : "Report & Auto-Block"}</span>
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full py-2.5 rounded-xl bg-[#f4f1f8] hover:bg-slate-700 text-slate-600 font-medium flex items-center justify-center space-x-1.5"
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
