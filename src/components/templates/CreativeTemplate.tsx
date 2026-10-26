import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { Sparkles, Building2, User, Check, QrCode } from 'lucide-react';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const CreativeTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#6366F1';
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency || 'INR';

  return (
    <div 
      className="p-8 text-slate-800 bg-white min-h-[1060px] flex flex-col justify-between font-sans selection:bg-indigo-100 relative overflow-hidden"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* Top Creative Accent Gradient Band */}
      <div 
        className="absolute top-0 left-0 right-0 h-3"
        style={{ 
          background: `linear-gradient(90deg, ${accentColor} 0%, #EC4899 50%, #F59E0B 100%)` 
        }} 
      />

      <div>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {invoice.business?.name || 'Studio Invoice'}
                </h1>
                {invoice.notes && (
                  <p className="text-xs text-slate-500 font-medium">{invoice.notes}</p>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-0.5 mt-2">
              {invoice.business?.email && <p>{invoice.business.email}</p>}
              {invoice.business?.phone && <p>{invoice.business.phone}</p>}
              {invoice.business?.website && <p className="text-indigo-600 font-medium">{invoice.business.website}</p>}
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200/80 min-w-[200px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Invoice Reference
            </span>
            <p className="text-xl font-mono font-black text-slate-900 tracking-tight mb-2">
              {invoice.number || 'INV-001'}
            </p>
            <div className="text-xs space-y-1 pt-2 border-t border-slate-200 text-slate-600">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Due:</span>
                <span className="font-bold text-slate-900">{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Billing Info Banner */}
        <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Billed To:
            </span>
            <h3 className="text-base font-bold text-slate-900">{invoice.client?.name || 'Client Name'}</h3>
            {invoice.client?.companyName && (
              <p className="text-slate-600 font-medium">{invoice.client.companyName}</p>
            )}
            {invoice.client?.email && <p className="text-slate-500">{invoice.client.email}</p>}
            {invoice.client?.phone && <p className="text-slate-500">{invoice.client.phone}</p>}
          </div>

          <div className="flex flex-col justify-end sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Amount Due
            </span>
            <p 
              className="text-2xl font-black font-mono tracking-tight"
              style={{ color: accentColor }}
            >
              {formatMoney(invoice.balanceDue, currency)}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Terms: {invoice.paymentTerms || 'Due on Receipt'}</span>
          </div>
        </div>

        {/* Deliverables Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Item & Description</th>
                <th className="py-3.5 px-3 text-center">Qty</th>
                <th className="py-3.5 px-3 text-right">Price</th>
                {vis.showItemTax && <th className="py-3.5 px-3 text-center">Tax</th>}
                <th className="py-3.5 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 text-xs">{item.name || 'Deliverable'}</p>
                    {item.description && <p className="text-slate-500 text-[11px] mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-medium">{item.quantity} {item.unit || ''}</td>
                  <td className="py-3.5 px-3 text-right font-mono">{formatMoney(item.unitPrice, currency)}</td>
                  {vis.showItemTax && (
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">{item.taxRate}%</td>
                  )}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatMoney(item.lineTotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4 text-xs">
          {/* Bank / Transfer Details */}
          {vis.showBankDetails && invoice.business?.bankDetails && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Direct Payment Instructions
              </span>
              <div className="space-y-1 text-[11px]">
                {invoice.business.bankDetails.bankName && (
                  <p><span className="text-slate-400">Bank:</span> <strong className="text-slate-800">{invoice.business.bankDetails.bankName}</strong></p>
                )}
                {invoice.business.bankDetails.accountHolder && (
                  <p><span className="text-slate-400">Account Name:</span> <strong className="text-slate-800">{invoice.business.bankDetails.accountHolder}</strong></p>
                )}
                {invoice.business.bankDetails.accountNumber && (
                  <p><span className="text-slate-400">Account No:</span> <strong className="font-mono text-slate-900">{invoice.business.bankDetails.accountNumber}</strong></p>
                )}
                {invoice.business.bankDetails.routingNumber && (
                  <p><span className="text-slate-400">IFSC / Code:</span> <strong className="font-mono text-slate-900">{invoice.business.bankDetails.routingNumber}</strong></p>
                )}
              </div>
            </div>
          )}

          {/* Financial Totals Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Subtotal</span>
              <span className="font-mono">{formatMoney(invoice.subtotal, currency)}</span>
            </div>

            {invoice.totalTax > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Tax</span>
                <span className="font-mono">{formatMoney(invoice.totalTax, currency)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 pt-3 text-base font-bold">
              <span>Total</span>
              <span className="font-mono font-black" style={{ color: '#FBBF24' }}>
                {formatMoney(invoice.grandTotal, currency)}
              </span>
            </div>

            {invoice.amountPaid > 0 && (
              <div className="flex justify-between py-1 text-emerald-400 text-xs">
                <span>Amount Paid</span>
                <span className="font-mono">{formatMoney(invoice.amountPaid, currency)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 bg-white/10 px-3 rounded-xl font-bold">
              <span className="text-slate-200">Balance Due</span>
              <span className="font-mono">{formatMoney(invoice.balanceDue, currency)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {vis.showTerms && invoice.terms && (
          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-700 block mb-0.5 text-[10px] uppercase">Notes & Terms:</span>
            <p className="leading-relaxed">{invoice.terms}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <span>Powered by JS Invoice</span>
        <span>All deliverables verified & certified</span>
      </div>
    </div>
  );
};
