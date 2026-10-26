import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { numberToWords } from '../../utils/numberToWords';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const GSTInvoiceTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#1E40AF'; // Blue
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency || 'INR';

  const isIGST = invoice.gstType === 'IGST';

  return (
    <div 
      className="p-6 md:p-10 text-slate-900 bg-white text-[11px] leading-tight"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, sans-serif' }}
    >
      {/* Title Header */}
      <div className="text-center pb-3 border-b-2 border-slate-900 mb-4">
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
          TAX INVOICE
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
          (Issued under Section 31 of CGST / SGST Act)
        </p>
      </div>

      {/* Supplier & Details Grid */}
      <div className="border border-slate-900 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 mb-4">
        {/* Supplier details */}
        <div className="p-3 space-y-1">
          <p className="font-bold text-sm text-slate-950 uppercase">{invoice.business?.name}</p>
          <p className="text-slate-600">{invoice.business?.addressLine1}</p>
          {invoice.business?.addressLine2 && <p className="text-slate-600">{invoice.business.addressLine2}</p>}
          <p className="text-slate-600">{invoice.business?.city}, {invoice.business?.state} - {invoice.business?.postalCode}</p>
          <div className="pt-1.5 space-y-0.5">
            <p className="font-bold text-slate-900 font-mono">GSTIN / UIN: {invoice.business?.taxId || 'Not Specified'}</p>
            <p className="text-slate-700">State: <span className="font-medium">{invoice.business?.state}</span> (Code: <span className="font-mono">{invoice.business?.stateCode || '06'}</span>)</p>
            <p className="text-slate-600">Email: {invoice.business?.email} | Mob: {invoice.business?.phone}</p>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="p-3 divide-y divide-slate-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Invoice No:</span>
              <span className="font-bold font-mono text-xs text-slate-950">{invoice.number}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Dated:</span>
              <span className="font-bold text-xs text-slate-950">{formatDate(invoice.issueDate)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Due Date:</span>
              <span className="font-medium text-xs text-slate-800">{formatDate(invoice.dueDate)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Place of Supply:</span>
              <span className="font-bold text-xs text-slate-900">{invoice.placeOfSupply || invoice.client?.state || 'Haryana (06)'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Buyer PO / Ref:</span>
              <span className="font-mono text-slate-800">{invoice.poNumber || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Reverse Charge:</span>
              <span className="font-bold text-slate-800">{invoice.reverseCharge ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Details */}
      <div className="border border-slate-900 p-3 mb-4 bg-slate-50/50">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Details of Receiver / Billed To:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-sm text-slate-950">{invoice.client?.companyName || invoice.client?.name}</p>
            {invoice.client?.companyName && <p className="text-slate-600">Attn: {invoice.client.name}</p>}
            <p className="text-slate-600">{invoice.client?.addressLine1}</p>
            <p className="text-slate-600">{invoice.client?.city}, {invoice.client?.state} - {invoice.client?.postalCode}</p>
          </div>
          <div className="space-y-0.5 sm:text-right">
            <p className="font-bold font-mono text-slate-950">GSTIN / Unique ID: {invoice.client?.taxId || 'Unregistered'}</p>
            <p className="text-slate-700">State: <span className="font-medium">{invoice.client?.state}</span> (Code: <span className="font-mono">{invoice.client?.stateCode || '06'}</span>)</p>
            <p className="text-slate-600">Email: {invoice.client?.email}</p>
          </div>
        </div>
      </div>

      {/* GST Line Items Table */}
      <div className="overflow-x-auto mb-4 border border-slate-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-900 text-[9px] font-bold uppercase tracking-wider text-slate-900 text-center">
              <th className="py-2 px-1 border-r border-slate-900 w-8">#</th>
              <th className="py-2 px-2 border-r border-slate-900 text-left">Description of Goods / Services</th>
              <th className="py-2 px-1 border-r border-slate-900 w-16">HSN/SAC</th>
              <th className="py-2 px-1 border-r border-slate-900 w-10">Qty</th>
              <th className="py-2 px-1 border-r border-slate-900 w-14 text-right">Rate</th>
              <th className="py-2 px-1 border-r border-slate-900 w-12 text-right">Disc</th>
              <th className="py-2 px-1 border-r border-slate-900 w-16 text-right">Taxable</th>
              {!isIGST ? (
                <>
                  <th className="py-2 px-1 border-r border-slate-900 w-14 text-right">CGST</th>
                  <th className="py-2 px-1 border-r border-slate-900 w-14 text-right">SGST</th>
                </>
              ) : (
                <th className="py-2 px-1 border-r border-slate-900 w-16 text-right">IGST</th>
              )}
              <th className="py-2 px-2 text-right w-20">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-[10px]">
            {invoice.items.map((item, idx) => {
              const halfTax = Math.round((item.lineTax / 2) * 100) / 100;
              return (
                <tr key={item.id || idx}>
                  <td className="py-2 px-1 text-center border-r border-slate-300 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2 border-r border-slate-300">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {item.description && (
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">{item.description}</p>
                    )}
                  </td>
                  <td className="py-2 px-1 text-center border-r border-slate-300 font-mono text-slate-600">{item.hsnSacCode || '998314'}</td>
                  <td className="py-2 px-1 text-center border-r border-slate-300 font-mono">{item.quantity}</td>
                  <td className="py-2 px-1 text-right border-r border-slate-300 font-mono">{formatMoney(item.unitPrice, currency)}</td>
                  <td className="py-2 px-1 text-right border-r border-slate-300 font-mono text-slate-500">
                    {item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatMoney(item.discount, currency)) : '—'}
                  </td>
                  <td className="py-2 px-1 text-right border-r border-slate-300 font-mono font-medium">{formatMoney(item.taxableAmount, currency)}</td>
                  {!isIGST ? (
                    <>
                      <td className="py-2 px-1 text-right border-r border-slate-300 font-mono text-[9px]">
                        <div>{formatMoney(halfTax, currency)}</div>
                        <div className="text-[8px] text-slate-400 font-sans">({item.taxRate / 2}%)</div>
                      </td>
                      <td className="py-2 px-1 text-right border-r border-slate-300 font-mono text-[9px]">
                        <div>{formatMoney(halfTax, currency)}</div>
                        <div className="text-[8px] text-slate-400 font-sans">({item.taxRate / 2}%)</div>
                      </td>
                    </>
                  ) : (
                    <td className="py-2 px-1 text-right border-r border-slate-300 font-mono text-[9px]">
                      <div>{formatMoney(item.lineTax, currency)}</div>
                      <div className="text-[8px] text-slate-400 font-sans">({item.taxRate}%)</div>
                    </td>
                  )}
                  <td className="py-2 px-2 text-right font-mono font-bold text-slate-950">{formatMoney(item.lineTotal, currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Amount in words & Totals Box */}
      <div className="border border-slate-900 mb-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 grid grid-cols-1 sm:grid-cols-2">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Total Amount in Words:</p>
            <p className="font-bold text-slate-900 italic text-[11px] leading-tight">
              {numberToWords(invoice.grandTotal, currency)}
            </p>
          </div>

          {vis.showBankDetails && invoice.bankDetails?.bankName && (
            <div className="pt-2 border-t border-slate-200 text-[10px] space-y-0.5">
              <p className="font-bold uppercase text-slate-700">Bank Account Details for Remittance:</p>
              <p>Bank: <span className="font-medium text-slate-900">{invoice.bankDetails.bankName}</span></p>
              <p>Current A/c: <span className="font-mono font-bold text-slate-900">{invoice.bankDetails.accountNumber}</span></p>
              <p>IFSC Code: <span className="font-mono font-bold text-slate-900">{invoice.bankDetails.routingNumber || 'HDFC0001234'}</span></p>
              {invoice.bankDetails.upiId && <p>UPI ID: <span className="font-mono text-indigo-700">{invoice.bankDetails.upiId}</span></p>}
            </div>
          )}
        </div>

        <div className="p-3 space-y-1.5 text-right font-mono">
          <div className="flex justify-between text-slate-600">
            <span className="font-sans">Total Taxable Value:</span>
            <span>{formatMoney(invoice.taxableAmount, currency)}</span>
          </div>

          {invoice.taxes?.map((tax, i) => (
            <div key={i} className="flex justify-between text-slate-700 font-semibold">
              <span className="font-sans">{tax.name}:</span>
              <span>+{formatMoney(tax.amount, currency)}</span>
            </div>
          ))}

          {invoice.withholdingAmount > 0 && (
            <div className="flex justify-between text-rose-700 font-semibold">
              <span className="font-sans">Less TDS (u/s 194J - {invoice.withholdingTaxRate}%):</span>
              <span>−{formatMoney(invoice.withholdingAmount, currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-950 font-black text-sm pt-2 border-t border-slate-900">
            <span className="font-sans uppercase">Invoice Total (INR):</span>
            <span>{formatMoney(invoice.grandTotal, currency)}</span>
          </div>

          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span className="font-sans">Advance Received:</span>
                <span>−{formatMoney(invoice.amountPaid, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-900 text-xs">
                <span className="font-sans">Balance Payable:</span>
                <span>{formatMoney(invoice.balanceDue, currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Declaration & Signature */}
      <div className="border border-slate-900 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-900">
        <div className="p-3 text-[10px] text-slate-500 space-y-1">
          <p className="font-bold uppercase text-slate-700">Declaration:</p>
          <p className="leading-tight">
            We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
          </p>
          {invoice.terms && (
            <p className="text-slate-400 pt-1 leading-tight">{invoice.terms}</p>
          )}
        </div>

        <div className="p-3 text-right flex flex-col justify-between h-28">
          <p className="text-[10px] font-bold text-slate-800">For {invoice.business?.name || 'Company Name'}</p>
          <div>
            <p className="font-bold text-xs text-slate-950">{invoice.authorizedSignatoryName || 'Alex Rivera'}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
