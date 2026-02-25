import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  BarChart3,
  Eye,
  Clock,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Users,
  Globe,
  Cpu,
  MousePointerClick,
  ExternalLink,
} from "lucide-react";

interface AnalyticsData {
  period: string;
  totalPageviews: number;
  uniqueSessions: number;
  bounceRate: number;
  avgSessionDurationSeconds: number;
  pageViewsByPage: { _id: string; count: number }[];
  deviceBreakdown: { _id: string; count: number }[];
  browserBreakdown: { _id: string; count: number }[];
  osBreakdown: { _id: string; count: number }[];
  topEntryPages: { _id: string; count: number }[];
  topExitPages: { _id: string; count: number }[];
  dailyPageviews: { _id: string; count: number }[];
  topButtonClicks: { _id: string; count: number }[];
}

const deviceIcon: Record<string, any> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Monitor,
};

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [realtime, setRealtime] = useState<{ activeUsers: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/admin/analytics/dashboard?days=${days}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    const fetchRealtime = () => {
      api
        .get("/admin/analytics/realtime")
        .then((res) => setRealtime(res.data))
        .catch(() => {});
    };
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center h-40 items-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-gray-500">
        No analytics data available.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-3">
          {/* Link to Google Analytics Dashboard */}
          <a
            href="https://analytics.google.com/analytics/web/#/p/G-2L86LZED1E"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Google Analytics
          </a>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  days === d
                    ? "bg-brand/10 text-brand"
                    : "text-gray-400 hover:text-white hover:bg-surface-hover"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Page Views</span>
            <Eye className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold">{data.totalPageviews.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Sessions</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold">{data.uniqueSessions.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Bounce Rate</span>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold">{data.bounceRate}%</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Avg Session</span>
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold">{formatDuration(data.avgSessionDurationSeconds)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Now</span>
            <BarChart3 className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold">{realtime?.activeUsers ?? 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Top Pages
          </h2>
          <div className="space-y-3">
            {data.pageViewsByPage.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate flex-1">{item._id}</span>
                <span className="text-sm font-medium ml-3">{item.count}</span>
              </div>
            ))}
            {data.pageViewsByPage.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Device Breakdown
          </h2>
          <div className="space-y-3">
            {data.deviceBreakdown.map((item) => {
              const Icon = deviceIcon[item._id] || Monitor;
              const total = data.deviceBreakdown.reduce((s, d) => s + d.count, 0);
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={item._id} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300 capitalize flex-1">{item._id}</span>
                  <span className="text-sm font-medium">{pct}%</span>
                  <span className="text-xs text-gray-500">({item.count})</span>
                </div>
              );
            })}
            {data.deviceBreakdown.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Entry Pages */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Top Entry Pages
          </h2>
          <div className="space-y-3">
            {data.topEntryPages.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate flex-1">{item._id}</span>
                <span className="text-sm font-medium ml-3">{item.count}</span>
              </div>
            ))}
            {data.topEntryPages.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Exit Pages */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Top Exit Pages
          </h2>
          <div className="space-y-3">
            {data.topExitPages.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate flex-1">{item._id}</span>
                <span className="text-sm font-medium ml-3">{item.count}</span>
              </div>
            ))}
            {data.topExitPages.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── New Row: Browser · OS · Button Clicks ── */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Browser Breakdown */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" /> Browser
          </h2>
          <div className="space-y-3">
            {(data.browserBreakdown ?? []).map((item) => {
              const total = (data.browserBreakdown ?? []).reduce((s, d) => s + d.count, 0);
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 flex-1">{item._id || "Unknown"}</span>
                  <div className="flex-1 bg-surface-hover rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-sky-400/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
            {(data.browserBreakdown ?? []).length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
          </div>
        </div>

        {/* OS Breakdown */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" /> Operating System
          </h2>
          <div className="space-y-3">
            {(data.osBreakdown ?? []).map((item) => {
              const total = (data.osBreakdown ?? []).reduce((s, d) => s + d.count, 0);
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 flex-1">{item._id || "Unknown"}</span>
                  <div className="flex-1 bg-surface-hover rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-violet-400/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
            {(data.osBreakdown ?? []).length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Top Button Clicks */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-amber-400" /> Top Button Clicks
          </h2>
          <div className="space-y-3">
            {(data.topButtonClicks ?? []).filter(item => item._id).map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-300 truncate flex-1">{item._id}</span>
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-medium shrink-0">
                  {item.count}×
                </span>
              </div>
            ))}
            {(data.topButtonClicks ?? []).filter(item => item._id).length === 0 && (
              <p className="text-gray-500 text-sm">No clicks recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Chart (simple bar view) */}
      {data.dailyPageviews.length > 0 && (
        <div className="glass rounded-2xl p-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Daily Pageviews
          </h2>
          <div className="flex items-end gap-1 h-32">
            {data.dailyPageviews.map((day) => {
              const max = Math.max(...data.dailyPageviews.map((d) => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">{day.count}</span>
                  <div
                    className="w-full bg-brand/30 rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[9px] text-gray-600 truncate w-full text-center">
                    {day._id.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
