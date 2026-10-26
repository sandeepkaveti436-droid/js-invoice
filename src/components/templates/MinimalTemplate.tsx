import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const MinimalTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#111827';
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency;

  return (
    <div 
      className="p-8 md:p-14 text-zinc-800 bg-white text-xs leading-relaxed"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pb-10 border-b border-zinc-200">
        <div>
          {vis.showLogo && invoice.business?.logoUrl ? (
            <img 
              src={invoice.business.logoUrl} 
              alt={invoice.business.name} 
              className="h-10 max-w-[180px] object-contain mb-4 grayscale" 
            />
          ) : (
            <h1 className="text-xl font-medium tracking-tight text-zinc-950 mb-2">
              {invoice.business?.name || 'Company Name'}
            </h1>
          )}

          {vis.showBusinessAddress && (
            <div className="text-[11px] text-zinc-400 space-y-0.5">
              <p>{invoice.business?.addressLine1}</p>
              {invoice.business?.addressLine2 && <p>{invoice.business.addressLine2}</p>}
              <p>{invoice.business?.city}, {invoice.business?.state} {invoice.business?.postalCode}</p>
              <p>{invoice.business?.country}</p>
              {invoice.business?.email && <p>{invoice.business.email}</p>}
              {vis.showTaxId && invoice.business?.taxId && (
                <p className="pt-1 text-zinc-500 font-mono">Tax ID: {invoice.business.taxId}</p>
              )}
            </div>
          )}
        </div>

        <div className="text-left sm:text-right space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
            {invoice.title || 'Invoice'}
          </p>
          <p className="text-2xl font-light tracking-tight text-zinc-900 font-mono">
            {invoice.number}
          </p>
          <div className="pt-2 text-[11px] text-zinc-500 space-y-1">
            <p><span className="text-zinc-400">Date:</span> {formatDate(invoice.issueDate)}</p>
            <p><span className="text-zinc-400">Due:</span> {formatDate(invoice.dueDate)}</p>
            {vis.showPoNumber && invoice.poNumber && (
              <p><span className="text-zinc-400">PO:</span> {invoice.poNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Client Row */}
      <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-zinc-100">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-2 font-medium">
            Invoice To
          </span>
          <p className="font-semibold text-sm text-zinc-900">{invoice.client?.name}</p>
          {invoice.client?.companyName && (
            <p className="text-zinc-600 text-xs">{invoice.client.companyName}</p>
          )}
          <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
            <p>{invoice.client?.addressLine1}</p>
            <p>{invoice.client?.city}, {invoice.client?.state} {invoice.client?.postalCode}</p>
            <p>{invoice.client?.country}</p>
            {invoice.client?.email && <p>{invoice.client.email}</p>}
            {vis.showTaxId && invoice.client?.taxId && (
              <p className="text-zinc-500 font-mono pt-0.5">Tax ID: {invoice.client.taxId}</p>
            )}
          </div>
        </div>

        <div className="sm:text-right flex flex-col justify-end">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1 font-medium">
            Balance Due
          </span>
          <span className="text-3xl font-light tracking-tight text-zinc-950 font-mono">
            {formatMoney(invoice.balanceDue, currency)}
          </span>
          {invoice.paymentTerms && (
            <p className="text-[11px] text-zinc-400 mt-1">Payment terms: {invoice.paymentTerms}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="my-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400">
              <th className="py-3 pr-4 font-medium">Item & Description</th>
              <th className="py-3 px-2 text-center w-16 font-medium">Qty</th>
              <th className="py-3 px-2 text-right w-24 font-medium">Price</th>
              {vis.showItemDiscount && <th className="py-3 px-2 text-right w-20 font-medium">Disc</th>}
              <th className="py-3 pl-4 text-right w-28 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  {vis.showItemDescription && item.description && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">{item.description}</p>
                  )}
                </td>
                <td className="py-3.5 px-2 text-center text-zinc-500 font-mono">{item.quantity}</td>
                <td className="py-3.5 px-2 text-right text-zinc-600 font-mono">{formatMoney(item.unitPrice, currency)}</td>
                {vis.showItemDiscount && (
                  <td className="py-3.5 px-2 text-right text-zinc-400 font-mono">
                    {item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatMoney(item.discount, currency)) : '—'}
                  </td>
                )}
                <td className="py-3.5 pl-4 text-right font-medium text-zinc-900 font-mono">{formatMoney(item.lineTotal, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculation & Terms */}
      <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
        <div className="space-y-4 text-[11px]">
          {vis.showBankDetails && invoice.bankDetails?.bankName && (
            <div>
              <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">Payment Instructions</p>
              <p className="text-zinc-500">Bank: {invoice.bankDetails.bankName}</p>
              <p className="text-zinc-500">Account: {invoice.bankDetails.accountHolder} ({invoice.bankDetails.accountNumber})</p>
              {invoice.bankDetails.routingNumber && <p className="text-zinc-500">Routing: {invoice.bankDetails.routingNumber}</p>}
            </div>
          )}
          {vis.showNotes && invoice.notes && (
            <div>
              <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">Notes</p>
              <p className="text-zinc-400 leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-right text-xs">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span className="font-mono">{formatMoney(invoice.subtotal, currency)}</span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between text-zinc-500">
              <span>Discount</span>
              <span className="font-mono">−{formatMoney(invoice.totalDiscount, currency)}</span>
            </div>
          )}
          {invoice.taxes?.map((tax, i) => (
            <div key={i} className="flex justify-between text-zinc-500">
              <span>{tax.name}</span>
              <span className="font-mono">+{formatMoney(tax.amount, currency)}</span>
            </div>
          ))}
          {vis.showShipping && invoice.shippingFee > 0 && (
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span className="font-mono">+{formatMoney(invoice.shippingFee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-zinc-950 font-medium text-sm pt-3 border-t border-zinc-200">
            <span>Total</span>
            <span className="font-mono font-semibold">{formatMoney(invoice.grandTotal, currency)}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-zinc-400 pt-1">
                <span>Paid</span>
                <span className="font-mono">−{formatMoney(invoice.amountPaid, currency)}</span>
              </div>
              <div className="flex justify-between text-zinc-950 font-bold pt-1 border-t border-zinc-100">
                <span>Balance Due</span>
                <span className="font-mono">{formatMoney(invoice.balanceDue, currency)}</span>
              </div>
            </>
          )}

          {vis.showSignature && invoice.authorizedSignatoryName && (
            <div className="pt-8 text-right">
              <div className="border-t border-zinc-200 w-36 ml-auto pt-1 text-[10px] text-zinc-500">
                {invoice.authorizedSignatoryName}
              </div>
            </div>
          )}
        </div>
      </div>

      {invoice.footerText && (
        <div className="mt-12 text-center text-[10px] text-zinc-400">
          {invoice.footerText}
        </div>
      )}
    </div>
  );
};
