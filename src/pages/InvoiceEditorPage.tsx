import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Invoice, 
  InvoiceItem, 
  Client, 
  Product, 
  TemplateCustomization, 
  FieldVisibilityToggles, 
  PricingMode, 
  DiscountType, 
  GstType 
} from '../types';
import { useApp } from '../context/AppContext';
import { calculateInvoice } from '../utils/calculator';
import { CURRENCIES, formatMoney } from '../utils/currency';
import { StorageService } from '../services/storage';
import { generateInvoiceNumber, getDateAfterDays, getTodayDateString } from '../utils/formatters';
import { exportInvoiceToPdf, printInvoice } from '../utils/pdfExport';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { ClientSelectModal } from '../components/invoice/ClientSelectModal';
import { SendInvoiceModal } from '../components/invoice/SendInvoiceModal';
import { RecordPaymentModal } from '../components/invoice/RecordPaymentModal';
import { CountrySelect } from '../components/common/CountrySelect';
import { 
  Save, 
  Download, 
  Printer, 
  Send, 
  CreditCard, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Users, 
  Settings2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Palette,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Building,
  Upload,
  Check
} from 'lucide-react';

interface Props {
  isEditing?: boolean;
}

export const InvoiceEditorPage: React.FC<Props> = ({ isEditing = false }) => {
  const { 
    activeInvoiceId, 
    activeClientId,
    invoices, 
    clients, 
    settings, 
    saveInvoice, 
    setCurrentView,
    openViewInvoice,
    showToast 
  } = useApp();

  // Dialogs
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showVisibilityPanel, setShowVisibilityPanel] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
  const [zoomScale, setZoomScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return Number(Math.max(0.38, Math.min(1, (window.innerWidth - 44) / 794)).toFixed(2));
    }
    return 0.85;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initial Invoice Data Constructor
  const initialInvoice = useMemo<Invoice>(() => {
    if (isEditing && activeInvoiceId) {
      const found = invoices.find(i => i.id === activeInvoiceId) || StorageService.getInvoiceById(activeInvoiceId);
      if (found) return JSON.parse(JSON.stringify(found));
    }

    const defaultClient: Client = (activeClientId ? clients.find(c => c.id === activeClientId) : null) || {
      id: 'cli_' + Date.now(),
      name: '',
      companyName: '',
      email: '',
      phone: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      createdAt: new Date().toISOString(),
    };

    const newNumber = generateInvoiceNumber(
      settings.invoiceDefaults.prefix || 'N°: ', 
      settings.invoiceDefaults.nextNumber || 140
    );

    const defaultItems: InvoiceItem[] = [
      {
        id: 'it_' + Date.now(),
        name: '',
        description: '',
        quantity: 1,
        unit: 'hrs',
        unitPrice: 0,
        discount: 0,
        discountType: 'percentage',
        taxRate: 0,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ];

    const calc = calculateInvoice({
      items: defaultItems,
      pricingMode: settings.invoiceDefaults.pricingMode || 'exclusive',
      invoiceDiscount: 0,
      invoiceDiscountType: 'fixed',
      shippingFee: 0,
      withholdingTaxRate: 0,
      gstEnabled: settings.invoiceDefaults.gstEnabled || false,
      gstType: 'CGST_SGST',
      amountPaid: 0,
    });

    return {
      id: 'inv_' + Date.now(),
      number: newNumber,
      prefix: settings.invoiceDefaults.prefix,
      title: settings.invoiceDefaults.title || 'Tax Invoice',
      issueDate: getTodayDateString(),
      dueDate: getDateAfterDays(settings.invoiceDefaults.dueInDays || 30),
      currency: settings.invoiceDefaults.defaultCurrency || 'INR',
      poNumber: '',
      referenceNumber: '',
      paymentTerms: settings.invoiceDefaults.paymentTerms || 'Net 30',
      business: JSON.parse(JSON.stringify(settings.business)),
      client: defaultClient,
      ...calc,
      pricingMode: settings.invoiceDefaults.pricingMode || 'exclusive',
      gstEnabled: settings.invoiceDefaults.gstEnabled || false,
      gstType: 'CGST_SGST',
      invoiceDiscount: 0,
      invoiceDiscountType: 'fixed',
      shippingFee: 0,
      withholdingTaxRate: 0,
      notes: settings.invoiceDefaults.defaultNotes || '',
      terms: settings.invoiceDefaults.defaultTerms || '',
      paymentInstructions: '',
      bankDetails: JSON.parse(JSON.stringify(settings.business.bankDetails || {})),
      signatureType: 'text',
      authorizedSignatoryName: settings.business.signatureText || settings.business.name || '',
      footerText: settings.invoiceDefaults.defaultNotes || '',
      status: 'draft',
      templateConfig: {
        templateId: settings.invoiceDefaults.defaultTemplate || 'modern',
        accentColor: settings.invoiceDefaults.accentColor || '#EAA000',
        fontFamily: settings.appearance.fontFamily || 'Inter',
        logoPlacement: 'left',
        tableStyle: 'striped',
        headerLayout: 'split',
        showQrCode: true,
      },
      visibility: {
        showLogo: true,
        showBusinessAddress: true,
        showTaxId: true,
        showPoNumber: true,
        showItemDiscount: true,
        showItemTax: true,
        showItemHsn: false,
        showItemDescription: true,
        showBankDetails: true,
        showNotes: true,
        showTerms: true,
        showSignature: true,
        showShipping: false,
        showWithholding: false,
        showPaymentInstructions: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [isEditing, activeInvoiceId, invoices, clients, settings]);

  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

  // Synchronize initial invoice if editing changed
  useEffect(() => {
    setInvoice(initialInvoice);
  }, [initialInvoice]);

  // Master Recalculator: whenever items, discounts, taxes, or pricing modes change
  const triggerRecalculation = (partialUpdate: Partial<Invoice>) => {
    setInvoice(prev => {
      const merged: Invoice = { ...prev, ...partialUpdate };
      const calcResult = calculateInvoice({
        items: merged.items,
        pricingMode: merged.pricingMode,
        invoiceDiscount: merged.invoiceDiscount,
        invoiceDiscountType: merged.invoiceDiscountType,
        shippingFee: merged.shippingFee,
        withholdingTaxRate: merged.withholdingTaxRate,
        gstEnabled: merged.gstEnabled,
        gstType: merged.gstType,
        amountPaid: merged.amountPaid,
      });

      return {
        ...merged,
        ...calcResult,
      };
    });
  };

  // Line Items Operations
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    triggerRecalculation({ items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: 'it_' + Date.now(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'hrs',
      unitPrice: 100,
      discount: 0,
      discountType: 'percentage',
      taxRate: settings.invoiceDefaults.defaultTaxRate || 10,
      lineSubtotal: 100,
      lineDiscount: 0,
      taxableAmount: 100,
      lineTax: 10,
      lineTotal: 110,
    };
    triggerRecalculation({ items: [...invoice.items, newItem] });
  };

  const handleDeleteItem = (index: number) => {
    if (invoice.items.length <= 1) {
      showToast('Invoice must have at least one line item', 'error');
      return;
    }
    const updated = invoice.items.filter((_, i) => i !== index);
    triggerRecalculation({ items: updated });
  };

  const handleDuplicateItem = (index: number) => {
    const target = invoice.items[index];
    const duplicated: InvoiceItem = {
      ...target,
      id: 'it_' + Date.now(),
      name: `${target.name} (Copy)`,
    };
    const updated = [...invoice.items];
    updated.splice(index + 1, 0, duplicated);
    triggerRecalculation({ items: updated });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= invoice.items.length) return;
    const updated = [...invoice.items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    triggerRecalculation({ items: updated });
  };

  // Save Invoice
  const handleSaveInvoice = (newStatus?: Invoice['status']) => {
    // Validate uniqueness of number
    const duplicate = invoices.find(i => i.id !== invoice.id && i.number.toLowerCase() === invoice.number.toLowerCase());
    if (duplicate) {
      showToast(`Invoice number "${invoice.number}" is already used. Please choose a unique number.`, 'error');
      return;
    }

    if (!invoice.client || !invoice.client.name) {
      showToast('Please select or specify a client before saving.', 'error');
      return;
    }

    setIsSaving(true);
    const updated: Invoice = {
      ...invoice,
      status: newStatus || invoice.status,
    };
    saveInvoice(updated);
    setIsSaving(false);
  };

  // PDF Download
  const handleDownloadPdf = async () => {
    showToast('Rendering high-resolution PDF document...', 'info');
    const success = await exportInvoiceToPdf('invoice-document', `${invoice.number}.pdf`);
    if (success) {
      showToast(`PDF for ${invoice.number} downloaded!`, 'success');
    } else {
      showToast('Could not generate PDF. Please try again.', 'error');
    }
  };

  // Logo file upload handler (base64 reader)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        setInvoice(prev => ({
          ...prev,
          business: {
            ...prev.business,
            logoUrl: result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Top Action Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditing ? `Edit Invoice: ${invoice.number}` : 'New Invoice Generator'}
            </h2>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {invoice.currency} • {formatMoney(invoice.grandTotal, invoice.currency)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-calculating line totals, tax breakdown, and live A4 document preview.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-xl text-xs font-medium w-full sm:w-auto justify-center mb-2 sm:mb-0">
            <button
              onClick={() => setActiveMobileTab('editor')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-colors ${
                activeMobileTab === 'editor' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              Form Editor
            </button>
            <button
              onClick={() => setActiveMobileTab('preview')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeMobileTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            onClick={() => handleSaveInvoice('draft')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => printInvoice()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          {invoice.balanceDue > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor (7 cols on desktop) */}
        <div className={`lg:col-span-6 space-y-6 ${activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Step 1: Invoice Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Invoice Details</h3>
              </div>
              <span className="text-[11px] text-slate-400">Sequential & Unique ID</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Invoice Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoice.number}
                  onChange={e => setInvoice({ ...invoice, number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Title</label>
                <input
                  type="text"
                  value={invoice.title}
                  onChange={e => setInvoice({ ...invoice, title: e.target.value })}
                  placeholder="e.g. Tax Invoice / Commercial Invoice"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={e => setInvoice({ ...invoice, issueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={invoice.currency}
                  onChange={e => setInvoice({ ...invoice, currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900"
                >
                  {Object.values(CURRENCIES).map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) — {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={invoice.paymentTerms}
                  onChange={e => {
                    const terms = e.target.value;
                    let days = 30;
                    if (terms === 'Due on Receipt') days = 0;
                    else if (terms === 'Net 7') days = 7;
                    else if (terms === 'Net 15') days = 15;
                    else if (terms === 'Net 30') days = 30;
                    else if (terms === 'Net 60') days = 60;
                    setInvoice({
                      ...invoice,
                      paymentTerms: terms,
                      dueDate: getDateAfterDays(days),
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PO Number (Optional)</label>
                <input
                  type="text"
                  value={invoice.poNumber || ''}
                  onChange={e => setInvoice({ ...invoice, poNumber: e.target.value })}
                  placeholder="PO-2026-902"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference (Optional)</label>
                <input
                  type="text"
                  value={invoice.referenceNumber || ''}
                  onChange={e => setInvoice({ ...invoice, referenceNumber: e.target.value })}
                  placeholder="REF-PROJECT-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Payment & Settlement Status Option */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block font-semibold text-slate-800 text-xs mb-2">
                Invoice Payment Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Unpaid */}
                <button
                  type="button"
                  onClick={() => {
                    setInvoice(prev => ({
                      ...prev,
                      status: 'sent',
                      amountPaid: 0,
                      balanceDue: prev.grandTotal,
                    }));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    invoice.status === 'sent' || invoice.status === 'draft'
                      ? 'border-amber-400 bg-amber-50/80 text-amber-900 shadow-sm ring-1 ring-amber-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">🟡 Unpaid</span>
                    {(invoice.status === 'sent' || invoice.status === 'draft') && (
                      <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">Pending payment</span>
                </button>

                {/* 2. Half Payment Done */}
                <button
                  type="button"
                  onClick={() => {
                    const half = Math.round((invoice.grandTotal / 2) * 100) / 100;
                    setInvoice(prev => ({
                      ...prev,
                      status: 'partially_paid',
                      amountPaid: half,
                      balanceDue: Math.round((prev.grandTotal - half) * 100) / 100,
                    }));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    invoice.status === 'partially_paid'
                      ? 'border-blue-400 bg-blue-50/80 text-blue-900 shadow-sm ring-1 ring-blue-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">🔵 Half Paid</span>
                    {invoice.status === 'partially_paid' && (
                      <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">50% deposit received</span>
                </button>

                {/* 3. Paid */}
                <button
                  type="button"
                  onClick={() => {
                    setInvoice(prev => ({
                      ...prev,
                      status: 'paid',
                      amountPaid: prev.grandTotal,
                      balanceDue: 0,
                      paidAt: new Date().toISOString(),
                    }));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    invoice.status === 'paid'
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-900 shadow-sm ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">🟢 Paid</span>
                    {invoice.status === 'paid' && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">Fully settled</span>
                </button>

                {/* 4. Overdue */}
                <button
                  type="button"
                  onClick={() => {
                    setInvoice(prev => ({
                      ...prev,
                      status: 'overdue',
                      amountPaid: 0,
                      balanceDue: prev.grandTotal,
                    }));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    invoice.status === 'overdue'
                      ? 'border-rose-400 bg-rose-50/80 text-rose-900 shadow-sm ring-1 ring-rose-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">🔴 Overdue</span>
                    {invoice.status === 'overdue' && (
                      <Check className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">Payment past due</span>
                </button>
              </div>

              {/* If Half Paid / Partial: show custom amount controls */}
              {invoice.status === 'partially_paid' && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900">Amount Paid:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <span>{invoice.currency}</span>
                      <input
                        type="number"
                        min="0"
                        max={invoice.grandTotal}
                        value={invoice.amountPaid}
                        onChange={e => {
                          const val = Number(e.target.value) || 0;
                          setInvoice(prev => ({
                            ...prev,
                            amountPaid: val,
                            balanceDue: Math.max(0, Math.round((prev.grandTotal - val) * 100) / 100),
                          }));
                        }}
                        className="w-28 px-2 py-1 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const half = Math.round((invoice.grandTotal / 2) * 100) / 100;
                        setInvoice(prev => ({
                          ...prev,
                          amountPaid: half,
                          balanceDue: Math.round((prev.grandTotal - half) * 100) / 100,
                        }));
                      }}
                      className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 transition-colors"
                    >
                      Reset 50%
                    </button>
                    <span className="font-mono text-slate-600 text-xs">
                      Remaining Due: <strong className="text-amber-800">{formatMoney(invoice.balanceDue, invoice.currency)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Business Profile Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Seller & Business Details</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  settings.business = invoice.business;
                  showToast('Business details set as default in Settings!', 'success');
                }}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Save as Default Profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Freelancer Name</label>
                <input
                  type="text"
                  value={invoice.business?.name || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, name: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Email</label>
                <input
                  type="email"
                  value={invoice.business?.email || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, email: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={invoice.notes || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      notes: e.target.value,
                    })
                  }
                  placeholder="e.g. We build software systems that grow with your business."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={invoice.business?.website || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, website: e.target.value },
                    })
                  }
                  placeholder="e.g. yourcompany.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={invoice.business?.phone || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, phone: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax ID / GSTIN / VAT</label>
                <input
                  type="text"
                  value={invoice.business?.taxId || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, taxId: e.target.value },
                    })
                  }
                  placeholder="US-EIN or GSTIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logo Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {invoice.business?.logoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setInvoice({
                          ...invoice,
                          business: { ...invoice.business, logoUrl: '' },
                        })
                      }
                      className="text-rose-500 hover:text-rose-700 text-[11px]"
                      title="Remove logo"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={invoice.business?.addressLine1 || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, addressLine1: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City, State</label>
                <input
                  type="text"
                  value={`${invoice.business?.city || ''}${invoice.business?.state ? `, ${invoice.business.state}` : ''}`}
                  onChange={e => {
                    const [c, s] = e.target.value.split(',');
                    setInvoice({
                      ...invoice,
                      business: {
                        ...invoice.business,
                        city: c?.trim() || '',
                        state: s?.trim() || '',
                      },
                    });
                  }}
                  placeholder="San Francisco, CA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={invoice.business?.postalCode || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, postalCode: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <CountrySelect
                  value={invoice.business?.country || 'India'}
                  onChange={countryName =>
                    setInvoice({
                      ...invoice,
                      business: { ...invoice.business, country: countryName },
                    })
                  }
                />
              </div>
            </div>
            </div>
          </div>

          {/* Step 3: Customer / Client Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Customer / Client Information</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Select / Change Client</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Client Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoice.client?.name || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, name: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={invoice.client?.companyName || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, companyName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={invoice.client?.email || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, email: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Tax ID / GSTIN</label>
                <input
                  type="text"
                  value={invoice.client?.taxId || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, taxId: e.target.value },
                    })
                  }
                  placeholder="Optional VAT / GSTIN #"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Phone / Contact</label>
                <input
                  type="text"
                  value={invoice.client?.phone || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, phone: e.target.value },
                    })
                  }
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client City / Location</label>
                <input
                  type="text"
                  value={invoice.client?.city || ''}
                  onChange={e =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, city: e.target.value },
                    })
                  }
                  placeholder="e.g. Hyderabad, Telangana"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Country</label>
                <CountrySelect
                  value={invoice.client?.country || 'India'}
                  onChange={countryName =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, country: countryName },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Street Address</label>
              <input
                type="text"
                value={invoice.client?.addressLine1 || ''}
                onChange={e =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, addressLine1: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Step 4: Line Items Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Line Items & Services</h3>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:border-slate-300 transition-all space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(idx, 'down')}
                        disabled={idx === invoice.items.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(idx)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Duplicate Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block font-semibold text-slate-700 mb-1">Item Title</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={e => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Website Development"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">HSN/SAC (GST)</label>
                      <input
                        type="text"
                        value={item.hsnSacCode || ''}
                        onChange={e => handleItemChange(idx, 'hsnSacCode', e.target.value)}
                        placeholder="998314"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Detailed breakdown of work or deliverables..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                        placeholder="hrs, pcs, mo"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Discount %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tax %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.taxRate}
                        onChange={e => handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400">Line Amount:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatMoney(item.lineTotal, invoice.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50/50 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>
          </div>

          {/* Step 5: Taxes, Discounts & Pricing Mode Engine */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Discounts, Taxes & Charges</h3>
              </div>
            </div>

            {/* Pricing Mode Toggle: Inclusive vs Exclusive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <label className="block font-semibold text-slate-800 mb-1">Tax Calculation Mode</label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => triggerRecalculation({ pricingMode: 'exclusive' })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                      invoice.pricingMode === 'exclusive'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Tax Exclusive (+ Tax)
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerRecalculation({ pricingMode: 'inclusive' })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                      invoice.pricingMode === 'inclusive'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Tax Inclusive (Extract)
                  </button>
                </div>
              </div>

              {/* GST Mode Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-800">GST India Regime</label>
                  <input
                    type="checkbox"
                    checked={invoice.gstEnabled}
                    onChange={e => triggerRecalculation({ gstEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>
                {invoice.gstEnabled && (
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => triggerRecalculation({ gstType: 'CGST_SGST' })}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                        invoice.gstType === 'CGST_SGST'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      CGST + SGST (Intra-state)
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerRecalculation({ gstType: 'IGST' })}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                        invoice.gstType === 'IGST'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      IGST (Inter-state)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice-Level Discount & Shipping & Withholding */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Discount</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={invoice.invoiceDiscount}
                    onChange={e => triggerRecalculation({ invoiceDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono"
                  />
                  <select
                    value={invoice.invoiceDiscountType}
                    onChange={e => triggerRecalculation({ invoiceDiscountType: e.target.value as any })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-1.5 text-xs font-mono"
                  >
                    <option value="fixed">{invoice.currency}</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shipping / Freight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={invoice.shippingFee}
                  onChange={e => triggerRecalculation({ shippingFee: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Withholding / TDS (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={invoice.withholdingTaxRate}
                  onChange={e => triggerRecalculation({ withholdingTaxRate: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 2% or 10%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                />
              </div>
            </div>

            {/* Calculations Breakdown Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Subtotal:</span>
                <span className="font-mono">{formatMoney(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Total Discounts:</span>
                  <span className="font-mono">−{formatMoney(invoice.totalDiscount, invoice.currency)}</span>
                </div>
              )}
              {invoice.taxes?.map((tax, i) => (
                <div key={i} className="flex justify-between text-slate-600">
                  <span>{tax.name}:</span>
                  <span className="font-mono">+{formatMoney(tax.amount, invoice.currency)}</span>
                </div>
              ))}
              {invoice.shippingFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee:</span>
                  <span className="font-mono">+{formatMoney(invoice.shippingFee, invoice.currency)}</span>
                </div>
              )}
              {invoice.withholdingAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Withholding / Retention ({invoice.withholdingTaxRate}%):</span>
                  <span className="font-mono">−{formatMoney(invoice.withholdingAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono">{formatMoney(invoice.grandTotal, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Step 6: Notes, Terms, Bank & Signatory */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  6
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Notes, Bank Details & Signature</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes to Client</label>
                <textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Thank you for your business!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={invoice.terms}
                  onChange={e => setInvoice({ ...invoice, terms: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Bank Remittance Details */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Bank Remittance & Payment Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Yes Bank"
                    value={invoice.bankDetails?.bankName || ''}
                    onChange={e =>
                      setInvoice({
                        ...invoice,
                        bankDetails: { ...invoice.bankDetails, bankName: e.target.value },
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
                    value={invoice.bankDetails?.accountHolder || invoice.business?.name || ''}
                    onChange={e =>
                      setInvoice({
                        ...invoice,
                        bankDetails: { ...invoice.bankDetails, accountHolder: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number / IBAN</label>
                  <input
                    type="text"
                    placeholder="e.g. 01234567890123"
                    value={invoice.bankDetails?.accountNumber || ''}
                    onChange={e =>
                      setInvoice({
                        ...invoice,
                        bankDetails: { ...invoice.bankDetails, accountNumber: e.target.value },
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
                    value={invoice.bankDetails?.ifscCode || invoice.bankDetails?.routingNumber || ''}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      setInvoice({
                        ...invoice,
                        bankDetails: {
                          ...invoice.bankDetails,
                          ifscCode: val,
                          routingNumber: val,
                        },
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    placeholder="e.g. skynova@upi"
                    value={invoice.bankDetails?.upiId || ''}
                    onChange={e =>
                      setInvoice({
                        ...invoice,
                        bankDetails: { ...invoice.bankDetails, upiId: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory</label>
                  <input
                    type="text"
                    value={invoice.authorizedSignatoryName || ''}
                    onChange={e => setInvoice({ ...invoice, authorizedSignatoryName: e.target.value })}
                    placeholder="Authorized Person"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Invoice Preview (6 cols on desktop) */}
        <div className={`lg:col-span-6 space-y-4 ${activeMobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          {/* Template Switcher & Customizer Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs text-slate-900">Invoice Template:</span>
              </div>

              {/* Template selector pills */}
              <div className="flex flex-wrap gap-1 text-xs">
                {[
                  { id: 'modern', label: 'Modern' },
                  { id: 'minimal', label: 'Minimal' },
                  { id: 'freelancer', label: 'Freelancer' },
                  { id: 'agency', label: 'Agency' },
                  { id: 'corporate', label: 'Corporate' },
                  { id: 'gst', label: 'GST Tax' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setInvoice({
                        ...invoice,
                        templateConfig: {
                          ...invoice.templateConfig,
                          templateId: t.id as any,
                        },
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      invoice.templateConfig?.templateId === t.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color & Zoom Controls Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Accent:</span>
                <div className="flex items-center gap-1.5">
                  {['#4F46E5', '#0F172A', '#E11D48', '#B45309', '#059669', '#2563EB'].map(c => (
                    <button
                      key={c}
                      onClick={() =>
                        setInvoice({
                          ...invoice,
                          templateConfig: { ...invoice.templateConfig, accentColor: c },
                        })
                      }
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c }}
                    >
                      {invoice.templateConfig?.accentColor === c && (
                        <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 text-slate-500">
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.35, Number((prev - 0.1).toFixed(2))))}
                  className="p-1 hover:text-slate-900 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] w-12 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale(prev => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                  className="p-1 hover:text-slate-900 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const mobileFit = window.innerWidth < 768 
                      ? Math.max(0.38, (window.innerWidth - 44) / 794)
                      : 0.85;
                    setZoomScale(Number(mobileFit.toFixed(2)));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                  title="Fit to Screen"
                >
                  Fit
                </button>
              </div>
            </div>
          </div>

          {/* Live Document Preview Container */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner flex justify-center">
            <TemplateRenderer 
              invoice={invoice} 
              zoomScale={zoomScale} 
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientSelectModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={selected => {
          setInvoice({ ...invoice, client: selected });
          showToast(`Client applied: ${selected.name}`, 'info');
        }}
      />

      <SendInvoiceModal
        invoice={invoice}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />

      <RecordPaymentModal
        invoice={invoice}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          // Re-fetch current invoice state
          const updated = invoices.find(i => i.id === invoice.id);
          if (updated) setInvoice(updated);
        }}
      />

      {/* Mobile Floating Bottom Action Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 z-40 flex items-center justify-between gap-2 shadow-2xl">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-1">
          <button
            onClick={() => setActiveMobileTab('editor')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMobileTab === 'editor' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            <span>Form Editor</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('preview')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMobileTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadPdf}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
