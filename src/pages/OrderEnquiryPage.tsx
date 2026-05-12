import React, { useState } from "react";
import { Eye, Pencil, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface OrderEnquiry {
  id: string;
  name: string;
  email: string;
  product: string;
  variant: string;
  quantity: number;
  paymentMethod: string;
  date: string;
}

const initialEnquiries: OrderEnquiry[] = [
  {
    id: "ENQ001",
    name: "Vedant Bajaj",
    email: "thegrypx@gmail.com",
    product: "IMI Glasses Mark 2",
    variant: "Matte Black / white Glass",
    quantity: 1,
    paymentMethod: "Online",
    date: "2026-02-01",
  },
  {
    id: "ENQ002",
    name: "Nikhil Soni",
    email: "nikhilsoni4121@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Matte Black / Black Glass",
    quantity: 2,
    paymentMethod: "COD",
    date: "2026-02-03",
  },
  {
    id: "ENQ003",
    name: "Priya Singh",
    email: "priyasingh121@email.com",
    product: "IMI Glasses Mark 2",
    variant: "Pearl White / Transparent",
    quantity: 1,
    paymentMethod: "Online",
    date: "2026-02-05",
  },
  {
    id: "ENQ004",
    name: "",
    email: "rahulgupta7014@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Black",
    quantity: 1,
    paymentMethod: "PARTIAL",
    date: "2026-02-07",
  },
  {
    id: "ENQ005",
    name: "Neha Gupta",
    email: "neha.gupta@email.com",
    product: "IMI Glasses Mark 2",
    variant: "white0 / Black Glass",
    quantity: 1,
    paymentMethod: "COD",
    date: "2026-02-09",
  },
];

const OrderEnquiryPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<OrderEnquiry[]>(initialEnquiries);
  const [selected, setSelected] = useState<OrderEnquiry | null>(null);
  const [editTarget, setEditTarget] = useState<OrderEnquiry | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    product: "",
    variant: "",
    quantity: "",
    paymentMethod: "",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openEdit = (enquiry: OrderEnquiry) => {
    setEditTarget(enquiry);
    setEditForm({
      name: enquiry.name,
      email: enquiry.email,
      product: enquiry.product,
      variant: enquiry.variant,
      quantity: String(enquiry.quantity),
      paymentMethod: enquiry.paymentMethod,
      date: enquiry.date,
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!editForm.name || !editForm.email || !editForm.product) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const updatedEnquiry: OrderEnquiry = {
        ...editTarget,
        name: editForm.name,
        email: editForm.email,
        product: editForm.product,
        variant: editForm.variant,
        quantity: Number(editForm.quantity),
        paymentMethod: editForm.paymentMethod,
        date: editForm.date,
      };
      setEnquiries((prev) =>
        prev.map((e) => (e.id === editTarget.id ? updatedEnquiry : e))
      );
      if (selected?.id === editTarget.id) setSelected(updatedEnquiry);
      toast.success("Enquiry updated");
      setEditTarget(null);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteEnquiry = (id: string) => {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Enquiry deleted");
    } finally {
      setDeletingId(null);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const INPUT =
    "w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50";
  const LABEL = "block text-xs text-gray-500 mb-1";

  const methodColors: Record<string, string> = {
    Online: "bg-blue-500/10 text-blue-400",
    COD: "bg-amber-500/10 text-amber-400",
    PARTIAL: "bg-orange-500/10 text-orange-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Enquiries</h1>

      {enquiries.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-500">
          No enquiries yet.
        </div>
      ) : (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-gray-400 text-left">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Variant</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-surface-border/50 hover:bg-surface-hover/40 transition-colors"
                >
                  <td className="px-5 py-3 font-medium">{e.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{e.email}</td>
                  <td className="px-5 py-3 text-gray-300">{e.product}</td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium">
                      {e.variant}
                    </span>
                  </td>
                  <td className="px-5 py-3">{e.quantity}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        methodColors[e.paymentMethod] || ""
                      }`}
                    >
                      {e.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {fmtDate(e.date)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelected(e)}
                        title="View"
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-brand transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(e)}
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEnquiry(e.id)}
                        disabled={deletingId === e.id}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── View Detail Modal ─── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Enquiry Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelected(null);
                    openEdit(selected);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs font-medium transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500">Enquiry ID</span>
                  <p className="font-mono text-xs">{selected.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date</span>
                  <p>{fmtDate(selected.date)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Name</span>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="break-all text-xs">{selected.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Payment Method</span>
                  <p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        methodColors[selected.paymentMethod] || ""
                      }`}
                    >
                      {selected.paymentMethod}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-surface/50 border border-surface-border/50 p-3 space-y-2">
                <div>
                  <span className="text-gray-500 text-xs">Product</span>
                  <p className="font-medium">{selected.product}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Variant</span>
                  <p className="inline-block mt-1 px-2 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium">
                    {selected.variant}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Quantity</span>
                  <p className="font-medium">{selected.quantity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold">Edit Enquiry</h2>
                <p className="text-xs text-gray-500 font-mono">{editTarget.id}</p>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className={LABEL}>Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Product *</label>
                <input
                  type="text"
                  value={editForm.product}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, product: e.target.value }))
                  }
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Variant</label>
                <input
                  type="text"
                  value={editForm.variant}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, variant: e.target.value }))
                  }
                  className={INPUT}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Payment Method</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        paymentMethod: e.target.value,
                      }))
                    }
                    className={INPUT}
                  >
                    <option value="Online">Online</option>
                    <option value="COD">COD</option>
                    <option value="PARTIAL">Partial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL}>Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className={INPUT}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-gray-400 hover:bg-surface-hover text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderEnquiryPage;
