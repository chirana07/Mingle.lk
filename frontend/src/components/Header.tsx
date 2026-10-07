"use client";
import React, { useState } from "react";
import { Locale, getTranslation } from "@/i18n";
import { NavTab } from "./Navigation";
import { MingleLogo } from "./MingleLogo";
import { Compass, Heart, MessageCircle, CalendarHeart, User, BarChart3, Presentation, Crown, LogOut, Globe, LogIn, Menu, X } from "lucide-react";

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

export const Header: React.FC<HeaderProps> = ({ currentLocale, onLocaleChange, currentUser, onQuickDemoLogin, onQuickAdminLogin, onLogout, onOpenAuth, onOpenKathaPlus, currentTab = "discover", onTabChange, onTogglePitchDrawer, requestCount = 0, unreadCount = 0, isAdmin = false }) => {
  const t = getTranslation(currentLocale);
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs: { id: NavTab; label: string; icon: typeof Compass; count?: number }[] = [
    { id: "discover", label: t.nav.discover, icon: Compass },
    { id: "requests", label: t.nav.connections, icon: Heart, count: requestCount },
    { id: "chat", label: t.nav.chat, icon: MessageCircle, count: unreadCount },
    { id: "dates", label: t.nav.dates, icon: CalendarHeart },
    { id: "profile", label: t.nav.profile, icon: User },
    ...(isAdmin ? [{ id: "admin" as NavTab, label: t.nav.admin, icon: BarChart3 }] : []),
  ];
  return <>
    <header className="mobile-header">
      <button onClick={() => onTabChange?.("discover")} aria-label="Mingle.lk home"><MingleLogo /></button>
      <div className="mobile-header-actions">
        <button className="icon-button" onClick={() => onTabChange?.("requests")} aria-label={`Connections, ${requestCount} pending`}><Heart size={23} />{requestCount > 0 && <span className="notification-dot" />}</button>
        <button className="icon-button" onClick={() => onTabChange?.("chat")} aria-label={`Messages, ${unreadCount} unread`}><MessageCircle size={23} />{unreadCount > 0 && <span className="notification-dot" />}</button>
        <button className="icon-button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-account-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {menuOpen && <div className="mobile-account-menu" id="mobile-account-menu">
        <label>Language<select aria-label="Mobile language" value={currentLocale} onChange={e => onLocaleChange(e.target.value as Locale)}><option value="en">English</option><option value="si">සිංහල</option><option value="ta">தமிழ்</option></select></label>
        <button onClick={() => { onOpenKathaPlus?.(); setMenuOpen(false); }}><Crown size={18} />Mingle Plus</button>
        <button onClick={() => { onTogglePitchDrawer?.(); setMenuOpen(false); }}><Presentation size={18} />Investor tour</button>
        {currentUser ? <button onClick={onLogout}><LogOut size={18} />Log out</button> : <><button onClick={() => { onQuickDemoLogin(); setMenuOpen(false); }}>Try demo</button><button onClick={() => { onOpenAuth(); setMenuOpen(false); }}>Log in</button></>}
      </div>}
    </header>
    <aside className="desktop-sidebar">
      <button className="sidebar-brand" onClick={() => onTabChange?.("discover")} aria-label="Mingle.lk home"><MingleLogo /></button>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {tabs.map(({id,label,icon: Icon,count}) => <button key={id} aria-current={currentTab === id ? "page" : undefined} onClick={() => onTabChange?.(id)} className={`sidebar-link ${currentTab === id ? "active" : ""}`}><Icon size={23} strokeWidth={currentTab === id ? 2.2 : 1.7} /><span>{label}</span>{!!count && <span className="nav-badge">{count}</span>}</button>)}
      </nav>
      {onOpenKathaPlus && <button className="sidebar-plus" onClick={onOpenKathaPlus}><Crown size={20} /><span>Mingle Plus</span><span className="plus-symbol">+</span></button>}
      <div className="sidebar-bottom">
        <label className="sidebar-language"><Globe size={19} /><span className="sr-only">Language</span><select aria-label="Language" value={currentLocale} onChange={e => onLocaleChange(e.target.value as Locale)}><option value="en">English</option><option value="si">සිංහල</option><option value="ta">தமிழ்</option></select></label>
        {onTogglePitchDrawer && <button className="sidebar-secondary" onClick={onTogglePitchDrawer}><Presentation size={19} /><span>Investor tour</span></button>}
        {currentUser ? <button className="sidebar-secondary" onClick={onLogout}><LogOut size={19} /><span>Log out</span></button> : <><button className="sidebar-secondary" onClick={onQuickDemoLogin}><User size={19} /><span>Try demo</span></button><button className="sidebar-secondary" onClick={onOpenAuth}><LogIn size={19} /><span>Log in</span></button></>}
        <button className="sidebar-secondary" onClick={onQuickAdminLogin}><BarChart3 size={19} /><span>Admin demo</span></button>
        <p className="sidebar-signoff">A little closer to your people.</p>
      </div>
    </aside>
  </>;
};
