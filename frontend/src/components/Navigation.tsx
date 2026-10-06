"use client";

import React from "react";
import { Compass, UserPlus, MessageCircle, CalendarHeart, User, BarChart3 } from "lucide-react";

export type NavTab = "discover" | "requests" | "chat" | "dates" | "profile" | "admin";

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  requestCount?: number;
  unreadCount?: number;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  requestCount = 0,
  unreadCount = 0,
  isAdmin = false,
}) => {
  const tabs = [
    { id: "discover", label: "Discover", icon: Compass, count: 0 },
    { id: "requests", label: "Requests", icon: UserPlus, count: requestCount },
    { id: "chat", label: "Messages", icon: MessageCircle, count: unreadCount },
    { id: "dates", label: "Date Mode", icon: CalendarHeart, count: 0 },
    { id: "profile", label: "Profile", icon: User, count: 0 },
  ];

  if (isAdmin) {
    tabs.push({ id: "admin", label: "Admin", icon: BarChart3, count: 0 });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/92 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-2 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavTab)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 select-none active:scale-90 ${
                isActive
                  ? "bg-rose-500/15 text-rose-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.4] scale-110 text-rose-400" : "stroke-[1.8]"
                  }`}
                />
                {tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-md shadow-rose-950/60 ring-2 ring-[#090D16] animate-pulse">
                    {tab.count}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight transition-colors ${
                  isActive ? "text-rose-300 font-bold" : "text-slate-400 font-medium"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
