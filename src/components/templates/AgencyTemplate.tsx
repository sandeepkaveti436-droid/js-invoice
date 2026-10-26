import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const AgencyTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#E11D48'; // Rose / crimson creative
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency;

  return (
    <div 
      className="text-slate-900 bg-white text-xs"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* Dark Bold Header Banner */}
      <div className="bg-slate-950 text-white p-8 md:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-wider"
                style={{ backgroundColor: accentColor }}
              >
                {invoice.business?.name ? invoice.business.name.substring(0, 2).toUpperCase() : 'AG'}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                {invoice.business?.name || 'Creative Agency'}
              </h1>
            </div>

            {vis.showBusinessAddress && (
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p>{invoice.business?.addressLine1}</p>
                <p>{invoice.business?.city}, {invoice.business?.state} {invoice.business?.postalCode} • {invoice.business?.country}</p>
                <p>{invoice.business?.email} • {invoice.business?.phone}</p>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded text-white inline-block mb-2"
              style={{ backgroundColor: accentColor }}
            >
              {invoice.title || 'Agency Invoice'}
            </span>
            <p className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {invoice.number}
            </p>
            <div className="text-xs text-slate-400 space-y-1 mt-3">
              <p>Issue Date: <span className="text-white font-medium">{formatDate(invoice.issueDate)}</span></p>
              <p>Due Date: <span className="text-white font-medium">{formatDate(invoice.dueDate)}</span></p>
              {vis.showPoNumber && invoice.poNumber && <p>PO Reference: <span className="text-white">{invoice.poNumber}</span></p>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 md:p-12">
        {/* Client Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-slate-100">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
              Project & Client
            </span>
            <h2 className="text-lg font-bold text-slate-900">{invoice.client?.name}</h2>
            {invoice.client?.companyName && (
              <p className="text-slate-600 font-medium">{invoice.client.companyName}</p>
            )}
            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
              <p>{invoice.client?.addressLine1}</p>
              <p>{invoice.client?.city}, {invoice.client?.state} {invoice.client?.postalCode}</p>
              <p>{invoice.client?.email}</p>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
              Outstanding Amount
            </span>
            <span className="text-2xl font-black font-mono text-slate-900" style={{ color: accentColor }}>
              {formatMoney(invoice.balanceDue, currency)}
            </span>
            {invoice.paymentTerms && (
              <p className="text-[11px] text-slate-500 mt-1">Payment: {invoice.paymentTerms}</p>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="my-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                <th className="py-3 px-3">Itemized Production Scope</th>
                <th className="py-3 px-2 text-center w-16">Units</th>
                <th className="py-3 px-2 text-right w-24">Rate</th>
                {vis.showItemDiscount && <th className="py-3 px-2 text-right w-20">Discount</th>}
                <th className="py-3 px-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-4 px-3">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {vis.showItemDescription && item.description && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center font-mono text-slate-600">{item.quantity}</td>
                  <td className="py-4 px-2 text-right font-mono text-slate-700">{formatMoney(item.unitPrice, currency)}</td>
                  {vis.showItemDiscount && (
                    <td className="py-4 px-2 text-right font-mono text-slate-500">
                      {item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatMoney(item.discount, currency)) : '—'}
                    </td>
                  )}
                  <td className="py-4 px-3 text-right font-mono font-bold text-slate-900">{formatMoney(item.lineTotal, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes */}
        <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start gap-8">
          <div className="flex-1 space-y-4 max-w-sm">
            {vis.showBankDetails && invoice.bankDetails?.bankName && (
              <div className="bg-slate-100 rounded-lg p-3.5 text-xs">
                <p className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1">Direct Wire Instructions</p>
                <p className="text-slate-600 text-[11px]">Bank: {invoice.bankDetails.bankName}</p>
                <p className="text-slate-600 text-[11px]">Account: {invoice.bankDetails.accountHolder} ({invoice.bankDetails.accountNumber})</p>
                {invoice.bankDetails.swiftCode && <p className="text-slate-600 text-[11px]">SWIFT: {invoice.bankDetails.swiftCode}</p>}
              </div>
            )}

            {vis.showNotes && invoice.notes && (
              <div className="text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Production Notes:</span>
                <p className="text-slate-500 leading-relaxed">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatMoney(invoice.subtotal, currency)}</span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-mono text-emerald-600">−{formatMoney(invoice.totalDiscount, currency)}</span>
              </div>
            )}
            {invoice.taxes?.map((tax, i) => (
              <div key={i} className="flex justify-between text-slate-600">
                <span>{tax.name}:</span>
                <span className="font-mono">+{formatMoney(tax.amount, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between text-slate-900 font-black text-sm pt-3 border-t-2 border-slate-900">
              <span>Total:</span>
              <span className="font-mono">{formatMoney(invoice.grandTotal, currency)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Paid:</span>
                  <span className="font-mono">−{formatMoney(invoice.amountPaid, currency)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span className="font-mono" style={{ color: accentColor }}>{formatMoney(invoice.balanceDue, currency)}</span>
                </div>
              </>
            )}

            {vis.showSignature && invoice.authorizedSignatoryName && (
              <div className="pt-8 text-right">
                <p className="font-bold text-slate-900 text-xs">{invoice.authorizedSignatoryName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Executive Producer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
