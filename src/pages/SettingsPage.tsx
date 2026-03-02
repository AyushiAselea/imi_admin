import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Plus, Trash2, Mail, ToggleLeft, ToggleRight } from "lucide-react";

interface EmailTemplate {
  isEnabled: boolean;
  subject: string;
  customMessage: string;
}

interface EmailTemplateSettings {
  cartEmail: EmailTemplate;
  orderEmail: EmailTemplate;
}

interface CustomScript {
  name: string;
  script: string;
  placement: string;
  isActive: boolean;
}

interface TrackingSettings {
  facebookPixelId: string;
  googleAnalyticsId: string;
  metaInsightsId: string;
  customScripts: CustomScript[];
}

interface SiteSettings {
  _id?: string;
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logo: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
  };
  tracking: TrackingSettings;
  emailTemplates: EmailTemplateSettings;
}

const defaultEmailTemplate: EmailTemplate = {
  isEnabled: true,
  subject: "",
  customMessage: "",
};

const defaultSettings: SiteSettings = {
  siteName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  logo: "",
  socialLinks: { instagram: "", twitter: "", facebook: "" },
  tracking: {
    facebookPixelId: "",
    googleAnalyticsId: "",
    metaInsightsId: "",
    customScripts: [],
  },
  emailTemplates: {
    cartEmail:  { ...defaultEmailTemplate },
    orderEmail: { ...defaultEmailTemplate },
  },
};

const SettingsPage: React.FC = () => {
  const [form, setForm] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => {
        const data = res.data || {};
        setForm({
          ...defaultSettings,
          ...data,
          socialLinks: { ...defaultSettings.socialLinks, ...(data.socialLinks || {}) },
          tracking: {
            ...defaultSettings.tracking,
            ...(data.tracking || {}),
            customScripts: data.tracking?.customScripts || [],
          },
          emailTemplates: {
            cartEmail:  { ...defaultEmailTemplate, ...(data.emailTemplates?.cartEmail  || {}) },
            orderEmail: { ...defaultEmailTemplate, ...(data.emailTemplates?.orderEmail || {}) },
          },
        });
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/admin/settings", form);
      setForm(data);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-40 items-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-6 max-w-2xl"
      >
        {/* General */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            General
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Site Name
              </label>
              <input
                value={form.siteName}
                onChange={(e) =>
                  setForm({ ...form, siteName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Logo URL
              </label>
              <input
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
              {form.logo && (
                <img
                  src={form.logo}
                  alt="Logo"
                  className="mt-2 h-12 object-contain"
                />
              )}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Contact Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Phone</label>
              <input
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Address</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand/50 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Social Links
          </h2>
          <div className="space-y-3">
            {(["instagram", "twitter", "facebook"] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm text-gray-300 mb-1 capitalize">
                  {key}
                </label>
                <input
                  value={form.socialLinks[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socialLinks: {
                        ...form.socialLinks,
                        [key]: e.target.value,
                      },
                    })
                  }
                  placeholder={`https://${key}.com/...`}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Tracking & Pixels */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Third-Party Tracking
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Facebook Pixel ID
              </label>
              <input
                value={form.tracking?.facebookPixelId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tracking: {
                      ...form.tracking,
                      facebookPixelId: e.target.value,
                    },
                  })
                }
                placeholder="e.g., 1234567890"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Google Analytics ID
              </label>
              <input
                value={form.tracking?.googleAnalyticsId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tracking: {
                      ...form.tracking,
                      googleAnalyticsId: e.target.value,
                    },
                  })
                }
                placeholder="e.g., G-XXXXXXXXXX"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Meta Insights ID
              </label>
              <input
                value={form.tracking?.metaInsightsId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tracking: {
                      ...form.tracking,
                      metaInsightsId: e.target.value,
                    },
                  })
                }
                placeholder="e.g., 0987654321"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
            </div>
          </div>
        </section>

        {/* Custom Scripts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Custom Scripts
            </h2>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  tracking: {
                    ...form.tracking,
                    customScripts: [
                      ...(form.tracking?.customScripts || []),
                      { name: "", script: "", placement: "head", isActive: true },
                    ],
                  },
                })
              }
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Script
            </button>
          </div>
          {(form.tracking?.customScripts || []).map((cs, idx) => (
            <div key={idx} className="glass rounded-xl p-4 mb-3 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  value={cs.name}
                  onChange={(e) => {
                    const scripts = [...(form.tracking?.customScripts || [])];
                    scripts[idx] = { ...scripts[idx], name: e.target.value };
                    setForm({
                      ...form,
                      tracking: { ...form.tracking, customScripts: scripts },
                    });
                  }}
                  placeholder="Script name"
                  className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50 flex-1 mr-3"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={cs.isActive}
                      onChange={(e) => {
                        const scripts = [...(form.tracking?.customScripts || [])];
                        scripts[idx] = { ...scripts[idx], isActive: e.target.checked };
                        setForm({
                          ...form,
                          tracking: { ...form.tracking, customScripts: scripts },
                        });
                      }}
                      className="rounded"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const scripts = (form.tracking?.customScripts || []).filter(
                        (_, i) => i !== idx
                      );
                      setForm({
                        ...form,
                        tracking: { ...form.tracking, customScripts: scripts },
                      });
                    }}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <select
                value={cs.placement}
                onChange={(e) => {
                  const scripts = [...(form.tracking?.customScripts || [])];
                  scripts[idx] = { ...scripts[idx], placement: e.target.value };
                  setForm({
                    ...form,
                    tracking: { ...form.tracking, customScripts: scripts },
                  });
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand/50"
              >
                <option value="head">Head</option>
                <option value="body_start">Body Start</option>
                <option value="body_end">Body End</option>
              </select>
              <textarea
                rows={3}
                value={cs.script}
                onChange={(e) => {
                  const scripts = [...(form.tracking?.customScripts || [])];
                  scripts[idx] = { ...scripts[idx], script: e.target.value };
                  setForm({
                    ...form,
                    tracking: { ...form.tracking, customScripts: scripts },
                  });
                }}
                placeholder="Paste script code here..."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-white placeholder-gray-600 text-xs font-mono focus:outline-none focus:border-brand/50 resize-none"
              />
            </div>
          ))}
        </section>

        {/* Email Templates */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Email Templates
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Customise the subject line and body message that goes out to customers.
            Use <code className="bg-surface px-1 rounded text-brand">&#123;&#123;variable&#125;&#125;</code> placeholders — they'll be replaced automatically.
          </p>

          {/* Cart Email */}
          <div className="glass rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-white">🛒 Cart Email</span>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    emailTemplates: {
                      ...form.emailTemplates,
                      cartEmail: { ...form.emailTemplates.cartEmail, isEnabled: !form.emailTemplates.cartEmail.isEnabled },
                    },
                  })
                }
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand transition-colors"
              >
                {form.emailTemplates.cartEmail.isEnabled
                  ? <><ToggleRight className="w-5 h-5 text-brand" /> Enabled</>
                  : <><ToggleLeft  className="w-5 h-5" /> Disabled</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {["{{FirstName}}","{{name}}","{{productName}}","{{variant}}","{{quantity}}","{{price}}","{{subtotal}}","{{CheckoutLink}}"].map((v) => (
                <span key={v} className="px-1.5 py-0.5 rounded bg-surface border border-surface-border text-brand text-[11px] font-mono cursor-default">{v}</span>
              ))}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Subject</label>
              <input
                value={form.emailTemplates.cartEmail.subject}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailTemplates: {
                      ...form.emailTemplates,
                      cartEmail: { ...form.emailTemplates.cartEmail, subject: e.target.value },
                    },
                  })
                }
                placeholder="e.g. 🛒 {{productName}} is waiting for you!"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Message Body</label>
              <textarea
                rows={3}
                value={form.emailTemplates.cartEmail.customMessage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailTemplates: {
                      ...form.emailTemplates,
                      cartEmail: { ...form.emailTemplates.cartEmail, customMessage: e.target.value },
                    },
                  })
                }
                placeholder="e.g. Great choice! You added {{productName}} to your cart."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand/50 resize-none"
              />
              <p className="text-[11px] text-gray-600 mt-1">Tip: wrap text in **double asterisks** to make it <strong>bold</strong> in the email.</p>
            </div>
          </div>

          {/* Order Confirmation Email */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-white">✅ Order Confirmation Email</span>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    emailTemplates: {
                      ...form.emailTemplates,
                      orderEmail: { ...form.emailTemplates.orderEmail, isEnabled: !form.emailTemplates.orderEmail.isEnabled },
                    },
                  })
                }
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand transition-colors"
              >
                {form.emailTemplates.orderEmail.isEnabled
                  ? <><ToggleRight className="w-5 h-5 text-brand" /> Enabled</>
                  : <><ToggleLeft  className="w-5 h-5" /> Disabled</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {["{{name}}","{{orderId}}","{{total}}","{{paymentMethod}}"].map((v) => (
                <span key={v} className="px-1.5 py-0.5 rounded bg-surface border border-surface-border text-brand text-[11px] font-mono cursor-default">{v}</span>
              ))}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Subject</label>
              <input
                value={form.emailTemplates.orderEmail.subject}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailTemplates: {
                      ...form.emailTemplates,
                      orderEmail: { ...form.emailTemplates.orderEmail, subject: e.target.value },
                    },
                  })
                }
                placeholder="e.g. ✅ Your order is confirmed | IMI"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Message Body</label>
              <textarea
                rows={3}
                value={form.emailTemplates.orderEmail.customMessage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailTemplates: {
                      ...form.emailTemplates,
                      orderEmail: { ...form.emailTemplates.orderEmail, customMessage: e.target.value },
                    },
                  })
                }
                placeholder="e.g. Your order has been placed. We'll ship it soon!"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand/50 resize-none"
              />
              <p className="text-[11px] text-gray-600 mt-1">Tip: wrap text in **double asterisks** to make it <strong>bold</strong> in the email.</p>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-black font-semibold hover:bg-brand-light transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
