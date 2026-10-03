"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminMetrics } from "@/lib/types";
import { api } from "@/lib/api";
import {
  BarChart3,
  Users,
  ShieldCheck,
  CalendarHeart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldAlert,
  Search,
  RefreshCw,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"metrics" | "moderation" | "users">("metrics");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [m, r, u] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminReports().catch(() => []),
        api.getAdminUsers().catch(() => []),
      ]);
      setMetrics(m);
      setReports(r);
      setUsers(u);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateReport = async (reportId: string, status: string) => {
    try {
      await api.updateAdminReport(reportId, status, `Reviewed by Admin at ${new Date().toLocaleTimeString()}`);
      await loadData();
    } catch (e: any) {
      alert("Failed to update report: " + e.message);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await api.updateAdminUser(userId, { status });
      await loadData();
    } catch (e: any) {
      alert("Failed to update user: " + e.message);
    }
  };

  const handleToggleVerifyUser = async (userId: string, currentVal: boolean) => {
    try {
      await api.updateAdminUser(userId, { is_selfie_verified: !currentVal });
      await loadData();
    } catch (e: any) {
      alert("Failed to update verification: " + e.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Investor & Admin Center</h2>
            <p className="text-slate-400 text-[10px]">Real-time Sri Lankan platform KPIs & Safety</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-rose-400" : ""}`} />
        </button>
      </div>

      {/* Admin Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`py-2 rounded-xl transition ${
            activeTab === "metrics" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Key Metrics
        </button>
        <button
          onClick={() => setActiveTab("moderation")}
          className={`py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
            activeTab === "moderation" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Moderation</span>
          {reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center justify-center">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-2 rounded-xl transition ${
            activeTab === "users" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          User Accounts
        </button>
      </div>

      {/* Tab 1: Investor Metrics Funnel */}
      {activeTab === "metrics" && metrics && (
        <div className="space-y-3">
          {/* North Star Metric Banner */}
          <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/40 border border-rose-500/30 rounded-3xl p-4 shadow-xl">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
              North-Star Conversion Funnel
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <span className="text-3xl font-extrabold text-white">{metrics.dates_planned}</span>
                <span className="text-xs text-rose-300 ml-1.5 font-medium">Safe Dates Planned</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Conv-to-Date</span>
                <span className="text-base font-bold text-emerald-400">{metrics.conversation_to_date_rate}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 leading-tight">
              Proves user journey progress: Discover → Understand → Connect → Safe Real-World Meeting.
            </p>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 block mb-1">Total Users (Sri Lanka)</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-white">{metrics.total_users}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active seed</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 block mb-1">Verified Users</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-white">{metrics.verified_users}</span>
                <span className="text-[10px] text-sky-400 font-semibold">Phone/ID</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 block mb-1">Mutual Connections</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-white">{metrics.matches_created}</span>
                <span className="text-[10px] text-rose-400 font-semibold">Matched</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 block mb-1">Chat Start Rate</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-white">{metrics.match_to_conversation_rate}%</span>
                <span className="text-[10px] text-amber-400 font-semibold">Bench &gt;50%</span>
              </div>
            </div>
          </div>

          {/* Platform Safety Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Platform Safety Health</span>
                <span className="text-[10px] text-slate-400">Incident rate: {metrics.safety_incident_rate}%</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Healthy
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-white font-bold text-xs">Flagged Cases & Reports</h3>
            <span className="text-[10px] text-slate-400">{reports.length} total reports</span>
          </div>

          {reports.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              No reports filed yet. The community is healthy!
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((r) => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        {r.category}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === "pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    &quot;{r.details}&quot;
                  </p>

                  {r.status === "pending" && (
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleUpdateReport(r.id, "action_taken")}
                        className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition"
                      >
                        Action Taken (Sanction)
                      </button>
                      <button
                        onClick={() => handleUpdateReport(r.id, "dismissed")}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Accounts */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone, email, or user ID..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.slice(0, 15).map((u) => (
              <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[200px]">
                    {u.phone || u.email || "User " + u.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span>Role: {u.role}</span>
                  <span>•</span>
                  <span>Verified: {u.is_phone_verified ? "Phone ✓" : "No"}</span>
                  {u.is_selfie_verified && <span>Photo ✓</span>}
                </div>

                <div className="flex space-x-1.5 pt-1">
                  <button
                    onClick={() => handleToggleVerifyUser(u.id, u.is_selfie_verified)}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-medium border border-slate-700 transition"
                  >
                    {u.is_selfie_verified ? "Revoke Photo Badge" : "Grant Photo Badge"}
                  </button>

                  {u.status === "active" ? (
                    <button
                      onClick={() => handleUpdateUserStatus(u.id, "suspended")}
                      className="py-1 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[10px] font-medium border border-rose-800 transition"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateUserStatus(u.id, "active")}
                      className="py-1 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-[10px] font-medium border border-emerald-800 transition"
                    >
                      Restore Active
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
