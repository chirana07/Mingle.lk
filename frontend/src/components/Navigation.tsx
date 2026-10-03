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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Discover */}
        <button
          onClick={() => onTabChange("discover")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "discover" ? "text-rose-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Compass className={`w-5 h-5 ${currentTab === "discover" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Discover</span>
        </button>

        {/* Connection Requests */}
        <button
          onClick={() => onTabChange("requests")}
          className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "requests" ? "text-rose-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserPlus className={`w-5 h-5 ${currentTab === "requests" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Requests</span>
          {requestCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {requestCount}
            </span>
          )}
        </button>

        {/* Chat / Matches */}
        <button
          onClick={() => onTabChange("chat")}
          className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "chat" ? "text-rose-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageCircle className={`w-5 h-5 ${currentTab === "chat" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Messages</span>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Date Mode */}
        <button
          onClick={() => onTabChange("dates")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "dates" ? "text-rose-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CalendarHeart className={`w-5 h-5 ${currentTab === "dates" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Date Mode</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            currentTab === "profile" ? "text-rose-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === "profile" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>

        {/* Admin */}
        {isAdmin && (
          <button
            onClick={() => onTabChange("admin")}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              currentTab === "admin" ? "text-amber-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${currentTab === "admin" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        )}
      </div>
    </nav>

  );
};
