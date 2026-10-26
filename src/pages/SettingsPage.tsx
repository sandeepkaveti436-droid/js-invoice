import React, { useState } from 'react';
import { 
  Building2, 
  Settings2, 
  Palette, 
  Globe, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  CreditCard,
  Mail,
  Key,
  Database,
  Cloud,
  Check,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings, TemplateCustomization } from '../types';
import { CURRENCIES } from '../utils/currency';
import { StorageService } from '../services/storage';
import { CountrySelect } from '../components/common/CountrySelect';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured 
} from '../services/supabaseClient';
import { SupabaseSync } from '../services/supabaseSync';

export const SettingsPage: React.FC = () => {
  const { 
    currentUser, 
    settings, 
    updateSettings, 
    clearMyData, 
    showToast,
    invoices,
    clients,
    payments,
    quotes
  } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'defaults' | 'appearance' | 'gateway' | 'data'>('business');
  const [formData, setFormData] = useState<AppSettings>(() => {
    const copy: AppSettings = JSON.parse(JSON.stringify(settings));
    if (copy.business?.name && (copy.business.name.endsWith("'s Business") || copy.business.name === `${currentUser?.name}'s Business`)) {
      copy.business.name = '';
    }
    return copy;
  });
  const [jsonBackupString, setJsonBackupString] = useState('');

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleTestAndSaveSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);

    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseAnonKey });

    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTestingSupabase(false);

    if (result.success) {
      setSupabaseStatusMsg({ type: 'success', text: result.message });
      showToast('Connected to Supabase!', 'success');
    } else {
      setSupabaseStatusMsg({ type: 'error', text: result.message });
      showToast('Supabase connection failed', 'error');
    }
  };

  const handlePushAllToCloud = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Please configure Supabase URL and Key first.', 'error');
      return;
    }

    setIsSyncingCloud(true);
    const res = await SupabaseSync.pushAllLocalToCloud(invoices, clients, payments, quotes);
    setIsSyncingCloud(false);

    if (res.success) {
      showToast(`Successfully synced ${res.count} records to Supabase cloud!`, 'success');
    } else {
      showToast(`Cloud sync error: ${res.error}`, 'error');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleExportJson = () => {
    const jsonStr = StorageService.exportDataToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `js_invoice_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Database exported as JSON backup file', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        const ok = StorageService.importDataFromJson(content);
        if (ok) {
          showToast('Data backup restored successfully! Reloading...', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Invalid backup JSON file structure', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Profile & Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure default billing parameters, branding, payment gateways, and export/import data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs overflow-x-auto pb-1">
        {[
          { id: 'business', label: 'Profile & Settings', icon: Building2 },
          { id: 'defaults', label: 'Invoice Defaults', icon: Settings2 },
          { id: 'appearance', label: 'Appearance & Templates', icon: Palette },
          { id: 'gateway', label: 'Payment Gateway', icon: CreditCard },
          { id: 'data', label: 'Data, Backup & Reset', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Business Profile */}
        {activeTab === 'business' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Profile & Business Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  value={formData.business.name}
                  placeholder="Enter company or trade name (optional)"
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, name: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={formData.business.email}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, email: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.business.phone}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, phone: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website</label>
                <input
                  type="text"
                  value={formData.business.website || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, website: e.target.value },
                    })
                  }
                  placeholder="https://company.design"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax ID / GSTIN / VAT</label>
                <input
                  type="text"
                  value={formData.business.taxId || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, taxId: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.business.addressLine1}
                onChange={e =>
                  setFormData({
                    ...formData,
                    business: { ...formData.business, addressLine1: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.business.city}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, city: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={formData.business.state}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, state: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.business.postalCode}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, postalCode: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <CountrySelect
                  value={formData.business.country || 'India'}
                  onChange={countryName =>
                    setFormData({
                      ...formData,
                      business: { ...formData.business, country: countryName },
                    })
                  }
                />
              </div>
            </div>

            <h4 className="font-bold text-slate-800 text-xs pt-4 border-t border-slate-100">
              Default Bank Transfer Instructions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Yes Bank, HDFC, SBI"
                  value={formData.business.bankDetails?.bankName || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: {
                        ...formData.business,
                        bankDetails: {
                          ...formData.business.bankDetails,
                          bankName: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Holder</label>
                <input
                  type="text"
                  placeholder="e.g. Skynovadigitals"
                  value={formData.business.bankDetails?.accountHolder || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: {
                        ...formData.business,
                        bankDetails: {
                          ...formData.business.bankDetails,
                          accountHolder: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account / IBAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 01234567890123"
                  value={formData.business.bankDetails?.accountNumber || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: {
                        ...formData.business,
                        bankDetails: {
                          ...formData.business.bankDetails,
                          accountNumber: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  IFSC Code <span className="text-amber-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. YESB0000123 / SBIN0001234"
                  value={formData.business.bankDetails?.ifscCode || formData.business.bankDetails?.routingNumber || ''}
                  onChange={e => {
                    const val = e.target.value.toUpperCase();
                    setFormData({
                      ...formData,
                      business: {
                        ...formData.business,
                        bankDetails: {
                          ...formData.business.bankDetails,
                          ifscCode: val,
                          routingNumber: val,
                        },
                      },
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Name / SWIFT</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad Main / YESBINBB"
                  value={formData.business.bankDetails?.branchName || formData.business.bankDetails?.swiftCode || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: {
                        ...formData.business,
                        bankDetails: {
                          ...formData.business.bankDetails,
                          branchName: e.target.value,
                          swiftCode: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI ID / VPA</label>
                <input
                  type="text"
                  placeholder="e.g. business@upi / 9392525043@okhdfcbank"
                  value={formData.business.bankDetails?.upiId || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      business: {
                        ...formData.business,
                        bankDetails: {
                          ...formData.business.bankDetails,
                          upiId: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Invoice Defaults */}
        {activeTab === 'defaults' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Invoice Sequencing & Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={formData.invoiceDefaults.prefix}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceDefaults: { ...formData.invoiceDefaults, prefix: e.target.value },
                    })
                  }
                  placeholder="INV-2026-"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  value={formData.invoiceDefaults.nextNumber}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceDefaults: {
                        ...formData.invoiceDefaults,
                        nextNumber: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Currency</label>
                <select
                  value={formData.invoiceDefaults.defaultCurrency}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceDefaults: {
                        ...formData.invoiceDefaults,
                        defaultCurrency: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                >
                  {Object.values(CURRENCIES).map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Payment Terms</label>
                <select
                  value={formData.invoiceDefaults.paymentTerms}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceDefaults: {
                        ...formData.invoiceDefaults,
                        paymentTerms: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Sales Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.invoiceDefaults.defaultTaxRate}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceDefaults: {
                        ...formData.invoiceDefaults,
                        defaultTaxRate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Notes to Customer</label>
              <textarea
                rows={2}
                value={formData.invoiceDefaults.defaultNotes}
                onChange={e =>
                  setFormData({
                    ...formData,
                    invoiceDefaults: {
                      ...formData.invoiceDefaults,
                      defaultNotes: e.target.value,
                    },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Legal Terms & Conditions</label>
              <textarea
                rows={2}
                value={formData.invoiceDefaults.defaultTerms}
                onChange={e =>
                  setFormData({
                    ...formData,
                    invoiceDefaults: {
                      ...formData.invoiceDefaults,
                      defaultTerms: e.target.value,
                    },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Appearance & Templates */}
        {activeTab === 'appearance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Appearance & Default Template
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Template Style</label>
                <select
                  value={formData.invoiceDefaults.defaultTemplate}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceDefaults: {
                        ...formData.invoiceDefaults,
                        defaultTemplate: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="modern">Modern Business (SaaS standard)</option>
                  <option value="minimal">Minimal Professional (Clean lines)</option>
                  <option value="freelancer">Elegant Freelancer (Serif aesthetic)</option>
                  <option value="agency">Creative Agency (Dark header banner)</option>
                  <option value="corporate">Corporate Classic (Dual-column formal)</option>
                  <option value="gst">GST Tax Invoice (India compliance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.appearance.accentColor}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        appearance: { ...formData.appearance, accentColor: e.target.value },
                        invoiceDefaults: { ...formData.invoiceDefaults, accentColor: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.appearance.accentColor}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        appearance: { ...formData.appearance, accentColor: e.target.value },
                        invoiceDefaults: { ...formData.invoiceDefaults, accentColor: e.target.value },
                      })
                    }
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payment Gateway Integration Setup */}
        {activeTab === 'gateway' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Online Payment Gateway Integration
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Enable Online Customer Checkout</h4>
                  <p className="text-slate-500 text-[11px]">
                    Allow clients to pay invoices directly using Stripe, Credit Cards, or UPI
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.paymentGatewayConfig.enabled}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      paymentGatewayConfig: {
                        ...formData.paymentGatewayConfig,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              {formData.paymentGatewayConfig.enabled && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Provider</label>
                      <select
                        value={formData.paymentGatewayConfig.provider}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            paymentGatewayConfig: {
                              ...formData.paymentGatewayConfig,
                              provider: e.target.value as any,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="stripe">Stripe</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Environment Mode</label>
                      <select
                        value={formData.paymentGatewayConfig.testMode ? 'test' : 'live'}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            paymentGatewayConfig: {
                              ...formData.paymentGatewayConfig,
                              testMode: e.target.value === 'test',
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="test">Test / Sandbox Mode</option>
                        <option value="live">Live Production</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Publishable API Key</label>
                    <input
                      type="text"
                      value={formData.paymentGatewayConfig.publishableKey}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          paymentGatewayConfig: {
                            ...formData.paymentGatewayConfig,
                            publishableKey: e.target.value,
                          },
                        })
                      }
                      placeholder="pk_test_sample..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Data, Backup & Reset */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-5 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Database Persistence, Cloud Sync & Backups
            </h3>

            {/* Supabase Cloud Database Configuration */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white space-y-4 border border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">Supabase Cloud Database (PostgreSQL)</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isSupabaseConfigured()
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {isSupabaseConfigured() ? 'Cloud Sync Active' : 'Disconnected (Local Storage Only)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sync invoices, clients, and payments across your phone, laptop, and desktop in real-time.
                    </p>
                  </div>
                </div>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Open Supabase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Supabase Project URL <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found in Supabase: Project Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Supabase Anon / Public Key <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={e => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found in Supabase: Project Settings → API → Project API Keys → anon public
                  </span>
                </div>
              </div>

              {supabaseStatusMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  supabaseStatusMsg.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
                }`}>
                  {supabaseStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{supabaseStatusMsg.text}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestAndSaveSupabase}
                    disabled={isTestingSupabase}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isTestingSupabase ? 'Verifying...' : 'Save & Test Connection'}</span>
                  </button>

                  {isSupabaseConfigured() && (
                    <button
                      type="button"
                      onClick={handlePushAllToCloud}
                      disabled={isSyncingCloud}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Cloud className="w-4 h-4 text-indigo-300" />
                      <span>{isSyncingCloud ? 'Syncing...' : 'Push All Local Invoices to Cloud'}</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  SQL schema available in project: <code className="text-emerald-300 font-mono">supabase-schema.sql</code>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Export Complete Database</span>
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Export all your invoices, quotes, client profiles, products, payments, and settings as a portable JSON backup.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON Backup</span>
                </button>
              </div>

              {/* Import Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-slate-700" />
                  <span>Restore from Backup</span>
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Upload a previously exported JSON backup to restore your system records.
                </p>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Clear Account Data */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-bold text-rose-700 text-xs">Clear My Account Records</h4>
                <p className="text-[11px] text-slate-400">
                  Delete all invoices, quotes, clients, and payments created in this account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all invoices, clients, and records in your account? This cannot be undone.')) {
                    clearMyData();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Account Data</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
