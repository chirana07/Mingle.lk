"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Locale, getTranslation } from "@/i18n";
import { api } from "@/lib/api";
import {
  UserProfile,
  DiscoveryProfileItem,
  ConnectionCard,
  ConnectionRequestItem,
  MatchItem,
  ConversationSummaryItem,
  MessageItem,
} from "@/lib/types";
import { Header } from "@/components/Header";
import { Navigation, NavTab } from "@/components/Navigation";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { ConnectionRequestsView } from "@/components/ConnectionRequestsView";
import { MatchesAndChatView } from "@/components/MatchesAndChatView";
import { DateModeModal } from "@/components/DateModeModal";
import { ProfileView } from "@/components/ProfileView";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AuthModal } from "@/components/AuthModal";
import {
  ShieldCheck,
  Sparkles,
  Heart,
  Coffee,
  MapPin,
  Lock,
  Presentation,
  X,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [currentTab, setCurrentTab] = useState<NavTab>("discover");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  // App Data
  const [discoveryProfiles, setDiscoveryProfiles] = useState<DiscoveryProfileItem[]>([]);
  const [connectionCards, setConnectionCards] = useState<ConnectionCard[]>([]);
  const [myCardAnswers, setMyCardAnswers] = useState<any[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [conversations, setConversations] = useState<ConversationSummaryItem[]>([]);
  const [requests, setRequests] = useState<ConnectionRequestItem[]>([]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState("all");

  // Chat thread
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageItem[]>([]);
  const [wsClient, setWsClient] = useState<WebSocket | null>(null);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateModalMatchId, setDateModalMatchId] = useState<string | null>(null);
  const [isPitchDrawerOpen, setIsPitchDrawerOpen] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  const t = getTranslation(currentLocale);

  const loadAllAppData = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const [cards, myAnswers, reqs, matchItems, convs, disc] = await Promise.all([
        api.getConnectionCards().catch(() => []),
        api.getMyCardAnswers().catch(() => []),
        api.getReceivedRequests().catch(() => []),
        api.getMatches().catch(() => []),
        api.getConversations().catch(() => []),
        api.getDiscoveryFeed(selectedCity, selectedIntent).catch(() => []),
      ]);
      setConnectionCards(cards);
      setMyCardAnswers(myAnswers);
      setRequests(reqs);
      setMatches(matchItems);
      setConversations(convs);
      setDiscoveryProfiles(disc);
    } catch (e) {
      console.error("Failed to load app data", e);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [selectedCity, selectedIntent]);

  // Demo user login (Senuri)
  const handleQuickDemoLogin = useCallback(async () => {
    try {
      const authRes = await api.verifyOtp("+94771234567", "123456");
      api.setToken(authRes.access_token);
      const me = await api.getMe();
      setCurrentUser(me);
      const prof = await api.getMyProfile();
      setCurrentProfile(prof);
      await loadAllAppData();
    } catch (e) {
      console.error("Demo login failed", e);
    }
  }, [loadAllAppData]);

  const initSession = useCallback(async () => {
    const token = api.getToken();
    if (token) {
      try {
        const me = await api.getMe();
        setCurrentUser(me);
        const prof = await api.getMyProfile();
        setCurrentProfile(prof);
        await loadAllAppData();
        return;
      } catch (e) {
        api.setToken(null);
      }
    }
    // Default fast-track demo login
    handleQuickDemoLogin();
  }, [loadAllAppData, handleQuickDemoLogin]);

  // Auto-init: check existing session or login as Demo User for investor preview
  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setIsLoadingFeed(true);
    try {
      const disc = await api.getDiscoveryFeed(city, selectedIntent);
      setDiscoveryProfiles(disc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleIntentChange = async (intent: string) => {
    setSelectedIntent(intent);
    setIsLoadingFeed(true);
    try {
      const disc = await api.getDiscoveryFeed(selectedCity, intent);
      setDiscoveryProfiles(disc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  // Admin login
  const handleQuickAdminLogin = async () => {
    try {
      const authRes = await api.verifyOtp("admin@mingle.lk", "123456");
      api.setToken(authRes.access_token);
      const me = await api.getMe();
      setCurrentUser(me);
      setCurrentTab("admin");
      setIsPitchDrawerOpen(false);
    } catch (e) {
      console.error("Admin login failed", e);
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setCurrentProfile(null);
    if (wsClient) {
      wsClient.close();
      setWsClient(null);
    }
  };

  // Connections actions
  const handleSendConnection = async (data: {
    receiver_id: string;
    card_id?: string;
    card_option_key?: string;
    prompt_key?: string;
    intro_note?: string;
  }) => {
    await api.sendConnectionRequest(data);
  };

  const handleAcceptRequest = async (requestId: string): Promise<string> => {
    const res = await api.acceptConnection(requestId);
    // Reload matches and conversations
    const [m, c, r] = await Promise.all([
      api.getMatches(),
      api.getConversations(),
      api.getReceivedRequests(),
    ]);
    setMatches(m);
    setConversations(c);
    setRequests(r);
    return res.match_id || "";
  };

  // WebSocket Chat Setup
  const handleSelectConversation = useCallback(
    async (convId: string | null) => {
      setActiveConversationId(convId);
      if (!convId) {
        if (wsClient) {
          wsClient.close();
          setWsClient(null);
        }
        return;
      }

      // Load historic messages
      try {
        const msgs = await api.getMessages(convId);
        setCurrentMessages(msgs);
      } catch (e) {
        console.error("Failed to load messages", e);
      }

      // Connect WebSocket
      // Connect WebSocket
      if (wsClient) {
        wsClient.close();
      }
      const token = api.getToken();
      if (token && typeof window !== "undefined") {
        try {
          const wsUrl = api.getWebSocketUrl(convId);
          const ws = new WebSocket(wsUrl);
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              const incomingMsg = data.type === "new_message" ? data.message : (data.id ? data : null);
              if (incomingMsg && incomingMsg.id) {
                const formattedMsg: MessageItem = {
                  id: incomingMsg.id,
                  conversation_id: incomingMsg.conversation_id,
                  sender_id: incomingMsg.sender_id,
                  content: incomingMsg.content,
                  created_at: incomingMsg.created_at,
                  read_at: incomingMsg.read_at,
                  is_mine: incomingMsg.sender_id === (currentUser?.id || ""),
                };
                setCurrentMessages((prev) => {
                  if (prev.some((m) => m.id === formattedMsg.id)) return prev;
                  return [...prev, formattedMsg];
                });
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === incomingMsg.conversation_id
                      ? { ...c, last_message: formattedMsg }
                      : c
                  )
                );
              }
            } catch (err) {
              console.error("Failed to parse websocket message", err);
            }
          };
          setWsClient(ws);
        } catch (err) {
          console.warn("WebSocket fallback", err);
        }
      }
    },
    [wsClient, currentUser]
  );

  const handleSendMessage = async (convId: string, content: string) => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(
        JSON.stringify({
          type: "message",
          action: "send_message",
          content: content,
        })
      );
    } else {
      // Fallback HTTP
      const newMsg = await api.sendMessage(convId, content);
      setCurrentMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    }
    // Update local conversations last message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              last_message: {
                id: `temp-${Date.now()}`,
                conversation_id: convId,
                sender_id: currentUser?.id || "",
                content,
                created_at: new Date().toISOString(),
                is_mine: true,
              },
            }
          : c
      )
    );
  };

  const handleOpenDatePlan = (matchId: string) => {
    setDateModalMatchId(matchId);
    setIsDateModalOpen(true);
  };

  const handleReportUser = async (userId: string, category: string, details: string) => {
    await api.reportUser(userId, category, details);
  };

  const handleBlockUser = async (userId: string) => {
    await api.blockUser(userId);
    // Reload feed and conversations
    loadAllAppData();
  };

  const handleSaveCardAnswer = async (cardId: string, optionKey: string) => {
    await api.submitCardAnswer(cardId, optionKey);
    const answers = await api.getMyCardAnswers();
    setMyCardAnswers(answers);
  };

  const handleUpdatePrivacy = async (
    discoveryEnabled: boolean,
    showNeighborhoodOnly: boolean
  ) => {
    try {
      await api.updatePrivacySettings(discoveryEnabled, showNeighborhoodOnly);
      const prof = await api.getMyProfile();
      setCurrentProfile(prof);
    } catch (e) {
      console.error("Failed to update privacy settings", e);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Universal Responsive Header */}
      <Header
        currentLocale={currentLocale}
        onLocaleChange={setCurrentLocale}
        currentUser={currentUser}
        onQuickDemoLogin={handleQuickDemoLogin}
        onQuickAdminLogin={handleQuickAdminLogin}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onTogglePitchDrawer={() => setIsPitchDrawerOpen(true)}
        requestCount={requests.length}
        unreadCount={conversations.reduce((sum, c) => sum + c.unread_count, 0)}
        isAdmin={currentUser?.role === "admin"}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col w-full"
          >
            {currentTab === "discover" && (
              <DiscoveryFeed
                profiles={discoveryProfiles}
                isLoading={isLoadingFeed}
                onSendConnection={handleSendConnection}
                selectedCity={selectedCity}
                onCityChange={handleCityChange}
                selectedIntent={selectedIntent}
                onIntentChange={handleIntentChange}
                onRefresh={loadAllAppData}
              />
            )}

            {currentTab === "requests" && (
              <ConnectionRequestsView
                requests={requests}
                onAccept={handleAcceptRequest}
                onOpenMatchChat={(matchId) => {
                  const conv = conversations.find((c) => c.match_id === matchId);
                  if (conv) {
                    setCurrentTab("chat");
                    handleSelectConversation(conv.id);
                  }
                }}
              />
            )}

            {currentTab === "chat" && (
              <MatchesAndChatView
                matches={matches}
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onSendMessage={handleSendMessage}
                currentMessages={currentMessages}
                onOpenDatePlan={handleOpenDatePlan}
                onReportUser={handleReportUser}
                onBlockUser={handleBlockUser}
              />
            )}

            {currentTab === "dates" && (
              <div className="p-3 sm:p-6 max-w-xl mx-auto w-full">
                <DateModeModal
                  matchId={matches[0]?.id || null}
                  onClose={() => setCurrentTab("discover")}
                />
              </div>
            )}

            {currentTab === "profile" && (
              <ProfileView
                profile={currentProfile}
                cards={connectionCards}
                myCardAnswers={myCardAnswers}
                onSaveCardAnswer={handleSaveCardAnswer}
                onUpdatePrivacy={handleUpdatePrivacy}
                onLogout={handleLogout}
              />
            )}

            {currentTab === "admin" && (
              <div className="w-full max-w-5xl mx-auto p-3 sm:p-6">
                <AdminDashboard />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Mobile Navigation (Hidden on Tablet/Desktop) */}
      <div className="md:hidden">
        <Navigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          requestCount={requests.length}
          unreadCount={conversations.reduce((sum, c) => sum + c.unread_count, 0)}
          isAdmin={currentUser?.role === "admin"}
        />
      </div>

      {/* Floating Pitch Mode Button for Mobile */}
      <button
        onClick={() => setIsPitchDrawerOpen(true)}
        className="md:hidden fixed bottom-18 right-4 z-40 p-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-xl shadow-amber-900/40 flex items-center justify-center transition active:scale-95"
        title="Investor Pitch Mode"
      >
        <Presentation className="w-5 h-5" />
      </button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(userData) => {
          setCurrentUser(userData);
          initSession();
        }}
      />

      {/* Date Mode Floating Modal (when opened from Chat) */}
      {isDateModalOpen && (
        <DateModeModal
          matchId={dateModalMatchId}
          onClose={() => setIsDateModalOpen(false)}
          onProposeDateSuccess={() => {
            api.getConversations().then(setConversations);
          }}
        />
      )}

      {/* Slide-over Investor Pitch Drawer */}
      <AnimatePresence>
        {isPitchDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 text-white overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Presentation className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-base">Investor Pitch Panel</h3>
                  </div>
                  <button
                    onClick={() => setIsPitchDrawerOpen(false)}
                    className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Pitch Fast-Track Accounts */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Instant Demo Logins
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        handleQuickDemoLogin();
                        setIsPitchDrawerOpen(false);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-center hover:opacity-90 shadow transition"
                    >
                      Senuri (User Profile)
                    </button>
                    <button
                      onClick={handleQuickAdminLogin}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-center hover:bg-slate-700 transition"
                    >
                      Admin Dashboard
                    </button>
                  </div>
                </div>

                {/* Core Differentiators */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Core Investment Pillars
                  </span>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <strong className="text-white block font-semibold mb-0.5">
                        1. Interactive Connection Cards
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Situational icebreakers replace binary swiping with mutual values alignment.
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <strong className="text-white block font-semibold mb-0.5">
                        2. Curated Date Mode & Safe Spots
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Curated venues across Colombo, Kandy, Galle with budget brackets.
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <strong className="text-white block font-semibold mb-0.5">
                        3. Private Safety Plan & Anti-Scam
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        Zero-shame emergency contact notifications and heuristic scam detection.
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <strong className="text-white block font-semibold mb-0.5">
                        4. LKR Monetization Ready
                      </strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed">
                        PayHere / Genie micro-subscriptions (Katha Plus) at LKR 1,490/mo.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-500">
                  Project Katha (Mingle.lk) • Pre-Seed Round
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
