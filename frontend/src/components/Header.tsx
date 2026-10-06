"use client";

import React from "react";
import { Locale } from "@/i18n";
import { NavTab } from "./Navigation";
import {
  Sparkles,
  Globe,
  LogOut,
  Compass,
  UserPlus,
  MessageCircle,
  CalendarHeart,
  User,
  BarChart3,
  Presentation,
  Crown,
} from "lucide-react";

interface HeaderProps {
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
  currentUser: any;
  onQuickDemoLogin: () => void;
  onQuickAdminLogin: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenKathaPlus?: () => void;
  currentTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onTogglePitchDrawer?: () => void;
  requestCount?: number;
  unreadCount?: number;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocale,
  onLocaleChange,
  currentUser,
  onQuickDemoLogin,
  onQuickAdminLogin,
  onLogout,
  onOpenAuth,
  onOpenKathaPlus,
  currentTab = "discover",
  onTabChange,
  onTogglePitchDrawer,
  requestCount = 0,
  unreadCount = 0,
  isAdmin = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/[0.07] text-white px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onTabChange?.("discover")}
          className="flex items-center space-x-3 cursor-pointer group select-none shrink-0"
        >
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 p-[1.5px] shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0E1424] rounded-[14px] flex items-center justify-center">
              <span className="font-bold text-base text-rose-300 font-sans tracking-tight">ක</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090D16]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-rose-200 transition-colors">
                Katha
              </span>
              <span className="text-[10px] font-semibold text-rose-400/90 font-mono tracking-wider">
                කතා
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-semibold text-slate-400">
              Sri Lanka · Mingle.lk
            </span>
          </div>
        </div>

        {/* Desktop Segmented Navigation */}
        {onTabChange && (
          <nav className="hidden md:flex items-center space-x-1 bg-[#101623]/90 p-1 rounded-2xl border border-white/[0.07] shadow-inner">
            <button
              onClick={() => onTabChange("discover")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "discover"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Compass className="w-4 h-4 stroke-[2]" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => onTabChange("requests")}
              className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "requests"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <UserPlus className="w-4 h-4 stroke-[2]" />
              <span>Requests</span>
              {requestCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                  {requestCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("chat")}
              className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "chat"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <MessageCircle className="w-4 h-4 stroke-[2]" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => onTabChange("dates")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "dates"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <CalendarHeart className="w-4 h-4 stroke-[2]" />
              <span>Date Mode</span>
            </button>

            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                currentTab === "profile"
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <User className="w-4 h-4 stroke-[2]" />
              <span>Profile</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onTabChange("admin")}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "admin"
                    ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/40"
                    : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                <BarChart3 className="w-4 h-4 stroke-[2]" />
                <span>Admin</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Katha Plus Micro-Pass Button */}
          {onOpenKathaPlus && (
            <button
              onClick={onOpenKathaPlus}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-105 transition shadow-md shadow-amber-950/30 cursor-pointer active:scale-95"
              title="Katha Plus LKR Micro-Subscription"
            >
              <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Katha Plus</span>
            </button>
          )}

          {/* Investor Pitch Tour Launcher */}
          {onTogglePitchDrawer && (
            <button
              onClick={onTogglePitchDrawer}
              className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-amber-300 border border-amber-500/30 transition shadow-sm cursor-pointer active:scale-95"
              title="Interactive Investor Guided Pitch Walkthrough"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-xs">Pitch Deck</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative flex items-center bg-[#101623] rounded-xl px-2 py-1 border border-white/[0.08]">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={currentLocale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-[#101623] text-white">EN</option>
              <option value="si" className="bg-[#101623] text-white">සිංහල</option>
              <option value="ta" className="bg-[#101623] text-white">தமிழ்</option>
            </select>
          </div>

          {/* User state / Quick Demo switcher */}
          {currentUser ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onLogout}
                title="Log out"
                className="p-2 rounded-xl bg-[#101623] hover:bg-white/[0.08] text-slate-400 hover:text-rose-400 border border-white/[0.08] transition active:scale-95"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onQuickDemoLogin}
                className="text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl shadow-md shadow-rose-950/40 transition flex items-center space-x-1 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Demo User</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="text-xs font-medium bg-[#101623] hover:bg-white/[0.08] text-slate-300 px-3 py-1.5 rounded-xl border border-white/[0.08] transition active:scale-95"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
