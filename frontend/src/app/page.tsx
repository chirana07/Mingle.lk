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
  Smartphone,
  ExternalLink,
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

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateModalMatchId, setDateModalMatchId] = useState<string | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  const t = getTranslation(currentLocale);

  // Auto-init: check existing session or login as Demo User for investor preview
  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
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
  };

  const loadAllAppData = async () => {
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
  };

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

  const handleQuickDemoLogin = async () => {
    try {
      const authRes = await api.verifyOtp("+94771234567", "123456");
      const me = await api.getMe();
      setCurrentUser(me);
      const prof = await api.getMyProfile();
      setCurrentProfile(prof);
      await loadAllAppData();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      const authRes = await api.verifyOtp("admin@mingle.lk", "123456");
      const me = await api.getMe();
      setCurrentUser(me);
      setCurrentTab("admin");
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setCurrentProfile(null);
    setActiveConversationId(null);
    setCurrentTab("discover");
  };

  // Connection flow: Send Request
  const handleSendConnection = async (data: {
    receiver_id: string;
    card_id?: string;
    card_option_key?: string;
    prompt_key?: string;
    intro_note?: string;
  }) => {
    const res = await api.sendConnectionRequest(data);
    if (res.status === "matched") {
      alert("It's an instant mutual connection! Check your Messages tab to chat.");
      const matchItems = await api.getMatches();
      setMatches(matchItems);
      const convs = await api.getConversations();
      setConversations(convs);
    }
  };

  // Connection flow: Accept Request
  const handleAcceptRequest = async (requestId: string): Promise<string> => {
    const res = await api.acceptConnection(requestId);
    const [reqs, matchItems, convs] = await Promise.all([
      api.getReceivedRequests(),
      api.getMatches(),
      api.getConversations(),
    ]);
    setRequests(reqs);
    setMatches(matchItems);
    setConversations(convs);
    return res.match_id;
  };

  // Chat: Select Conversation and load messages
  const handleSelectConversation = async (convId: string | null) => {
    setActiveConversationId(convId);
    if (wsClient) {
      wsClient.close();
      setWsClient(null);
    }

    if (!convId) return;

    try {
      const msgs = await api.getMessages(convId);
      setCurrentMessages(msgs);

      // Connect WebSocket for real-time messaging
      const wsUrl = api.getWebSocketUrl(convId);
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_message") {
            setCurrentMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          }
        } catch (err) {
          console.error("WS error parsing message", err);
        }
      };

      setWsClient(ws);
    } catch (e: any) {
      alert(e.message || "Failed to load messages.");
    }
  };

  // Chat: Send Message
  const handleSendMessage = async (convId: string, content: string) => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(
        JSON.stringify({
          type: "message",
          content,
        })
      );
    } else {
      const msg = await api.sendMessage(convId, content);
      setCurrentMessages((prev) => [...prev, msg]);
    }

    // Refresh conversation summary
    const convs = await api.getConversations();
    setConversations(convs);
  };

  // Profile: update card answer
  const handleSaveCardAnswer = async (cardId: string, optionKey: string) => {
    await api.submitCardAnswer(cardId, optionKey);
    const myAnswers = await api.getMyCardAnswers();
    setMyCardAnswers(myAnswers);
    // Refresh discovery feed with updated compatibility
    const disc = await api.getDiscoveryFeed(selectedCity, selectedIntent);
    setDiscoveryProfiles(disc);
  };

  // Profile: update privacy
  const handleUpdatePrivacy = async (discoveryEnabled: boolean, showNeighborhoodOnly: boolean) => {
    const token = api.getToken();
    if (!token) return;
    await fetch("http://localhost:8000/api/v1/profiles/me/privacy", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        discovery_enabled: discoveryEnabled,
        show_neighborhood_only: showNeighborhoodOnly,
      }),
    });
  };

  // Safety: Report user
  const handleReportUser = async (userId: string, category: string, details: string) => {
    await api.reportUser(userId, category, details);
    await loadAllAppData();
  };

  // Safety: Block user
  const handleBlockUser = async (userId: string) => {
    await api.blockUser(userId);
    await loadAllAppData();
  };

  // Date Modal opener
  const handleOpenDatePlan = (matchId: string) => {
    setDateModalMatchId(matchId);
    setIsDateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row justify-center items-center md:py-6 md:px-4 font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Desktop Investor Sidebar (Visible only on md+ screens) */}
      <aside className="hidden lg:flex flex-col justify-between w-80 h-[840px] mr-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur">
        <div>
          {/* Logo & Headline */}
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-xl text-white shadow-lg">
              ක
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-white">Project Katha</h1>
              <span className="text-xs font-semibold text-rose-400">Mingle.lk Investor MVP</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            A Sri Lankan-first relationship discovery platform designed to turn compatibility into safe real-world connections.
          </p>

          {/* Differentiators Checklist */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Connection Cards Primitives</strong>
                <span className="text-slate-400 text-[11px]">
                  Shared answers spark organic, contextual conversations.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Coffee className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Date Mode Integration</strong>
                <span className="text-slate-400 text-[11px]">
                  Vetted safe public venues across Colombo, Kandy, and Galle with budget brackets.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Private Safety Plan</strong>
                <span className="text-slate-400 text-[11px]">
                  Zero-shame check-in prompts and emergency trusted contact notifications.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Neighborhood-Level Privacy</strong>
                <span className="text-slate-400 text-[11px]">
                  Approximate locations ("Colombo 05") rather than invasive GPS tracking.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investor Quick Controls */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Investor Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleQuickDemoLogin}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold text-center hover:opacity-90 shadow transition"
            >
              Senuri (User)
            </button>
            <button
              onClick={handleQuickAdminLogin}
              className="py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-center hover:bg-slate-700 transition"
            >
              Admin Dashboard
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center pt-1">
            FastAPI + PostgreSQL + Next.js Modular Monolith
          </p>
        </div>
      </aside>

      {/* Main Mobile App Frame */}
      <main className="w-full max-w-md h-screen md:h-[840px] md:max-h-[880px] bg-slate-950 md:rounded-[40px] md:border-[10px] md:border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Top Speaker Ear Notch on Desktop Preview */}
        <div className="hidden md:flex justify-center items-center py-1 bg-slate-900 border-b border-slate-800 z-50">
          <div className="w-16 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Global App Header */}
        <Header
          currentLocale={currentLocale}
          onLocaleChange={setCurrentLocale}
          currentUser={currentUser}
          onQuickDemoLogin={handleQuickDemoLogin}
          onQuickAdminLogin={handleQuickAdminLogin}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Main Body Content based on Active Tab */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="min-h-full"
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
                <div className="p-4">
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

              {currentTab === "admin" && <AdminDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Mobile Navigation */}
        <Navigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          requestCount={requests.length}
          unreadCount={conversations.reduce((sum, c) => sum + c.unread_count, 0)}
          isAdmin={currentUser?.role === "admin"}
        />

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
              // refresh conversations
              api.getConversations().then(setConversations);
            }}
          />
        )}
      </main>
    </div>
  );
}
