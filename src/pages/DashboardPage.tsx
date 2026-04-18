import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Package, ShoppingCart, Users, DollarSign, ShoppingBag, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
  abandonedCarts: number;
  failedOrders: number;
  codCollected: number;
  codPending: number;
}

const cards = [
  { key: "totalProducts" as const, label: "Total Products", icon: Package, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "totalOrders" as const, label: "Total Orders", icon: ShoppingCart, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "totalUsers" as const, label: "Total Users", icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
  { key: "revenue" as const, label: "Revenue", icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { key: "abandonedCarts" as const, label: "Abandoned Carts", icon: ShoppingBag, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "failedOrders" as const, label: "Failed Payments", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  { key: "codCollected" as const, label: "COD/Partial Collected", icon: CheckCircle2, color: "text-teal-400", bg: "bg-teal-500/10" },
  { key: "codPending" as const, label: "COD/Partial Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(({ key, label, icon: Icon, color, bg }) => (
          <div
            key={key}
            className="glass rounded-2xl p-5 hover:glow-border transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{label}</span>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {key === "revenue"
                ? `₹${(stats?.[key] ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                : stats?.[key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Welcome to IMI Admin</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Use the sidebar to manage products, view orders, and update site settings. All changes are reflected on the live website instantly.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
