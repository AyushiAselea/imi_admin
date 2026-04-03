import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, X } from "lucide-react";

const formatVariant = (variant: string) => {
  if (!variant) return "";
  const parts = variant.split(" / ");
  const frameMap: Record<string, string> = { black: "Matte Black", white: "Pearl White", blue: "Ocean Blue" };
  const glassMap: Record<string, string> = { black: "Black Glass", transparent: "Transparent" };
  if (parts.length === 2) {
    const frame = frameMap[parts[0].trim()] || parts[0].trim();
    const glass = glassMap[parts[1].trim()] || parts[1].trim();
    return `${frame} / ${glass}`;
  }
  // old single-value format (just frame color)
  return frameMap[parts[0].trim()] || parts[0].trim();
};

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  } | null;
  productName?: string | null;
  price?: number | null;
  quantity: number;
  variant?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string } | null;
  guestInfo?: { name?: string; email?: string; phone?: string } | null;
  products: OrderProduct[];
  totalAmount: number;
  advanceAmount?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  deliveryPaymentPending?: boolean;
  shippingAddress?: ShippingAddress | null;
  status: string;
  paymentStatus: string;
  paymentId?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-400",
  Processing: "bg-blue-500/10 text-blue-400",
  Shipped: "bg-purple-500/10 text-purple-400",
  Delivered: "bg-green-500/10 text-green-400",
  Cancelled: "bg-red-500/10 text-red-400",
};

const paymentColors: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-400",
  Success: "bg-green-500/10 text-green-400",
  Failed: "bg-red-500/10 text-red-400",
  Partial: "bg-orange-500/10 text-orange-400",
};

const methodColors: Record<string, string> = {
  ONLINE: "bg-blue-500/10 text-blue-400",
  COD: "bg-amber-500/10 text-amber-400",
  PARTIAL: "bg-orange-500/10 text-orange-400",
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/admin/orders/${id}`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      if (selected?._id === id) setSelected(data);
      toast.success("Order updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-500">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-gray-400 text-left">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-b border-surface-border/50 hover:bg-surface-hover/40 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium">{o.user?.name ?? o.guestInfo?.name ?? "Guest"}</div>
                    <div className="text-xs text-gray-500">
                      {o.user?.email ?? o.guestInfo?.email ?? ""}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-300">
                    {o.products.map((p, i) => {
                      const name = p.product?.name ?? p.productName ?? "Unknown";
                      const variant = formatVariant(p.variant || "");
                      return (
                        <div key={i} className="leading-tight mb-0.5">
                          <span>{name} × {p.quantity}</span>
                          {variant && (
                            <span className="inline-block ml-1.5 px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium">{variant}</span>
                          )}
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    ₹{o.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        methodColors[o.paymentMethod || "ONLINE"] ?? ""
                      }`}
                    >
                      {o.paymentMethod || "ONLINE"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        paymentColors[o.paymentStatus] ?? ""
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={o.status}
                      disabled={updatingId === o._id}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand/50"
                    >
                      {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {fmtDate(o.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelected(o)}
                      className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-brand transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Order Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500">Order ID</span>
                  <p className="font-mono text-xs break-all">{selected._id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date</span>
                  <p>{fmtDate(selected.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Customer</span>
                  <p>{selected.user?.name ?? "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="break-all">{selected.user?.email ?? "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Payment Method</span>
                  <p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        methodColors[selected.paymentMethod || "ONLINE"] ?? ""
                      }`}
                    >
                      {selected.paymentMethod || "ONLINE"}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Payment Status</span>
                  <p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        paymentColors[selected.paymentStatus] ?? ""
                      }`}
                    >
                      {selected.paymentStatus}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Transaction ID</span>
                  <p className="font-mono text-xs break-all">
                    {selected.paymentId || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Delivery Payment</span>
                  <p className="text-xs">
                    {selected.deliveryPaymentPending ? (
                      <span className="text-amber-400">₹{(selected.remainingAmount ?? 0).toFixed(2)} pending</span>
                    ) : (
                      <span className="text-green-400">Fully paid</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Amount Breakdown */}
              {(selected.paymentMethod === "PARTIAL" || selected.paymentMethod === "COD") && (
                <div className="rounded-xl bg-surface/50 border border-surface-border/50 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-medium">₹{selected.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Advance Paid</span>
                    <span className="text-green-400 font-medium">₹{(selected.advanceAmount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Remaining (collect on delivery)</span>
                    <span className="text-amber-400 font-medium">₹{(selected.remainingAmount ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {selected.shippingAddress && (
                <div>
                  <span className="text-gray-500 block mb-2">Shipping Address</span>
                  <div className="rounded-xl bg-surface/50 border border-surface-border/50 p-3 text-xs space-y-0.5 text-gray-300">
                    <p className="font-medium text-white">{selected.shippingAddress.fullName}</p>
                    <p>{selected.shippingAddress.phone}</p>
                    <p>{selected.shippingAddress.addressLine1}</p>
                    {selected.shippingAddress.addressLine2 && <p>{selected.shippingAddress.addressLine2}</p>}
                    <p>{selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.postalCode}</p>
                    <p>{selected.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-500 block mb-2">Products</span>
                {selected.products.map((p, i) => {
                  const name = p.product?.name ?? p.productName ?? "Unknown";
                  const unitPrice = p.product?.price ?? p.price ?? 0;
                  const variant = formatVariant(p.variant || "");
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 border-b border-surface-border/30 last:border-0"
                    >
                      {p.product?.image ? (
                        <img
                          src={p.product.image}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-surface-hover" />
                      )}
                      <div className="flex-1">
                        <span className="block font-medium">{name}</span>
                        {variant && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium">{variant}</span>
                        )}
                      </div>
                      <span className="text-gray-400">× {p.quantity}</span>
                      <span>
                        ₹{(unitPrice * p.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2 border-t border-surface-border font-bold">
                <span>Total</span>
                <span>₹{selected.totalAmount.toFixed(2)}</span>
              </div>

              {/* Status changer */}
              <div>
                <label className="text-gray-500 block mb-1">
                  Update Status
                </label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected._id, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                >
                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
