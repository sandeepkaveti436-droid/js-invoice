import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck, Building2, User, CheckCircle2 } from 'lucide-react';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const ExecutiveTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#0F172A';
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency || 'INR';

  return (
    <div 
      className="p-8 text-slate-900 bg-white min-h-[980px] flex flex-col justify-between font-sans selection:bg-slate-100"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, sans-serif' }}
    >
      <div>
        {/* Top Executive Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter"
                style={{ backgroundColor: accentColor }}
              >
                JS
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {invoice.business?.name || 'Commercial Invoice'}
                </h1>
                {invoice.business?.email && (
                  <p className="text-xs text-slate-500 font-medium">{invoice.business.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-1">
              {invoice.title || 'Official Commercial Invoice'}
            </span>
            <p className="text-xl sm:text-2xl font-mono font-black text-slate-900 tracking-tight">
              {invoice.number || 'INV-001'}
            </p>
          </div>
        </div>

        {/* Executive Meta Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-xs">
          {/* Bill From */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              Issued By
            </span>
            <p className="font-bold text-slate-900 text-sm mb-1">{invoice.business?.name || 'Billing Department'}</p>
            {invoice.business?.phone && <p className="text-slate-600">{invoice.business.phone}</p>}
            {invoice.business?.addressLine1 && <p className="text-slate-600">{invoice.business.addressLine1}</p>}
            {invoice.business?.city && <p className="text-slate-600">{invoice.business.city}, {invoice.business.state}</p>}
            {invoice.business?.taxId && <p className="text-slate-500 font-mono mt-1">Tax ID: {invoice.business.taxId}</p>}
          </div>

          {/* Bill To */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              Billed To
            </span>
            <p className="font-bold text-slate-900 text-sm mb-1">{invoice.client?.name || 'Client'}</p>
            {invoice.client?.companyName && <p className="text-slate-600 font-semibold">{invoice.client.companyName}</p>}
            {invoice.client?.email && <p className="text-slate-600">{invoice.client.email}</p>}
            {invoice.client?.phone && <p className="text-slate-600">{invoice.client.phone}</p>}
            {invoice.client?.addressLine1 && <p className="text-slate-600">{invoice.client.addressLine1}</p>}
          </div>

          {/* Timeline & Payment Terms */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
                Invoice Details
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-mono font-bold text-slate-900">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Terms:</span>
                  <span className="font-semibold text-slate-900">{invoice.paymentTerms || 'Due on Receipt'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due:</span>
              <span className="text-lg font-mono font-black text-slate-900">
                {formatMoney(invoice.balanceDue, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                {vis.showItemTax && <th className="py-3 px-3 text-center">Tax</th>}
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 text-xs">{item.name || 'Line Item'}</p>
                    {item.description && <p className="text-slate-500 text-[11px] mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">{item.quantity} {item.unit || ''}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatMoney(item.unitPrice, currency)}</td>
                  {vis.showItemTax && (
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{item.taxRate}%</td>
                  )}
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatMoney(item.lineTotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Banking Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4 text-xs">
          {/* Wire & Bank Instructions */}
          {vis.showBankDetails && invoice.business?.bankDetails && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Banking Instructions</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {invoice.business.bankDetails.bankName && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bank:</span>
                    <span className="font-semibold text-slate-800">{invoice.business.bankDetails.bankName}</span>
                  </div>
                )}
                {invoice.business.bankDetails.accountHolder && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account Holder:</span>
                    <span className="font-semibold text-slate-800">{invoice.business.bankDetails.accountHolder}</span>
                  </div>
                )}
                {invoice.business.bankDetails.accountNumber && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account / IBAN:</span>
                    <span className="font-mono font-bold text-slate-900">{invoice.business.bankDetails.accountNumber}</span>
                  </div>
                )}
                {invoice.business.bankDetails.routingNumber && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">IFSC / Routing:</span>
                    <span className="font-mono font-bold text-slate-900">{invoice.business.bankDetails.routingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Totals Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-mono font-semibold">{formatMoney(invoice.subtotal, currency)}</span>
            </div>

            {invoice.totalTax > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tax</span>
                <span className="font-mono font-semibold">{formatMoney(invoice.totalTax, currency)}</span>
              </div>
            )}

            {invoice.invoiceDiscount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 text-emerald-700">
                <span>Discount</span>
                <span className="font-mono font-semibold">-{formatMoney(invoice.invoiceDiscount, currency)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 pt-3 border-t-2 border-slate-900 text-sm font-bold">
              <span className="text-slate-900 uppercase tracking-tight">Total Amount</span>
              <span className="font-mono font-black text-slate-900">{formatMoney(invoice.grandTotal, currency)}</span>
            </div>

            {invoice.amountPaid > 0 && (
              <div className="flex justify-between py-1 text-emerald-700 text-xs">
                <span>Amount Paid</span>
                <span className="font-mono font-semibold">{formatMoney(invoice.amountPaid, currency)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 bg-slate-900 text-white px-3 rounded-lg font-bold">
              <span>Balance Due</span>
              <span className="font-mono">{formatMoney(invoice.balanceDue, currency)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {vis.showTerms && invoice.terms && (
          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-200">
            <span className="font-bold text-slate-700 block mb-0.5 uppercase tracking-wider text-[10px]">Payment Terms & Conditions:</span>
            <p className="leading-relaxed">{invoice.terms}</p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <span>Generated with JS Invoice • Commercial Billing Engine</span>
        <span>Thank you for your business</span>
      </div>
    </div>
  );
};
