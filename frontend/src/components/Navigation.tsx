"use client";

import { Locale, getTranslation } from "@/i18n";
import React from "react";
import { Compass, UserPlus, MessageCircle, CalendarHeart, User, BarChart3 } from "lucide-react";

export type NavTab = "discover" | "requests" | "chat" | "dates" | "profile" | "admin";

interface NavigationProps {
  locale?: Locale;
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  requestCount?: number;
  unreadCount?: number;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  locale = "en",
  currentTab,
  onTabChange,
  requestCount = 0,
  unreadCount = 0,
  isAdmin = false,
}) => {
  const t = getTranslation(locale);
  const tabs = [
    { id: "discover", label: t.nav.discover, icon: Compass, count: 0 },
    { id: "requests", label: t.nav.connections, icon: UserPlus, count: requestCount },
    { id: "chat", label: t.nav.chat, icon: MessageCircle, count: unreadCount },
    { id: "dates", label: t.nav.dates, icon: CalendarHeart, count: 0 },
    { id: "profile", label: t.nav.profile, icon: User, count: 0 },
  ];

  if (isAdmin) {
    tabs.push({ id: "admin", label: t.nav.admin, icon: BarChart3, count: 0 });
  }

  return <nav className="mobile-navigation" aria-label="Mobile navigation">
    {tabs.map(tab => { const Icon = tab.icon; const active = currentTab === tab.id;
      return <button key={tab.id} aria-current={active ? "page" : undefined} onClick={() => onTabChange(tab.id as NavTab)} className={active ? "active" : ""}>
        <span className="nav-icon"><Icon size={23} strokeWidth={active ? 2.3 : 1.7} />{tab.count > 0 && <span className="nav-badge">{tab.count}</span>}</span><span>{tab.label}</span>
      </button>;
    })}
  </nav>;
};
