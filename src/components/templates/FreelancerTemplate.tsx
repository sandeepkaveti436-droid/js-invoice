import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const FreelancerTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#B45309'; // Warm amber/copper
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency;

  return (
    <div 
      className="p-8 md:p-14 text-stone-800 bg-white text-xs"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Georgia, serif' }}
    >
      {/* Top Header Card */}
      <div className="border border-stone-200 rounded-2xl p-6 sm:p-8 bg-stone-50/50 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-stone-200">
          <div>
            {vis.showLogo && invoice.business?.logoUrl ? (
              <img 
                src={invoice.business.logoUrl} 
                alt={invoice.business.name} 
                className="h-12 max-w-[180px] object-contain mb-3" 
              />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
                {invoice.business?.name || 'Freelance Studio'}
              </h1>
            )}

            {vis.showBusinessAddress && (
              <div className="text-[11px] text-stone-500 font-sans space-y-0.5 mt-2">
                <p>{invoice.business?.addressLine1}</p>
                <p>{invoice.business?.city}, {invoice.business?.state} {invoice.business?.postalCode}</p>
                <p>{invoice.business?.email} • {invoice.business?.phone}</p>
                {vis.showTaxId && invoice.business?.taxId && (
                  <p className="text-stone-600 font-mono">Tax / VAT: {invoice.business.taxId}</p>
                )}
              </div>
            )}
          </div>

          <div className="text-left sm:text-right font-sans">
            <span 
              className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full inline-block mb-2"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              {invoice.title || 'Statement of Work'}
            </span>
            <p className="text-2xl font-bold font-mono text-stone-900">{invoice.number}</p>
            <div className="text-xs text-stone-500 space-y-0.5 mt-2">
              <p>Issued: <span className="text-stone-800 font-medium">{formatDate(invoice.issueDate)}</span></p>
              <p>Payment Due: <span className="text-stone-800 font-medium">{formatDate(invoice.dueDate)}</span></p>
              {vis.showPoNumber && invoice.poNumber && <p>PO: {invoice.poNumber}</p>}
            </div>
          </div>
        </div>

        {/* Client & Amount Due row */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-1">
              Client
            </span>
            <p className="font-bold text-sm text-stone-900">{invoice.client?.name}</p>
            {invoice.client?.companyName && <p className="text-stone-600 text-xs">{invoice.client.companyName}</p>}
            <p className="text-stone-500 text-xs">{invoice.client?.email}</p>
          </div>

          <div className="sm:text-right bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
              Total Payable
            </span>
            <span className="text-xl font-bold font-mono text-stone-900" style={{ color: accentColor }}>
              {formatMoney(invoice.balanceDue, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="my-6 font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr 
              className="text-white text-[11px] uppercase tracking-wider font-semibold rounded-lg"
              style={{ backgroundColor: accentColor }}
            >
              <th className="py-3 px-4 rounded-l-lg">Deliverable / Service</th>
              <th className="py-3 px-2 text-center w-16">Units</th>
              <th className="py-3 px-2 text-right w-24">Rate</th>
              {vis.showItemDiscount && <th className="py-3 px-2 text-right w-20">Disc</th>}
              <th className="py-3 px-4 text-right w-28 rounded-r-lg">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  {vis.showItemDescription && item.description && (
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed font-serif italic">
                      {item.description}
                    </p>
                  )}
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-stone-600">{item.quantity} {item.unit !== 'pcs' ? item.unit : ''}</td>
                <td className="py-3.5 px-2 text-right font-mono text-stone-700">{formatMoney(item.unitPrice, currency)}</td>
                {vis.showItemDiscount && (
                  <td className="py-3.5 px-2 text-right font-mono text-stone-500">
                    {item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatMoney(item.discount, currency)) : '—'}
                  </td>
                )}
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-stone-900">{formatMoney(item.lineTotal, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-start gap-8 font-sans">
        <div className="flex-1 space-y-4 max-w-sm">
          {vis.showBankDetails && invoice.bankDetails?.bankName && (
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/40 text-xs">
              <p className="font-semibold text-stone-800 mb-1">Payment Direct to Bank</p>
              <div className="space-y-0.5 text-stone-600 text-[11px]">
                <p>Account Name: {invoice.bankDetails.accountHolder}</p>
                <p>Bank: {invoice.bankDetails.bankName}</p>
                <p>Account / IBAN: {invoice.bankDetails.accountNumber}</p>
                {invoice.bankDetails.routingNumber && <p>Sort / Routing: {invoice.bankDetails.routingNumber}</p>}
              </div>
            </div>
          )}

          {vis.showNotes && invoice.notes && (
            <div className="text-xs">
              <span className="font-serif italic font-bold text-stone-700 block mb-1">A Note from Alex:</span>
              <p className="text-stone-600 leading-relaxed font-serif">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatMoney(invoice.subtotal, currency)}</span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Discount:</span>
              <span className="font-mono text-emerald-700">−{formatMoney(invoice.totalDiscount, currency)}</span>
            </div>
          )}
          {invoice.taxes?.map((tax, i) => (
            <div key={i} className="flex justify-between text-stone-600">
              <span>{tax.name}:</span>
              <span className="font-mono">+{formatMoney(tax.amount, currency)}</span>
            </div>
          ))}
          {vis.showShipping && invoice.shippingFee > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Additional Fee:</span>
              <span className="font-mono">+{formatMoney(invoice.shippingFee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-stone-900 pt-3 border-t-2 border-stone-800">
            <span>Total:</span>
            <span className="font-mono">{formatMoney(invoice.grandTotal, currency)}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-stone-500 pt-1">
                <span>Received:</span>
                <span className="font-mono">−{formatMoney(invoice.amountPaid, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Balance Due:</span>
                <span className="font-mono text-amber-800">{formatMoney(invoice.balanceDue, currency)}</span>
              </div>
            </>
          )}

          {vis.showSignature && invoice.authorizedSignatoryName && (
            <div className="pt-8 text-right font-serif">
              <p className="italic text-base text-stone-800">{invoice.authorizedSignatoryName}</p>
              <p className="text-[10px] text-stone-400 font-sans uppercase tracking-wider">Freelancer / Creator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
