"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Locale } from "@/i18n";
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
import { CalendarHeart, ArrowUpRight, ShieldCheck, UserRound, MessageCircle } from "lucide-react";
import { MingleLogo } from "@/components/MingleLogo";
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
import { KathaPlusModal } from "@/components/KathaPlusModal";
import { CardRespondersDrawer } from "@/components/CardRespondersDrawer";

export default function Home() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [currentTab, setCurrentTab] = useState<NavTab>("discover");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  const [noteTarget, setNoteTarget] = useState<DiscoveryProfileItem | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const filtersRef = useRef({ city: "all", intent: "all", lifestyle_pace: "all" });
  const feedVersion = useRef(0);
  const messageMutation = useRef(0);
  const activeConversationRef = useRef<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

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
  const [isKathaPlusOpen, setIsKathaPlusOpen] = useState(false);
  const [isRespondersOpen, setIsRespondersOpen] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentTab]);

  const loadAllAppData = useCallback(async () => {
    const version = ++feedVersion.current;
    const token = api.getToken();
    setIsLoadingFeed(true);
    setAppError(null);
    try {
      const [cards, myAnswers, reqs, matchItems, convs, disc] = await Promise.all([
        api.getConnectionCards(),
        api.getMyCardAnswers(),
        api.getReceivedRequests(),
        api.getMatches(),
        api.getConversations(),
        api.getDiscoveryFeed(filtersRef.current),
      ]);
      if (api.getToken() !== token) return;
      setConnectionCards(cards);
      setMyCardAnswers(myAnswers);
      setRequests(reqs);
      setMatches(matchItems);
      setConversations(convs);
      if (version === feedVersion.current) setDiscoveryProfiles(disc);
    } catch (e) {
      setAppError("We couldn’t load your connections. Check your connection and try again.");
    } finally {
      if (version === feedVersion.current) setIsLoadingFeed(false);
    }
  }, []);

  // Demo user login (Senuri)
  const handleQuickDemoLogin = useCallback(async () => {
    try {
      const authRes = await api.verifyOtp("+94771234567", "123456");
      sessionStorage.removeItem("mingle_signed_out");
      api.setToken(authRes.access_token);
      const me = await api.getMe();
      setCurrentUser(me);
      const prof = await api.getMyProfile().catch(() => null);
      setCurrentProfile(prof);
      await loadAllAppData();
    } catch (e) {
      setAppError("Demo sign-in failed. Make sure the local service is running, then retry.");
    }
  }, [loadAllAppData]);

  // Demo admin login
  const handleQuickAdminLogin = useCallback(async () => {
    try {
      const authRes = await api.verifyOtp("admin@mingle.lk", "123456");
      sessionStorage.removeItem("mingle_signed_out");
      api.setToken(authRes.access_token);
      const me = await api.getMe();
      setCurrentUser(me);
      const prof = await api.getMyProfile().catch(() => null);
      setCurrentProfile(prof);
      await loadAllAppData();
    } catch (e) {
      toast.error("Admin sign-in failed. Please try again.");
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
    if (!sessionStorage.getItem("mingle_signed_out")) await handleQuickDemoLogin();
  }, [loadAllAppData, handleQuickDemoLogin]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    filtersRef.current = { city: selectedCity, intent: selectedIntent, lifestyle_pace: selectedLifestyle };
    if (!currentUser) return;
    const version = ++feedVersion.current;
    setIsLoadingFeed(true);
    api.getDiscoveryFeed(filtersRef.current).then((items) => {
      if (version === feedVersion.current) setDiscoveryProfiles(items);
    }).catch(() => {
      if (version === feedVersion.current) setAppError("Couldn’t update the feed. Please retry.");
    }).finally(() => {
      if (version === feedVersion.current) setIsLoadingFeed(false);
    });
  }, [selectedCity, selectedIntent, selectedLifestyle, currentUser?.id]);

  const handleCityChange = setSelectedCity;
  const handleIntentChange = setSelectedIntent;
  const handleLifestyleChange = setSelectedLifestyle;
  const handleResetFilters = () => {
    setSelectedCity("all");
    setSelectedIntent("all");
    setSelectedLifestyle("all");
  };

  const handleSendConnection = async (data: {
    receiver_id: string;
    card_id?: string;
    card_option_key?: string;
    prompt_key?: string;
    intro_note?: string;
  }) => {
    const result = await api.sendConnectionRequest(data);
    await loadAllAppData();
    if (result.status === "matched") toast.success("You connected! Your conversation is ready in Messages.");
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

  const handleSelectConversation = (convId: string | null) => {
    activeConversationRef.current = convId;
    setActiveConversationId(convId);
    setCurrentMessages([]);
    setMessagesLoading(!!convId);
  };

  useEffect(() => {
    if (!currentUser || currentTab !== "chat") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        if (activeConversationId) {
          const version = messageMutation.current;
          const messages = await api.getMessages(activeConversationId);
          if (!cancelled && version === messageMutation.current) setCurrentMessages(messages);
        }
        const items = await api.getConversations();
        if (!cancelled) setConversations(items);
      } catch {
        if (!cancelled) setAppError("Chat couldn’t refresh. Your draft is safe; please retry.");
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
          timer = setTimeout(refresh, 4000);
        }
      }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [activeConversationId, currentTab, currentUser?.id]);

  useEffect(() => {
    if (!currentUser || currentTab === "chat") return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const [reqs, convs, items] = await Promise.all([api.getReceivedRequests(), api.getConversations(), api.getMatches()]);
        if (!cancelled) { setRequests(reqs); setConversations(convs); setMatches(items); }
      } catch { /* Keep the last successful data; foreground actions expose errors. */ }
    };
    void refresh();
    const timer = setInterval(refresh, 10000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [currentTab, currentUser?.id]);

  const handleSendMessage = async (convId: string, content: string) => {
    const msg = await api.sendMessage(convId, content);
    ++messageMutation.current;
    if (activeConversationRef.current === convId) {
      setCurrentMessages((prev) => prev.some((item) => item.id === msg.id) ? prev : [...prev, msg]);
    }
    api.getConversations().then(setConversations).catch(() => {});
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

  const handleOpenMatchChat = async (matchId: string) => {
    setCurrentTab("chat");
    const latest = await api.getConversations().catch(() => conversations);
    setConversations(latest);
    const conv = latest.find((c) => c.match_id === matchId);
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
    setCurrentUser(await api.getMe());
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setCurrentProfile(null);
    sessionStorage.setItem("mingle_signed_out", "1");
    ++feedVersion.current;
    setDiscoveryProfiles([]);
    setRequests([]);
    setMatches([]);
    setConversations([]);
    handleSelectConversation(null);
    setCurrentTab("discover");
    setIsAuthOpen(true);
  };

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <div className="mingle-app">
      {/* Header */}
      <Header
        currentLocale={currentLocale}
        onLocaleChange={setCurrentLocale}
        currentUser={currentUser}
        onQuickDemoLogin={handleQuickDemoLogin}
        onQuickAdminLogin={handleQuickAdminLogin}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenKathaPlus={() => setIsKathaPlusOpen(true)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onTogglePitchDrawer={() => setIsPitchTourOpen((prev) => !prev)}
        requestCount={requests.length}
        unreadCount={unreadCount}
        isAdmin={currentUser?.role === "admin"}
      />

      <div className={`app-workspace ${currentTab === "chat" || currentTab === "admin" ? "wide-workspace" : ""}`}>
      {/* Main Tab Area */}
      <main className="app-main">
        {appError && <div role="alert" className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{appError}<button className="ml-3 font-semibold underline" onClick={() => { setAppError(null); currentUser ? void loadAllAppData() : void initSession(); }}>Retry</button></div>}
        {currentTab === "discover" && (
          <DiscoveryFeed
            key={currentUser?.id}
            noteTarget={noteTarget}
            onNoteTargetHandled={() => setNoteTarget(null)}
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
            isLoading={messagesLoading}
            onOpenDatePlan={handleOpenDatePlan}
            onReportUser={handleReportUser}
            onBlockUser={handleBlockUser}
          />
        )}

        {currentTab === "dates" && (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[55vh] max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center mb-4">
              <CalendarHeart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#262131] mb-2 tracking-tight">Curated Ceylon Date Mode</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm mb-6">
              Explore safety-vetted Sri Lankan date spots across Colombo, Kandy, Galle Fort &amp; Weligama, with automatic check-in safety timers.
            </p>
            <button
              onClick={() => { setDateModalMatchId(null); setIsDateModalOpen(true); }}
              className="px-5 py-3 rounded-2xl bg-rose-500 mingle-filled hover:bg-rose-600 mingle-filled text-[#262131] font-bold text-xs shadow-sm shadow-rose-950/50 transition cursor-pointer"
            >
              Open Date Mode Planner
            </button>
          </div>
        )}

        {currentTab === "profile" && (
          <ProfileView
            key={currentUser?.id}
            privacy={currentUser}
            profile={currentProfile}
            cards={connectionCards}
            myCardAnswers={myCardAnswers}
            onSaveCardAnswer={handleSaveCardAnswer}
            onUpdatePrivacy={handleUpdatePrivacy}
            onLogout={handleLogout}
            onOpenKathaPlus={() => setIsKathaPlusOpen(true)}
            onOpenResponders={() => setIsRespondersOpen(true)}
          />
        )}

        {currentTab === "admin" && <AdminDashboard />}
      </main>
      <aside className="community-rail" aria-label="Your Mingle space">
        <button className="rail-profile" onClick={() => currentUser ? setCurrentTab("profile") : setIsAuthOpen(true)}>
          <span className="rail-avatar">{currentProfile?.photos[0]?.url ? <img src={currentProfile.photos[0].url} alt="" /> : <UserRound size={24} />}</span>
          <span><strong>{currentProfile?.first_name || "Your next chapter"}</strong><small>{currentProfile?.city || "Starts with a hello."}</small></span><ArrowUpRight size={18} />
        </button>
        <section className="rail-introduction"><MingleLogo compact /><h2>Good connections.<br />Real conversations.</h2><p>Find a shared interest. Start with a thoughtful note. See where it goes.</p><button onClick={() => currentUser ? setCurrentTab("profile") : setIsAuthOpen(true)}>Make it more you <ArrowUpRight size={16} /></button></section>
        <section className="rail-guide"><h3>A more meaningful hello</h3><p><MessageCircle size={19} /><span>Connection cards give you something real to talk about.</span></p><p><ShieldCheck size={19} /><span>You decide who to connect with and when to meet.</span></p></section>
        <button className="rail-plus" onClick={() => setIsKathaPlusOpen(true)}><span>Meet Mingle Plus<small>A little more possibility.</small></span><ArrowUpRight size={18} /></button>
        <div className="rail-footer"><button onClick={() => setIsPitchTourOpen(true)}>About Mingle.lk</button><span>Made for connections in Sri Lanka.</span></div>
      </aside>
      </div>

      {/* Date Mode Modal */}
      {isDateModalOpen && (
        <DateModeModal
          matchId={dateModalMatchId}
          matches={matches}
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
            sessionStorage.removeItem("mingle_signed_out");
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
        onOpenKathaPlus={() => setIsKathaPlusOpen(true)}
        onQuickDemoLogin={handleQuickDemoLogin}
        onQuickAdminLogin={handleQuickAdminLogin}
      />

      {/* Mingle Plus Micro-Subscription Modal (Issue #4) */}
      <KathaPlusModal
        isOpen={isKathaPlusOpen}
        onClose={() => setIsKathaPlusOpen(false)}
        initialDistrict={currentProfile?.city || "Colombo"}
        onSuccess={() => {
          loadAllAppData();
          api.getMyProfile().then((p) => setCurrentProfile(p)).catch(() => {});
        }}
      />

      {/* Card Responders Drawer (Issue #4) */}
      <CardRespondersDrawer
        isOpen={isRespondersOpen}
        onClose={() => setIsRespondersOpen(false)}
        onOpenKathaPlus={() => setIsKathaPlusOpen(true)}
        onOpenSendNote={() => {
          setCurrentTab("discover");
        }}
      />

      {/* Bottom Navigation */}
      <Navigation
        locale={currentLocale}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        requestCount={requests.length}
        unreadCount={unreadCount}
        isAdmin={currentUser?.role === "admin"}
      />
    </div>
  );
}
