"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { InvestorPitchTour } from "@/components/InvestorPitchTour";

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

  // Active Chat State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageItem[]>([]);

  // Multi-Filter State (Issue #2)
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState("all");
  const [selectedLifestyle, setSelectedLifestyle] = useState("all");

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateModalMatchId, setDateModalMatchId] = useState<string | null>(null);
  const [isPitchTourOpen, setIsPitchTourOpen] = useState(false);
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
        api.getDiscoveryFeed({
          city: selectedCity,
          intent: selectedIntent,
          lifestyle_pace: selectedLifestyle,
        }).catch(() => []),
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
  }, [selectedCity, selectedIntent, selectedLifestyle]);

  // Demo user login (Senuri)
  const handleQuickDemoLogin = useCallback(async () => {
    try {
      const authRes = await api.verifyOtp("+94771234567", "123456");
      api.setToken(authRes.access_token);
      const me = await api.getMe();
      setCurrentUser(me);
      const prof = await api.getMyProfile().catch(() => null);
      setCurrentProfile(prof);
      await loadAllAppData();
    } catch (e) {
      console.error("Demo login failed", e);
    }
  }, [loadAllAppData]);

  // Demo admin login
  const handleQuickAdminLogin = useCallback(async () => {
    try {
      const authRes = await api.verifyOtp("admin@mingle.lk", "123456");
      api.setToken(authRes.access_token);
      const me = await api.getMe();
      setCurrentUser(me);
      const prof = await api.getMyProfile().catch(() => null);
      setCurrentProfile(prof);
      await loadAllAppData();
    } catch (e) {
      console.error("Admin login failed", e);
    }
  }, [loadAllAppData]);

  const initSession = useCallback(async () => {
    const token = api.getToken();
    if (token) {
      try {
        const me = await api.getMe();
        setCurrentUser(me);
        const prof = await api.getMyProfile().catch(() => null);
        setCurrentProfile(prof);
        await loadAllAppData();
        return;
      } catch (e) {
        api.setToken(null);
      }
    }
    handleQuickDemoLogin();
  }, [loadAllAppData, handleQuickDemoLogin]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setIsLoadingFeed(true);
    try {
      const disc = await api.getDiscoveryFeed({
        city,
        intent: selectedIntent,
        lifestyle_pace: selectedLifestyle,
      });
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
      const disc = await api.getDiscoveryFeed({
        city: selectedCity,
        intent,
        lifestyle_pace: selectedLifestyle,
      });
      setDiscoveryProfiles(disc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleLifestyleChange = async (lifestyle: string) => {
    setSelectedLifestyle(lifestyle);
    setIsLoadingFeed(true);
    try {
      const disc = await api.getDiscoveryFeed({
        city: selectedCity,
        intent: selectedIntent,
        lifestyle_pace: lifestyle,
      });
      setDiscoveryProfiles(disc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleResetFilters = async () => {
    setSelectedCity("all");
    setSelectedIntent("all");
    setSelectedLifestyle("all");
    setIsLoadingFeed(true);
    try {
      const disc = await api.getDiscoveryFeed({});
      setDiscoveryProfiles(disc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

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
    await loadAllAppData();
    return res.match_id;
  };

  const handleDeclineRequest = async (requestId: string) => {
    await api.declineConnection(requestId);
    await loadAllAppData();
  };

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const msgs = await api.getMessages(convId);
      setCurrentMessages(msgs);
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }, []);

  const handleSelectConversation = (convId: string | null) => {
    setActiveConversationId(convId);
    if (convId) {
      loadMessages(convId);
    } else {
      setCurrentMessages([]);
    }
  };

  const handleSendMessage = async (convId: string, content: string) => {
    const msg = await api.sendMessage(convId, content);
    setCurrentMessages((prev) => [...prev, msg]);
    const updatedConvs = await api.getConversations().catch(() => null);
    if (updatedConvs) {
      setConversations(updatedConvs);
    }
  };

  const handleReportUser = async (userId: string, category: string, details: string) => {
    await api.reportUser(userId, category, details);
    await loadAllAppData();
  };

  const handleBlockUser = async (userId: string) => {
    await api.blockUser(userId);
    await loadAllAppData();
  };

  const handleOpenDatePlan = (matchId: string) => {
    setDateModalMatchId(matchId);
    setIsDateModalOpen(true);
  };

  const handleOpenMatchChat = (matchId: string) => {
    setCurrentTab("chat");
    const conv = conversations.find((c) => c.match_id === matchId);
    if (conv) {
      handleSelectConversation(conv.id);
    }
  };

  const handleSaveCardAnswer = async (cardId: string, optionKey: string) => {
    await api.submitCardAnswer(cardId, optionKey);
    const updatedAnswers = await api.getMyCardAnswers();
    setMyCardAnswers(updatedAnswers);
  };

  const handleUpdatePrivacy = async (discoveryEnabled: boolean, showNeighborhoodOnly: boolean) => {
    await api.updatePrivacySettings(discoveryEnabled, showNeighborhoodOnly);
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setCurrentProfile(null);
    window.location.reload();
  };

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Investor Pitch Tour Desktop Callout Banner */}
      {!isPitchTourOpen && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 text-center text-xs flex items-center justify-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/30">
            INVESTOR / ACCELERATOR PREVIEW
          </span>
          <span className="text-slate-300 hidden sm:inline text-xs">
            Reviewing Katha for Pre-Seed? Explore our 5 core defensibility proof points &amp; unit economics.
          </span>
          <button
            onClick={() => setIsPitchTourOpen(true)}
            className="text-amber-400 font-bold hover:text-amber-300 underline underline-offset-2 flex items-center space-x-1 cursor-pointer ml-1 text-xs"
          >
            <span>Launch Guided Tour</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}

      {/* Header */}
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
        onTogglePitchDrawer={() => setIsPitchTourOpen((prev) => !prev)}
        requestCount={requests.length}
        unreadCount={unreadCount}
        isAdmin={currentUser?.role === "admin"}
      />

      {/* Main Tab Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {currentTab === "discover" && (
          <DiscoveryFeed
            profiles={discoveryProfiles}
            isLoading={isLoadingFeed}
            onSendConnection={handleSendConnection}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            selectedIntent={selectedIntent}
            onIntentChange={handleIntentChange}
            selectedLifestyle={selectedLifestyle}
            onLifestyleChange={handleLifestyleChange}
            onResetFilters={handleResetFilters}
            onRefresh={loadAllAppData}
          />
        )}

        {currentTab === "requests" && (
          <ConnectionRequestsView
            requests={requests}
            onAccept={handleAcceptRequest}
            onReject={handleDeclineRequest}
            onOpenMatchChat={handleOpenMatchChat}
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
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
            <h3 className="text-xl font-bold text-white mb-2">Curated Date Mode</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-4">
              Explore safety-vetted Sri Lankan date spots and configure private check-ins.
            </p>
            <button
              onClick={() => setIsDateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-xs shadow"
            >
              Open Date Mode
            </button>
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
      </main>

      {/* Date Mode Modal */}
      {(isDateModalOpen || currentTab === "dates") && (
        <DateModeModal
          matchId={dateModalMatchId}
          onClose={() => {
            setIsDateModalOpen(false);
            if (currentTab === "dates") {
              setCurrentTab("discover");
            }
          }}
          onProposeDateSuccess={loadAllAppData}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={async (data) => {
          if (data?.access_token) {
            api.setToken(data.access_token);
          }
          await initSession();
        }}
      />

      {/* Interactive Investor Guided Pitch Walkthrough */}
      <InvestorPitchTour
        isOpen={isPitchTourOpen}
        onClose={() => setIsPitchTourOpen(false)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenDateModal={(matchId) => {
          if (matchId) setDateModalMatchId(matchId);
          setIsDateModalOpen(true);
        }}
        onQuickDemoLogin={handleQuickDemoLogin}
        onQuickAdminLogin={handleQuickAdminLogin}
      />

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        requestCount={requests.length}
        unreadCount={unreadCount}
        isAdmin={currentUser?.role === "admin"}
      />
    </div>
  );
}
