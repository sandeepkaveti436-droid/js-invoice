import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const CorporateTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#0F172A'; // Corporate deep navy
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency;

  return (
    <div 
      className="p-8 md:p-12 text-slate-800 bg-white text-xs"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, sans-serif' }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2" style={{ borderColor: accentColor }}>
        <div>
          {vis.showLogo && invoice.business?.logoUrl ? (
            <img 
              src={invoice.business.logoUrl} 
              alt={invoice.business.name} 
              className="h-12 max-w-[200px] object-contain mb-3" 
            />
          ) : (
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
              {invoice.business?.name || 'Corporate Entity'}
            </h1>
          )}

          {vis.showBusinessAddress && (
            <div className="text-[11px] text-slate-500 space-y-0.5 leading-normal">
              <p>{invoice.business?.addressLine1}</p>
              {invoice.business?.addressLine2 && <p>{invoice.business.addressLine2}</p>}
              <p>{invoice.business?.city}, {invoice.business?.state} {invoice.business?.postalCode}</p>
              <p>{invoice.business?.country}</p>
              <p className="text-slate-600 font-medium">Email: {invoice.business?.email} | Tel: {invoice.business?.phone}</p>
              {vis.showTaxId && invoice.business?.taxId && (
                <p className="font-mono text-slate-700 font-semibold">Corporate Tax Reg: {invoice.business.taxId}</p>
              )}
            </div>
          )}
        </div>

        <div className="text-left sm:text-right">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900" style={{ color: accentColor }}>
            {invoice.title || 'COMMERCIAL INVOICE'}
          </h2>
          <table className="mt-3 text-[11px] text-left sm:text-right border-collapse ml-auto">
            <tbody>
              <tr>
                <td className="pr-3 text-slate-400 font-medium py-0.5">Invoice No:</td>
                <td className="font-mono font-bold text-slate-900 py-0.5">{invoice.number}</td>
              </tr>
              <tr>
                <td className="pr-3 text-slate-400 font-medium py-0.5">Date of Issue:</td>
                <td className="font-medium text-slate-800 py-0.5">{formatDate(invoice.issueDate)}</td>
              </tr>
              <tr>
                <td className="pr-3 text-slate-400 font-medium py-0.5">Payment Due:</td>
                <td className="font-medium text-slate-800 py-0.5">{formatDate(invoice.dueDate)}</td>
              </tr>
              {vis.showPoNumber && invoice.poNumber && (
                <tr>
                  <td className="pr-3 text-slate-400 font-medium py-0.5">PO Number:</td>
                  <td className="font-mono text-slate-900 py-0.5">{invoice.poNumber}</td>
                </tr>
              )}
              {invoice.paymentTerms && (
                <tr>
                  <td className="pr-3 text-slate-400 font-medium py-0.5">Terms:</td>
                  <td className="text-slate-800 py-0.5">{invoice.paymentTerms}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill To & Ship To Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="border border-slate-300 rounded p-4 bg-slate-50/40">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            Buyer / Bill To
          </p>
          <p className="font-bold text-sm text-slate-900">{invoice.client?.companyName || invoice.client?.name}</p>
          {invoice.client?.companyName && <p className="text-slate-600 text-xs">Attn: {invoice.client.name}</p>}
          <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
            <p>{invoice.client?.addressLine1}</p>
            <p>{invoice.client?.city}, {invoice.client?.state} {invoice.client?.postalCode}</p>
            <p>{invoice.client?.country}</p>
            {invoice.client?.email && <p>Email: {invoice.client.email}</p>}
            {vis.showTaxId && invoice.client?.taxId && (
              <p className="font-mono text-slate-700 font-semibold pt-0.5">Tax Registration No: {invoice.client.taxId}</p>
            )}
          </div>
        </div>

        <div className="border border-slate-300 rounded p-4 bg-slate-50/40 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Payment Status & Balance
            </p>
            <p className="text-xs text-slate-600">Status: <span className="font-bold uppercase">{invoice.status}</span></p>
            {invoice.referenceNumber && <p className="text-xs text-slate-600 mt-1">Reference: {invoice.referenceNumber}</p>}
          </div>

          <div className="pt-4 border-t border-slate-200 mt-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Due Amount</span>
            <span className="text-xl font-bold font-mono text-slate-900">{formatMoney(invoice.balanceDue, currency)}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="my-6">
        <table className="w-full text-left border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">#</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Item Description</th>
              <th className="py-2.5 px-2 text-center w-16 border-r border-slate-300">Qty</th>
              <th className="py-2.5 px-2 text-right w-24 border-r border-slate-300">Unit Price</th>
              {vis.showItemDiscount && <th className="py-2.5 px-2 text-right w-20 border-r border-slate-300">Discount</th>}
              {vis.showItemTax && <th className="py-2.5 px-2 text-right w-20 border-r border-slate-300">Tax</th>}
              <th className="py-2.5 px-3 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-400 font-mono">{idx + 1}</td>
                <td className="py-2.5 px-3 border-r border-slate-200">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  {vis.showItemDescription && item.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  )}
                </td>
                <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono">{item.quantity}</td>
                <td className="py-2.5 px-2 text-right border-r border-slate-200 font-mono">{formatMoney(item.unitPrice, currency)}</td>
                {vis.showItemDiscount && (
                  <td className="py-2.5 px-2 text-right border-r border-slate-200 font-mono">
                    {item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatMoney(item.discount, currency)) : '—'}
                  </td>
                )}
                {vis.showItemTax && (
                  <td className="py-2.5 px-2 text-right border-r border-slate-200 font-mono">{item.taxRate > 0 ? `${item.taxRate}%` : '0%'}</td>
                )}
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{formatMoney(item.lineTotal, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 items-start">
        <div className="space-y-4">
          {vis.showBankDetails && invoice.bankDetails?.bankName && (
            <div className="border border-slate-300 rounded p-3 text-[11px] bg-slate-50">
              <p className="font-bold text-slate-800 uppercase text-[10px] mb-1">Remittance Instructions</p>
              <p className="text-slate-600">Beneficiary: {invoice.bankDetails.accountHolder}</p>
              <p className="text-slate-600">Bank: {invoice.bankDetails.bankName}</p>
              <p className="text-slate-600">Account No: {invoice.bankDetails.accountNumber}</p>
              {invoice.bankDetails.routingNumber && <p className="text-slate-600">Routing / Sort: {invoice.bankDetails.routingNumber}</p>}
              {invoice.bankDetails.swiftCode && <p className="text-slate-600">SWIFT / BIC: {invoice.bankDetails.swiftCode}</p>}
            </div>
          )}

          {vis.showTerms && invoice.terms && (
            <div className="text-[11px] text-slate-500">
              <p className="font-bold text-slate-700 text-[10px] uppercase mb-0.5">Commercial Terms:</p>
              <p className="leading-relaxed">{invoice.terms}</p>
            </div>
          )}
        </div>

        <div className="border border-slate-300 rounded p-4 bg-slate-50/60 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatMoney(invoice.subtotal, currency)}</span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Less Discount:</span>
              <span className="font-mono text-emerald-700">−{formatMoney(invoice.totalDiscount, currency)}</span>
            </div>
          )}
          {invoice.taxes?.map((tax, i) => (
            <div key={i} className="flex justify-between text-slate-600">
              <span>{tax.name}:</span>
              <span className="font-mono">+{formatMoney(tax.amount, currency)}</span>
            </div>
          ))}
          {vis.showShipping && invoice.shippingFee > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Freight / Shipping:</span>
              <span className="font-mono">+{formatMoney(invoice.shippingFee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-300">
            <span>Grand Total:</span>
            <span className="font-mono">{formatMoney(invoice.grandTotal, currency)}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Total Paid:</span>
                <span className="font-mono">−{formatMoney(invoice.amountPaid, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
                <span>Net Balance Due:</span>
                <span className="font-mono text-base">{formatMoney(invoice.balanceDue, currency)}</span>
              </div>
            </>
          )}

          {vis.showSignature && invoice.authorizedSignatoryName && (
            <div className="pt-8 text-right">
              <div className="border-t border-slate-400 w-44 ml-auto pt-1">
                <p className="font-bold text-slate-800 text-[11px]">{invoice.authorizedSignatoryName}</p>
                <p className="text-[10px] text-slate-500">For {invoice.business?.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
