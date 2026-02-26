import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShoppingCart, RefreshCw, Package, User, Clock } from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
}

interface CartData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
}

const CartsPage = () => {
  const [carts, setCarts] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/cart/admin/all");
      setCarts(data.carts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch carts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const totalRevenuePotential = carts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalItems = carts.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Carts</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor user shopping carts in real-time</p>
        </div>
        <button
          onClick={fetchCarts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-xs text-gray-400">Active Carts</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Package size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalItems}</p>
              <p className="text-xs text-gray-400">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-lg">₹</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{totalRevenuePotential.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-400">Potential Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
        </div>
      ) : carts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart size={48} className="text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No active carts</p>
          <p className="text-gray-500 text-sm mt-1">When users add products to their cart, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((cart) => (
            <div
              key={cart._id}
              className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center">
                    <User size={16} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{cart.user?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-400">{cart.user?.email || "—"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">₹{cart.totalAmount.toLocaleString("en-IN")}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Clock size={12} />
                    {new Date(cart.updatedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="px-5 py-3 space-y-3">
                {cart.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                        <Package size={16} className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500 capitalize">{item.variant}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                    <p className="text-sm font-medium text-white w-20 text-right">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartsPage;
