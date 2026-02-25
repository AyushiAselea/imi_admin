import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

type Tab = "all" | "purchased" | "not-purchased" | "failed" | "abandoned";

const tabConfig: { key: Tab; label: string; endpoint: string }[] = [
  { key: "all", label: "All Users", endpoint: "/admin/users" },
  { key: "purchased", label: "Purchased", endpoint: "/admin/users/purchased" },
  { key: "not-purchased", label: "Not Purchased", endpoint: "/admin/users/not-purchased" },
  { key: "failed", label: "Failed Payments", endpoint: "/admin/users/failed-payments" },
  { key: "abandoned", label: "Abandoned Carts", endpoint: "/admin/users/abandoned-carts" },
];

const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const tab = tabConfig.find((t) => t.key === activeTab)!;
    api
      .get(`${tab.endpoint}?page=${page}&limit=20`)
      .then((res) => {
        if (activeTab === "all") {
          setData(res.data);
          setTotalPages(1);
        } else if (activeTab === "failed") {
          setData(res.data.orders || []);
          setTotalPages(res.data.totalPages || 1);
        } else if (activeTab === "abandoned") {
          setData(res.data.carts || []);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setData(res.data.users || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [activeTab, page]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand/10 text-brand"
                : "text-gray-400 hover:text-white hover:bg-surface-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-500">
          No data found.
        </div>
      ) : (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-gray-400 text-left">
                {activeTab === "abandoned" ? (
                  <>
                    <th className="px-5 py-3">Session</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Products</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Last Updated</th>
                  </>
                ) : activeTab === "failed" ? (
                  <>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Products</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Payment ID</th>
                    <th className="px-5 py-3">Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Registered</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item: any, idx: number) => (
                <tr
                  key={item._id || idx}
                  className="border-b border-surface-border/50 hover:bg-surface-hover/40 transition-colors"
                >
                  {activeTab === "abandoned" ? (
                    <>
                      <td className="px-5 py-3 font-mono text-xs">
                        {item.sessionId?.substring(0, 16)}...
                      </td>
                      <td className="px-5 py-3">
                        {item.userId?.name || item.email || "Anonymous"}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {item.products
                          ?.map((p: any) => `${p.name} ×${p.quantity}`)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        ₹{(item.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {fmtDate(item.lastUpdated || item.createdAt)}
                      </td>
                    </>
                  ) : activeTab === "failed" ? (
                    <>
                      <td className="px-5 py-3">
                        <div className="font-medium">{item.user?.name ?? "—"}</div>
                        <div className="text-xs text-gray-500">{item.user?.email ?? ""}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {item.products
                          ?.map((p: any) => `${p.product?.name || "Unknown"} ×${p.quantity}`)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        ₹{(item.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {item.paymentId || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {fmtDate(item.createdAt)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium">{item.name}</td>
                      <td className="px-5 py-3 text-gray-300">{item.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.role === "admin"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {fmtDate(item.createdAt)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded-lg text-sm bg-surface border border-surface-border disabled:opacity-30 hover:bg-surface-hover"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-lg text-sm bg-surface border border-surface-border disabled:opacity-30 hover:bg-surface-hover"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
