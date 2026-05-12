import React, { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface OrderEnquiry {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  product: string;
  variant?: string;
  quantity?: number;
  paymentMethod: string;
  date: string;
  status?: string;
  notes?: string;
  glasses?: string;
  heardAbout?: string;
}

const API_URL = "https://imi-backend-s85v.onrender.com/api";

const staticEnquiries: OrderEnquiry[] = [
  {
    _id: "STATIC001",
    id: "STATIC001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Matte Black / Black Glass",
    quantity: 1,
    paymentMethod: "Online",
    date: "2026-01-28",
    status: "Interested",
  },
  {
    _id: "STATIC002",
    id: "STATIC002",
    name: "Priya Singh",
    email: "priya.singh@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Matte Black / Black Glass",
    quantity: 2,
    paymentMethod: "COD",
    date: "2026-01-29",
    status: "New",
  },
  {
    _id: "STATIC003",
    id: "STATIC003",
    name: "Amit Patel",
    email: "amit.patel@email.com",
    product: "IMI Glasses Mark 2",
    variant: "Pearl White / Transparent",
    quantity: 1,
    paymentMethod: "Online",
    date: "2026-01-30",
    status: "Contacted",
  },
  {
    _id: "STATIC004",
    id: "STATIC004",
    name: "Neha Gupta",
    email: "neha.gupta@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Matte Black / Black Glass",
    quantity: 3,
    paymentMethod: "PARTIAL",
    date: "2026-01-31",
    status: "New",
  },
  {
    _id: "STATIC005",
    id: "STATIC005",
    name: "Sanjay Verma",
    email: "sanjay.verma@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Ocean Blue / Black Glass",
    quantity: 1,
    paymentMethod: "Online",
    date: "2026-01-25",
    status: "Not Interested",
  },
  {
    _id: "STATIC006",
    id: "STATIC006",
    name: "Ananya Desai",
    email: "ananya.desai@email.com",
    product: "IMI Glasses Mark 2",
    variant: "Matte Black / Black Glass",
    quantity: 2,
    paymentMethod: "COD",
    date: "2026-01-26",
    status: "Interested",
  },
  {
    _id: "STATIC007",
    id: "STATIC007",
    name: "Vedant Bajaj",
    email: "thegrypx@gmail.com",
    product: "IMI Glasses Mark 2",
    variant: "Matte Black / white Glass",
    quantity: 20,
    paymentMethod: "Online",
    date: "2026-02-01",
    status: "New",
  },
  {
    _id: "STATIC008",
    id: "STATIC008",
    name: "Nikhil Soni",
    email: "nikhilsoni4121@email.com",
    product: "IMI Glasses Mark 1",
    variant: "Pearl White / Transparent",
    quantity: 1,
    paymentMethod: "Online",
    date: "2026-02-02",
    status: "Contacted",
  },
  {
    _id: "STATIC009",
    id: "STATIC009",
    name: "Ravi Chopra",
    email: "ravi.chopra@email.com",
    product: "IMI Smartwatch Series 1",
    variant: "Silver / Black Band",
    quantity: 1,
    paymentMethod: "COD",
    date: "2026-02-03",
    status: "New",
  },
];

const OrderEnquiryPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<OrderEnquiry[]>(staticEnquiries);
  const [loading, setLoading] = useState(false);
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
    status: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch enquiries from API on mount
  useEffect(() => {
    // Show static data immediately
    setEnquiries(staticEnquiries);
    // Then fetch and append dynamic data
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/enquiries`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      // Map MongoDB _id to id for compatibility
      const formattedData = data.map((enquiry: any) => ({
        ...enquiry,
        id: enquiry._id || enquiry.id,
        date: enquiry.date ? new Date(enquiry.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }));
      // Combine static data with dynamic data (static first, then dynamic)
      const combinedData = [...staticEnquiries, ...formattedData];
      setEnquiries(combinedData);
      if (formattedData.length > 0) {
        toast.success(`Loaded ${formattedData.length} new submissions`);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      // If API fails, show static data only
      setEnquiries(staticEnquiries);
      toast.error("Failed to load from server, showing sample data only");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (enquiry: OrderEnquiry) => {
    setEditTarget(enquiry);
    setEditForm({
      name: enquiry.name,
      email: enquiry.email,
      product: enquiry.product,
      variant: enquiry.variant || "",
      quantity: String(enquiry.quantity || 1),
      paymentMethod: enquiry.paymentMethod,
      date: enquiry.date,
      status: enquiry.status || "New",
      notes: enquiry.notes || "",
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
      const enquiryId = editTarget._id || editTarget.id;
      const response = await fetch(`${API_URL}/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          product: editForm.product,
          variant: editForm.variant,
          quantity: Number(editForm.quantity),
          paymentMethod: editForm.paymentMethod,
          date: editForm.date,
          status: editForm.status,
          notes: editForm.notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const updatedData = await response.json();
      const updatedEnquiry = {
        ...updatedData.enquiry,
        id: updatedData.enquiry._id,
        date: new Date(updatedData.enquiry.date).toISOString().split("T")[0],
      };

      setEnquiries((prev) =>
        prev.map((e) => (e.id === editTarget.id ? updatedEnquiry : e))
      );
      if (selected?.id === editTarget.id) setSelected(updatedEnquiry);
      toast.success("Enquiry updated successfully");
      setEditTarget(null);
    } catch (error) {
      console.error("Error updating enquiry:", error);
      toast.error("Failed to update enquiry");
    } finally {
      setSaving(false);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/enquiries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Enquiry deleted successfully");
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast.error("Failed to delete enquiry");
    } finally {
      setDeletingId(null);
    }
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Enquiries</h1>
        <button
          onClick={fetchEnquiries}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand hover:opacity-90 text-white text-sm font-medium transition-opacity disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : enquiries.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-500">
          No enquiries yet. Check back later or ensure the backend is running.
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
                <th className="px-5 py-3">Status</th>
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
                      {e.variant || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3">{e.quantity || 1}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        methodColors[e.paymentMethod] || "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {e.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {fmtDate(e.date)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-gray-500/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {e.status || "New"}
                    </span>
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
                        onClick={() => deleteEnquiry(e.id || e._id || "")}
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
                  <p className="font-mono text-xs">{selected._id || selected.id}</p>
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
                  <span className="text-gray-500">Status</span>
                  <p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-300">
                      {selected.status || "New"}
                    </span>
                  </p>
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
                    {selected.variant || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Quantity</span>
                  <p className="font-medium">{selected.quantity || 1}</p>
                </div>
              </div>

              {selected.heardAbout && (
                <div className="rounded-xl bg-surface/50 border border-surface-border/50 p-3">
                  <span className="text-gray-500 text-xs">How did you hear about us?</span>
                  <p className="font-medium">{selected.heardAbout}</p>
                </div>
              )}

              {selected.notes && (
                <div className="rounded-xl bg-surface/50 border border-surface-border/50 p-3">
                  <span className="text-gray-500 text-xs">Notes</span>
                  <p className="font-medium text-gray-300">{selected.notes}</p>
                </div>
              )}
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
                <p className="text-xs text-gray-500 font-mono">{editTarget._id || editTarget.id}</p>
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

              <div>
                <label className={LABEL}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className={INPUT}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className={INPUT}
                  rows={3}
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
