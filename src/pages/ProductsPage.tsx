import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

/* ─── Types ─── */
interface Variant {
  _id?: string;
  variantName: string;
  color: string;
  colorHex: string;
  frameType: string;
  price: number;
  stock: number;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category?: string;
  status?: string;
  variants: Variant[];
}

const emptyVariant = (): Variant => ({
  variantName: "",
  color: "",
  colorHex: "#000000",
  frameType: "",
  price: 0,
  stock: 0,
  image: "",
});

const emptyProduct = (): Omit<Product, "_id"> => ({
  name: "",
  description: "",
  price: 0,
  image: "",
  stock: 0,
  category: "",
  status: "active",
  variants: [],
});

/* ─── Component ─── */
const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* product modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct());
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  /* variant modal */
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProductId, setVariantProductId] = useState<string | null>(null);
  const [variantProductName, setVariantProductName] = useState("");
  const [variantEditId, setVariantEditId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState<Variant>(emptyVariant());
  const [variantImagePreview, setVariantImagePreview] = useState("");
  const [variantSaving, setVariantSaving] = useState(false);

  /* expanded variant rows in table */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* view mode: 'products' or 'variants' */
  const [viewMode, setViewMode] = useState<"products" | "variants">("products");

  const fetchProducts = () => {
    setLoading(true);
    api
      .get("/admin/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ── Product open helpers ── */
  const openCreate = () => {
    setEditId(null);
    setForm(emptyProduct());
    setImagePreview("");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      stock: p.stock,
      category: p.category || "",
      status: p.status || "active",
      variants: p.variants ? p.variants.map((v) => ({ ...v })) : [],
    });
    setImagePreview(p.image);
    setModalOpen(true);
  };

  /* ── product image upload ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm((f) => ({ ...f, image: result }));
    };
    reader.readAsDataURL(file);
  };

  /* ── inline variant helpers (in product modal) ── */
  const addVariantInline = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));

  const removeVariantInline = (idx: number) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));

  const updateVariantField = <K extends keyof Variant>(
    idx: number,
    key: K,
    value: Variant[K]
  ) =>
    setForm((f) => {
      const updated = [...f.variants];
      updated[idx] = { ...updated[idx], [key]: value };
      return { ...f, variants: updated };
    });

  const handleVariantImageUpload = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      updateVariantField(idx, "image", result);
    };
    reader.readAsDataURL(file);
  };

  /* ── Product submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) {
      toast.error("Name and a valid price are required");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/admin/products/${editId}`, form);
        setProducts((prev) => prev.map((p) => (p._id === editId ? data : p)));
        toast.success("Product updated");
      } else {
        const { data } = await api.post("/admin/products", form);
        setProducts((prev) => [data, ...prev]);
        toast.success("Product created");
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete product ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── Toggle status ── */
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const { data } = await api.put(`/admin/products/${id}`, {
        status: newStatus,
      });
      setProducts((prev) => prev.map((p) => (p._id === id ? data : p)));
      toast.success(
        `Product ${newStatus === "active" ? "activated" : "deactivated"}`
      );
    } catch {
      toast.error("Status update failed");
    }
  };

  /* ══════════════════════════════════════
     VARIANT MODAL HELPERS
  ══════════════════════════════════════ */
  const openAddVariant = (productId: string, productName: string) => {
    setVariantProductId(productId);
    setVariantProductName(productName);
    setVariantEditId(null);
    setVariantForm(emptyVariant());
    setVariantImagePreview("");
    setVariantModalOpen(true);
  };

  const openEditVariant = (
    productId: string,
    productName: string,
    v: Variant
  ) => {
    setVariantProductId(productId);
    setVariantProductName(productName);
    setVariantEditId(v._id || null);
    setVariantForm({ ...v });
    setVariantImagePreview(v.image);
    setVariantModalOpen(true);
  };

  const handleVariantImageChangeModal = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setVariantImagePreview(result);
      setVariantForm((f) => ({ ...f, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.variantName || variantForm.price <= 0) {
      toast.error("Variant name and a valid price are required");
      return;
    }
    if (!variantProductId) return;

    setVariantSaving(true);
    try {
      if (variantEditId) {
        const { data } = await api.put(
          `/admin/products/${variantProductId}/variants/${variantEditId}`,
          variantForm
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === variantProductId ? data : p))
        );
        toast.success("Variant updated");
      } else {
        const { data } = await api.post(
          `/admin/products/${variantProductId}/variants`,
          variantForm
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === variantProductId ? data : p))
        );
        toast.success("Variant added");
      }
      setVariantModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Variant save failed");
    } finally {
      setVariantSaving(false);
    }
  };

  const handleDeleteVariant = async (
    productId: string,
    variantId: string,
    variantName: string
  ) => {
    if (!confirm(`Delete variant "${variantName}"? This cannot be undone.`))
      return;
    try {
      const { data } = await api.delete(
        `/admin/products/${productId}/variants/${variantId}`
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? data : p))
      );
      toast.success("Variant deleted");
    } catch {
      toast.error("Delete variant failed");
    }
  };

  /* ── All variants flat list ── */
  const allVariants = products.flatMap((p) =>
    (p.variants || []).map((v) => ({
      ...v,
      productId: p._id,
      productName: p.name,
      productImage: p.image,
    }))
  );

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-surface-border">
            <button
              onClick={() => setViewMode("products")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "products"
                  ? "bg-brand text-black"
                  : "bg-surface text-gray-400 hover:text-white"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setViewMode("variants")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "variants"
                  ? "bg-brand text-black"
                  : "bg-surface text-gray-400 hover:text-white"
              }`}
            >
              All Variants
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-black font-semibold text-sm hover:bg-brand-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "variants" ? (
        /* ══════════════════════════════════
           ALL VARIANTS GRID VIEW
        ══════════════════════════════════ */
        allVariants.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-gray-500">
            No variants found. Add variants to your products.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allVariants.map((v) => (
              <div
                key={v._id}
                className="glass rounded-2xl overflow-hidden border border-surface-border hover:border-brand/30 transition-colors"
              >
                {/* Variant image */}
                <div className="relative h-48 bg-surface-hover flex items-center justify-center">
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.variantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  )}
                  {/* Product badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-xs text-gray-300 backdrop-blur-sm">
                    {v.productName}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <h3 className="font-semibold text-sm truncate">
                      {v.variantName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {v.color && <span>Color: {v.color}</span>}
                    {v.color && v.frameType && <span>·</span>}
                    {v.frameType && <span>Frame: {v.frameType}</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-brand font-bold">
                      ₹{v.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Stock: {v.stock}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() =>
                        openEditVariant(v.productId, v.productName, v)
                      }
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-hover text-gray-300 hover:text-brand text-xs font-medium transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteVariant(
                          v.productId,
                          v._id!,
                          v.variantName
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-hover text-gray-300 hover:text-red-400 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : /* ══════════════════════════════════
           PRODUCTS TABLE VIEW
        ══════════════════════════════════ */
      products.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-500">
          No products found. Click "Add Product" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-gray-400 text-left">
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Base Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Variants</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <React.Fragment key={p._id}>
                  {/* ── Main row ── */}
                  <tr className="border-b border-surface-border/50 hover:bg-surface-hover/40 transition-colors">
                    <td className="px-5 py-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3">₹{p.price.toFixed(2)}</td>
                    <td className="px-5 py-3">{p.stock}</td>

                    {/* Variants badge + expand toggle */}
                    <td className="px-5 py-3">
                      {p.variants && p.variants.length > 0 ? (
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === p._id ? null : p._id
                            )
                          }
                          className="flex items-center gap-1 text-brand text-xs font-medium hover:underline"
                        >
                          {p.variants.length} variant
                          {p.variants.length > 1 ? "s" : ""}
                          {expandedId === p._id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">None</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-gray-400">
                      {p.category || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() =>
                          toggleStatus(p._id, p.status || "active")
                        }
                        className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          p.status === "active"
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        {p.status || "active"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => openAddVariant(p._id, p.name)}
                        className="p-1.5 rounded-lg hover:bg-brand/10 text-gray-400 hover:text-brand transition-colors"
                        title="Add variant"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-brand transition-colors"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* ── Expanded variant sub-rows ── */}
                  {expandedId === p._id &&
                    p.variants &&
                    p.variants.length > 0 && (
                      <tr className="bg-surface-hover/20">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                              Variants of {p.name}
                            </p>
                            <button
                              onClick={() => openAddVariant(p._id, p.name)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 font-medium transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Variant
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {p.variants.map((v) => (
                              <div
                                key={v._id}
                                className="rounded-xl border border-surface-border bg-surface p-3 flex gap-3"
                              >
                                {/* Variant image */}
                                <div className="w-20 h-20 rounded-lg bg-surface-hover flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {v.image ? (
                                    <img
                                      src={v.image}
                                      alt={v.variantName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-600" />
                                  )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0"
                                      style={{
                                        backgroundColor: v.colorHex,
                                      }}
                                    />
                                    <span className="font-medium text-sm truncate">
                                      {v.variantName}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 space-y-0.5">
                                    {v.color && <div>Color: {v.color}</div>}
                                    {v.frameType && (
                                      <div>Frame: {v.frameType}</div>
                                    )}
                                    <div className="flex items-center gap-3">
                                      <span className="text-brand font-semibold">
                                        ₹{v.price.toFixed(2)}
                                      </span>
                                      <span>Stock: {v.stock}</span>
                                    </div>
                                  </div>
                                  {/* Actions */}
                                  <div className="flex gap-1 mt-1.5">
                                    <button
                                      onClick={() =>
                                        openEditVariant(p._id, p.name, v)
                                      }
                                      className="p-1 rounded hover:bg-surface-hover text-gray-500 hover:text-brand transition-colors"
                                      title="Edit variant"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteVariant(
                                          p._id,
                                          v._id!,
                                          v.variantName
                                        )
                                      }
                                      className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                      title="Delete variant"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════
          Modal – Add / Edit Product
      ══════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editId ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50 resize-none"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Base Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Main Product Image */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Main Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-surface-hover file:text-gray-300 file:font-medium file:cursor-pointer hover:file:bg-brand/10"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-full max-h-40 object-contain rounded-xl border border-surface-border"
                  />
                )}
                <input
                  placeholder="Or paste image URL"
                  value={form.image.startsWith("data:") ? "" : form.image}
                  onChange={(e) => {
                    setForm({ ...form, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 text-xs"
                />
              </div>

              {/* ── Inline Variants Section ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-300 font-semibold">
                    Variants (frame / color options)
                  </label>
                  <button
                    type="button"
                    onClick={addVariantInline}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Variant
                  </button>
                </div>

                {form.variants.length === 0 && (
                  <p className="text-xs text-gray-500 italic py-2">
                    No variants added. Click "Add Variant" to create colour /
                    frame options.
                  </p>
                )}

                <div className="space-y-3">
                  {form.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-surface-border bg-surface p-4 space-y-3"
                    >
                      {/* Row header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Variant {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariantInline(idx)}
                          className="p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                          title="Remove variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Name + Color */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Variant Name *
                          </label>
                          <input
                            placeholder="e.g. Matte Black"
                            value={v.variantName}
                            onChange={(e) =>
                              updateVariantField(
                                idx,
                                "variantName",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Color
                          </label>
                          <input
                            placeholder="e.g. Black"
                            value={v.color}
                            onChange={(e) =>
                              updateVariantField(idx, "color", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
                          />
                        </div>
                      </div>

                      {/* Frame Type + Color Hex */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Frame Type
                          </label>
                          <input
                            placeholder="e.g. Transparent, Matte"
                            value={v.frameType}
                            onChange={(e) =>
                              updateVariantField(
                                idx,
                                "frameType",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Colour Hex
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={v.colorHex}
                              onChange={(e) =>
                                updateVariantField(
                                  idx,
                                  "colorHex",
                                  e.target.value
                                )
                              }
                              className="w-10 h-9 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                            />
                            <input
                              value={v.colorHex}
                              onChange={(e) =>
                                updateVariantField(
                                  idx,
                                  "colorHex",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Price + Stock */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Price (₹) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.price}
                            onChange={(e) =>
                              updateVariantField(
                                idx,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariantField(
                                idx,
                                "stock",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
                          />
                        </div>
                      </div>

                      {/* Variant Image Upload */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Variant Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleVariantImageUpload(idx, e)}
                          className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-surface-hover file:text-gray-300 file:font-medium file:cursor-pointer hover:file:bg-brand/10"
                        />
                        <input
                          placeholder="Or paste image URL"
                          value={
                            v.image.startsWith("data:") ? "" : v.image
                          }
                          onChange={(e) =>
                            updateVariantField(idx, "image", e.target.value)
                          }
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-surface-hover border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 text-xs"
                        />
                        {v.image && (
                          <img
                            src={v.image}
                            alt={v.variantName}
                            className="mt-2 h-20 rounded-xl object-contain border border-surface-border"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand text-black font-semibold hover:bg-brand-light transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving
                  ? "Saving…"
                  : editId
                  ? "Update Product"
                  : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          Modal – Add / Edit Variant
      ══════════════════════════════════ */}
      {variantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold">
                  {variantEditId ? "Edit Variant" : "Add Variant"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Product: {variantProductName}
                </p>
              </div>
              <button
                onClick={() => setVariantModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVariantSubmit} className="space-y-4">
              {/* Variant Name */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Variant Name *
                </label>
                <input
                  placeholder="e.g. Matte Black, Transparent Frame"
                  value={variantForm.variantName}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      variantName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                />
              </div>

              {/* Color + Frame Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    placeholder="e.g. Black, White"
                    value={variantForm.color}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        color: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Frame Type
                  </label>
                  <input
                    placeholder="e.g. Matte, Transparent"
                    value={variantForm.frameType}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        frameType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
              </div>

              {/* Color Hex */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Colour Hex
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={variantForm.colorHex}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        colorHex: e.target.value,
                      })
                    }
                    className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    value={variantForm.colorHex}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        colorHex: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantForm.price}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variantForm.stock}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
                  />
                </div>
              </div>

              {/* Variant Image */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Variant Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleVariantImageChangeModal}
                  className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-surface-hover file:text-gray-300 file:font-medium file:cursor-pointer hover:file:bg-brand/10"
                />
                {variantImagePreview && (
                  <img
                    src={variantImagePreview}
                    alt="Variant Preview"
                    className="mt-3 w-full max-h-40 object-contain rounded-xl border border-surface-border"
                  />
                )}
                <input
                  placeholder="Or paste image URL"
                  value={
                    variantForm.image.startsWith("data:")
                      ? ""
                      : variantForm.image
                  }
                  onChange={(e) => {
                    setVariantForm({
                      ...variantForm,
                      image: e.target.value,
                    });
                    setVariantImagePreview(e.target.value);
                  }}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 text-xs"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={variantSaving}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand text-black font-semibold hover:bg-brand-light transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {variantSaving
                  ? "Saving…"
                  : variantEditId
                  ? "Update Variant"
                  : "Add Variant"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
