import React, { useState, useMemo } from 'react';
import { Quote, InvoiceItem, Client, Product } from '../types';
import { useApp } from '../context/AppContext';
import { calculateInvoice } from '../utils/calculator';
import { CURRENCIES, formatMoney } from '../utils/currency';
import { generateQuoteNumber, getDateAfterDays, getTodayDateString } from '../utils/formatters';
import { ClientSelectModal } from '../components/invoice/ClientSelectModal';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy, 
  Users, 
  Sparkles 
} from 'lucide-react';

interface Props {
  isEditing?: boolean;
}

export const QuoteEditorPage: React.FC<Props> = ({ isEditing = false }) => {
  const { 
    activeQuoteId, 
    quotes, 
    clients, 
    settings, 
    saveQuote, 
    convertQuote, 
    setCurrentView, 
    showToast 
  } = useApp();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const initialQuote = useMemo<Quote>(() => {
    if (isEditing && activeQuoteId) {
      const found = quotes.find(q => q.id === activeQuoteId);
      if (found) return JSON.parse(JSON.stringify(found));
    }

    const defaultItems: InvoiceItem[] = [
      {
        id: 'qit_' + Date.now(),
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
      pricingMode: 'exclusive',
      invoiceDiscount: 0,
      invoiceDiscountType: 'fixed',
      shippingFee: 0,
      withholdingTaxRate: 0,
      gstEnabled: false,
      gstType: 'NONE',
      amountPaid: 0,
    });

    return {
      id: 'quote_' + Date.now(),
      number: generateQuoteNumber('EST-2026-', quotes.length + 1),
      prefix: 'EST-2026-',
      title: 'Project Estimate',
      issueDate: getTodayDateString(),
      expiryDate: getDateAfterDays(15),
      currency: settings.invoiceDefaults.defaultCurrency || 'INR',
      business: JSON.parse(JSON.stringify(settings.business)),
      client: clients[0] || {
        id: '',
        name: '',
        email: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        createdAt: new Date().toISOString(),
      },
      ...calc,
      pricingMode: 'exclusive',
      gstEnabled: false,
      gstType: 'NONE',
      invoiceDiscount: 0,
      invoiceDiscountType: 'fixed',
      shippingFee: 0,
      notes: 'Estimate valid for 15 days.',
      terms: 'Milestone deliverables as per agreed specification.',
      status: 'draft',
      templateConfig: {
        templateId: 'modern',
        accentColor: '#4F46E5',
        fontFamily: 'Inter',
        logoPlacement: 'left',
        tableStyle: 'striped',
        headerLayout: 'split',
        showQrCode: true,
      },
      visibility: {
        showLogo: true,
        showBusinessAddress: true,
        showTaxId: true,
        showPoNumber: false,
        showItemDiscount: true,
        showItemTax: true,
        showItemHsn: false,
        showItemDescription: true,
        showBankDetails: false,
        showNotes: true,
        showTerms: true,
        showSignature: true,
        showShipping: false,
        showWithholding: false,
        showPaymentInstructions: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [isEditing, activeQuoteId, quotes, clients, settings]);

  const [quote, setQuote] = useState<Quote>(initialQuote);

  const triggerRecalc = (partial: Partial<Quote>) => {
    setQuote(prev => {
      const merged = { ...prev, ...partial };
      const calcResult = calculateInvoice({
        items: merged.items,
        pricingMode: merged.pricingMode,
        invoiceDiscount: merged.invoiceDiscount,
        invoiceDiscountType: merged.invoiceDiscountType,
        shippingFee: merged.shippingFee,
        withholdingTaxRate: 0,
        gstEnabled: merged.gstEnabled,
        gstType: merged.gstType,
        amountPaid: 0,
      });
      return { ...merged, ...calcResult };
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...quote.items];
    updated[index] = { ...updated[index], [field]: value };
    triggerRecalc({ items: updated });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: 'qit_' + Date.now(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'hrs',
      unitPrice: 100,
      discount: 0,
      discountType: 'percentage',
      taxRate: 10,
      lineSubtotal: 100,
      lineDiscount: 0,
      taxableAmount: 100,
      lineTax: 10,
      lineTotal: 110,
    };
    triggerRecalc({ items: [...quote.items, newItem] });
  };

  const handleDeleteItem = (index: number) => {
    if (quote.items.length <= 1) return;
    triggerRecalc({ items: quote.items.filter((_, i) => i !== index) });
  };

  const handleSave = () => {
    saveQuote(quote);
    setCurrentView('quotes');
  };

  const handleConvertToInvoice = () => {
    const saved = saveQuote(quote);
    convertQuote(saved.id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => setCurrentView('quotes')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Estimates</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save Estimate</span>
          </button>

          <button
            onClick={handleConvertToInvoice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>Convert to Invoice</span>
          </button>
        </div>
      </div>

      {/* Quote Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-6">
        {/* Quote Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quote #</label>
            <input
              type="text"
              value={quote.number}
              onChange={e => setQuote({ ...quote, number: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quote Title</label>
            <input
              type="text"
              value={quote.title}
              onChange={e => setQuote({ ...quote, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={quote.issueDate}
              onChange={e => setQuote({ ...quote, issueDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Valid Until (Expiry)</label>
            <input
              type="date"
              value={quote.expiryDate}
              onChange={e => setQuote({ ...quote, expiryDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
            />
          </div>
        </div>

        {/* Client Selector */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estimated For</span>
            {quote.client?.name ? (
              <>
                <p className="font-bold text-sm text-slate-900">{quote.client.name}</p>
                {quote.client?.companyName && <p className="text-slate-500">{quote.client.companyName}</p>}
                <p className="text-slate-400">{quote.client?.email}</p>
              </>
            ) : (
              <p className="font-semibold text-slate-400 italic">No client selected — click Select Client to choose or enter client details</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Select Client</span>
          </button>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Proposed Deliverables & Pricing</h3>
          </div>

          {quote.items.map((item, idx) => (
            <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                <button
                  onClick={() => handleDeleteItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Deliverable Name"
                  value={item.name}
                  onChange={e => handleItemChange(idx, 'name', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="Scope Description"
                  value={item.description}
                  onChange={e => handleItemChange(idx, 'description', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Unit Price</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Tax %</label>
                  <input
                    type="number"
                    value={item.taxRate}
                    onChange={e => handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="text-right font-mono font-bold text-slate-900 pt-1">
                Line Total: {formatMoney(item.lineTotal, quote.currency)}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2 rounded-xl border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Totals Summary */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-right">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatMoney(quote.subtotal, quote.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Taxes:</span>
            <span className="font-mono">+{formatMoney(quote.totalTax, quote.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
            <span>Estimate Total:</span>
            <span className="font-mono">{formatMoney(quote.grandTotal, quote.currency)}</span>
          </div>
        </div>
      </div>

      <ClientSelectModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={c => setQuote({ ...quote, client: c })}
      />
    </div>
  );
};
