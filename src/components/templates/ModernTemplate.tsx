import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const ModernTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#4F46E5';
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency;

  return (
    <div 
      className="p-8 md:p-12 text-[#1E293B] bg-white text-sm"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, sans-serif' }}
    >
      {/* Top Accent Strip */}
      <div 
        className="h-2 w-full rounded-t-sm mb-8" 
        style={{ backgroundColor: accentColor }} 
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100">
        <div>
          {vis.showLogo && invoice.business?.logoUrl ? (
            <img 
              src={invoice.business.logoUrl} 
              alt={invoice.business.name} 
              className="h-12 max-w-[200px] object-contain mb-3" 
            />
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm"
                style={{ backgroundColor: accentColor }}
              >
                {invoice.business?.name ? invoice.business.name.substring(0, 2).toUpperCase() : 'JS'}
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                {invoice.business?.name || 'Company Name'}
              </span>
            </div>
          )}

          {vis.showBusinessAddress && (
            <div className="text-xs text-slate-500 space-y-0.5 leading-relaxed">
              <p>{invoice.business?.addressLine1}</p>
              {invoice.business?.addressLine2 && <p>{invoice.business.addressLine2}</p>}
              <p>{invoice.business?.city}, {invoice.business?.state} {invoice.business?.postalCode}</p>
              <p>{invoice.business?.country}</p>
              {invoice.business?.email && <p className="text-slate-600 font-medium">{invoice.business.email}</p>}
              {invoice.business?.phone && <p>{invoice.business.phone}</p>}
              {vis.showTaxId && invoice.business?.taxId && (
                <p className="mt-1 font-mono text-[11px] text-slate-700">Tax ID: {invoice.business.taxId}</p>
              )}
            </div>
          )}
        </div>

        <div className="text-left sm:text-right space-y-1">
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {invoice.title || 'Tax Invoice'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {invoice.number}
          </h2>

          <div className="text-xs text-slate-600 pt-2 space-y-1">
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-400">Issue Date:</span>
              <span className="font-medium text-slate-800">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-400">Due Date:</span>
              <span className="font-medium text-slate-800">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.paymentTerms && (
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-400">Terms:</span>
                <span className="font-medium text-slate-800">{invoice.paymentTerms}</span>
              </div>
            )}
            {vis.showPoNumber && invoice.poNumber && (
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-400">PO Number:</span>
                <span className="font-mono text-slate-800">{invoice.poNumber}</span>
              </div>
            )}
            {invoice.referenceNumber && (
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-slate-400">Reference:</span>
                <span className="font-medium text-slate-800">{invoice.referenceNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill To Card */}
      <div className="py-6 my-2">
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Billed To
            </span>
            <h3 className="font-bold text-base text-slate-900">
              {invoice.client?.name || 'Client Name'}
            </h3>
            {invoice.client?.companyName && (
              <p className="text-sm font-medium text-slate-700">{invoice.client.companyName}</p>
            )}
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              <p>{invoice.client?.addressLine1}</p>
              {invoice.client?.addressLine2 && <p>{invoice.client.addressLine2}</p>}
              <p>{invoice.client?.city}, {invoice.client?.state} {invoice.client?.postalCode}</p>
              <p>{invoice.client?.country}</p>
              {invoice.client?.email && <p className="text-slate-600">{invoice.client.email}</p>}
              {invoice.client?.phone && <p>{invoice.client.phone}</p>}
              {vis.showTaxId && invoice.client?.taxId && (
                <p className="font-mono text-[11px] text-slate-700 mt-1">Tax ID: {invoice.client.taxId}</p>
              )}
            </div>
          </div>

          {invoice.status && (
            <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Status
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                  invoice.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                  invoice.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                }`}>
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Amount Due
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {formatMoney(invoice.balanceDue, currency)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto my-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-2 text-center w-16">Qty</th>
              <th className="py-3 px-2 text-right w-24">Rate</th>
              {vis.showItemDiscount && <th className="py-3 px-2 text-right w-20">Disc</th>}
              {vis.showItemTax && <th className="py-3 px-2 text-right w-20">Tax</th>}
              <th className="py-3 px-3 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="py-3 px-3">
                  <p className="font-semibold text-slate-800">{item.name || 'Untitled Item'}</p>
                  {vis.showItemDescription && item.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </td>
                <td className="py-3 px-2 text-center text-slate-600 font-mono">
                  {item.quantity} {item.unit !== 'pcs' && item.unit !== 'units' ? item.unit : ''}
                </td>
                <td className="py-3 px-2 text-right text-slate-700 font-mono">
                  {formatMoney(item.unitPrice, currency)}
                </td>
                {vis.showItemDiscount && (
                  <td className="py-3 px-2 text-right text-slate-500 font-mono">
                    {item.discount > 0 ? (
                      item.discountType === 'percentage' ? `${item.discount}%` : formatMoney(item.discount, currency)
                    ) : '—'}
                  </td>
                )}
                {vis.showItemTax && (
                  <td className="py-3 px-2 text-right text-slate-500 font-mono">
                    {item.taxRate > 0 ? `${item.taxRate}%` : '0%'}
                  </td>
                )}
                <td className="py-3 px-3 text-right font-semibold text-slate-900 font-mono">
                  {formatMoney(item.lineTotal, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary & Bank Information */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-200">
        {/* Left Side: Bank & Notes */}
        <div className="flex-1 space-y-4 max-w-sm">
          {vis.showBankDetails && invoice.bankDetails?.bankName && (
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
              <h4 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                Payment Instructions
              </h4>
              <div className="space-y-0.5 text-slate-600 font-mono text-[11px]">
                <p><span className="text-slate-400 font-sans">Bank:</span> {invoice.bankDetails.bankName}</p>
                <p><span className="text-slate-400 font-sans">Account:</span> {invoice.bankDetails.accountHolder}</p>
                <p><span className="text-slate-400 font-sans">A/C Number:</span> {invoice.bankDetails.accountNumber}</p>
                {invoice.bankDetails.routingNumber && (
                  <p><span className="text-slate-400 font-sans">Routing/IFSC:</span> {invoice.bankDetails.routingNumber}</p>
                )}
                {invoice.bankDetails.swiftCode && (
                  <p><span className="text-slate-400 font-sans">SWIFT:</span> {invoice.bankDetails.swiftCode}</p>
                )}
              </div>
            </div>
          )}

          {vis.showNotes && invoice.notes && (
            <div className="text-xs">
              <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
              <p className="text-slate-500 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {vis.showTerms && invoice.terms && (
            <div className="text-[11px]">
              <span className="font-semibold text-slate-600 block mb-0.5">Terms & Conditions:</span>
              <p className="text-slate-400 whitespace-pre-line leading-relaxed">{invoice.terms}</p>
            </div>
          )}
        </div>

        {/* Right Side: Totals Calculation Breakdown */}
        <div className="w-full sm:w-72 space-y-2 text-xs">
          <div className="flex justify-between py-1 text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-medium">{formatMoney(invoice.subtotal, currency)}</span>
          </div>

          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between py-1 text-emerald-600">
              <span>Discount:</span>
              <span className="font-mono font-medium">−{formatMoney(invoice.totalDiscount, currency)}</span>
            </div>
          )}

          {invoice.taxes?.map((tax, i) => (
            <div key={i} className="flex justify-between py-1 text-slate-600">
              <span>{tax.name}:</span>
              <span className="font-mono font-medium">+{formatMoney(tax.amount, currency)}</span>
            </div>
          ))}

          {vis.showShipping && invoice.shippingFee > 0 && (
            <div className="flex justify-between py-1 text-slate-600">
              <span>Shipping & Handling:</span>
              <span className="font-mono font-medium">+{formatMoney(invoice.shippingFee, currency)}</span>
            </div>
          )}

          {vis.showWithholding && invoice.withholdingAmount > 0 && (
            <div className="flex justify-between py-1 text-rose-600">
              <span>Withholding / Retention ({invoice.withholdingTaxRate}%):</span>
              <span className="font-mono font-medium">−{formatMoney(invoice.withholdingAmount, currency)}</span>
            </div>
          )}

          <div 
            className="flex justify-between py-3 px-3 rounded-lg text-white font-bold text-sm mt-3"
            style={{ backgroundColor: accentColor }}
          >
            <span>Total:</span>
            <span className="font-mono">{formatMoney(invoice.grandTotal, currency)}</span>
          </div>

          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between py-1 text-slate-600 pt-2 border-t border-slate-100">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-600 font-semibold">
                  −{formatMoney(invoice.amountPaid, currency)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-900 font-bold border-t border-slate-200">
                <span>Balance Due:</span>
                <span className="font-mono text-base">{formatMoney(invoice.balanceDue, currency)}</span>
              </div>
            </>
          )}

          {/* Signature */}
          {vis.showSignature && invoice.authorizedSignatoryName && (
            <div className="pt-8 text-right">
              {invoice.signatureData && (
                <img 
                  src={invoice.signatureData} 
                  alt="Signature" 
                  className="h-10 ml-auto object-contain mb-1" 
                />
              )}
              <div className="border-t border-slate-300 w-44 ml-auto pt-1">
                <p className="font-medium text-slate-800 text-xs">{invoice.authorizedSignatoryName}</p>
                <p className="text-[10px] text-slate-400">Authorized Signatory</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {invoice.footerText && (
        <div className="mt-12 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          {invoice.footerText}
        </div>
      )}
    </div>
  );
};
