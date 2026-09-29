"use client";

import React from "react";
import { Locale } from "@/i18n";
import { ShieldCheck, Sparkles, Globe, UserCheck, LogOut } from "lucide-react";

interface HeaderProps {
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
  currentUser: any;
  onQuickDemoLogin: () => void;
  onQuickAdminLogin: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocale,
  onLocaleChange,
  currentUser,
  onQuickDemoLogin,
  onQuickAdminLogin,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md">
            ක
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-rose-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                Katha
              </span>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                Mingle.lk
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Sri Lankan Relationship Discovery</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <div className="relative flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
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
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={onQuickDemoLogin}
                className="text-[11px] font-semibold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-2.5 py-1.5 rounded-lg shadow transition flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Demo User</span>
              </button>
              <button
                onClick={onOpenAuth}
                className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-700 transition"
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
