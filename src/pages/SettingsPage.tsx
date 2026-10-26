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
  Key
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings, TemplateCustomization } from '../types';
import { CURRENCIES } from '../utils/currency';
import { StorageService } from '../services/storage';

export const SettingsPage: React.FC = () => {
  const { currentUser, settings, updateSettings, clearMyData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'defaults' | 'appearance' | 'gateway' | 'data'>('business');
  const [formData, setFormData] = useState<AppSettings>(() => {
    const copy: AppSettings = JSON.parse(JSON.stringify(settings));
    if (copy.business?.name && (copy.business.name.endsWith("'s Business") || copy.business.name === `${currentUser?.name}'s Business`)) {
      copy.business.name = '';
    }
    return copy;
  });
  const [jsonBackupString, setJsonBackupString] = useState('');

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

            <div className="grid grid-cols-3 gap-3">
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
            </div>

            <h4 className="font-bold text-slate-800 text-xs pt-4 border-t border-slate-100">
              Default Bank Transfer Instructions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
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
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Database Persistence & Backups
            </h3>

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
