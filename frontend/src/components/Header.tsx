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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-rose-900/40">
            ක
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
              Katha
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Mingle.lk
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on Tablet/Desktop) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => onTabChange("discover")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === "discover"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => onTabChange("requests")}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === "requests"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Requests</span>
              {requestCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {requestCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("chat")}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === "chat"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("dates")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === "dates"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CalendarHeart className="w-4 h-4" />
              <span>Date Mode</span>
            </button>

            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === "profile"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onTabChange("admin")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentTab === "admin"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-amber-400/80 hover:text-amber-300"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Katha Plus Micro-Pass Button */}
          {onOpenKathaPlus && (
            <button
              onClick={onOpenKathaPlus}
              className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 transition shadow-sm cursor-pointer"
              title="Katha Plus LKR Micro-Subscription"
            >
              <Crown className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="hidden sm:inline">Katha Plus</span>
            </button>
          )}

          {/* Investor Pitch Tour Launcher */}
          {onTogglePitchDrawer && (
            <button
              onClick={onTogglePitchDrawer}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:from-amber-500/30 hover:to-rose-500/30 transition shadow-sm cursor-pointer"
              title="Interactive Investor Guided Pitch Walkthrough"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Investor Pitch Tour</span>
              <span className="md:hidden">Pitch Tour</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <select
              value={currentLocale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="bg-transparent text-xs text-slate-200 font-medium py-1 pr-2 pl-0.5 focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="si" className="bg-slate-900 text-white">සිං</option>
              <option value="ta" className="bg-slate-900 text-white">தம</option>
            </select>
          </div>

          {/* User state / Quick Demo switcher */}
          {currentUser ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onLogout}
                title="Log out"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onQuickDemoLogin}
                className="text-xs font-semibold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-3 py-1.5 rounded-xl shadow transition flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Demo User</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
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
