import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { User, Building2, Check } from 'lucide-react';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
}

export const ModernTemplate: React.FC<Props> = ({ invoice, customization, visibility }) => {
  const accentColor = customization?.accentColor || invoice.templateConfig?.accentColor || '#EAA000';
  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency;

  const tagline = invoice.notes || '';
  const displayInvoiceNumber = invoice.number 
    ? (invoice.number.startsWith('N°') ? invoice.number : `N°: ${invoice.number}`)
    : 'N°: 000140';

  return (
    <div 
      className="p-6 text-[#1E293B] bg-white max-w-[794px] mx-auto min-h-[980px] flex flex-col justify-between font-sans selection:bg-amber-100 box-border"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, -apple-system, sans-serif' }}
    >
      <div>
        {/* ======================================================== */}
        {/* TOP HEADER: Logo / Brand & Invoice Meta                  */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-slate-100/80">
          {/* Top Left: Logo & Tagline */}
          <div>
            {vis.showLogo && invoice.business?.logoUrl ? (
              <img 
                src={invoice.business.logoUrl} 
                alt={invoice.business.name || 'Brand Logo'} 
                className="h-10 max-w-[180px] object-contain mb-1.5 rounded-lg" 
              />
            ) : (
              <div className="flex items-center gap-2 mb-1">
                {/* Styled Futuristic Vector Logo Emblem */}
                <div className="flex items-center gap-1.5 font-mono font-black text-2xl tracking-tighter" style={{ color: accentColor }}>
                  <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none">
                    <rect x="2" y="2" width="36" height="36" rx="10" stroke={accentColor} strokeWidth="3" />
                    <path d="M11 20h18M20 11v18M13 13l14 14" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>
                    {invoice.business?.name 
                      ? invoice.business.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() 
                      : 'JS'}
                  </span>
                </div>
              </div>
            )}

            {tagline ? (
              <p className="text-xs italic text-slate-700 font-medium tracking-tight">
                {tagline}
              </p>
            ) : null}
          </div>

          {/* Top Right: Invoice Number & Issue Date */}
          <div className="text-left sm:text-right space-y-0.5 shrink-0">
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Invoice number:</span>
              <p className="text-sm font-bold text-slate-900 tracking-tight">
                {displayInvoiceNumber}
              </p>
            </div>

            <div className="pt-0.5">
              <span className="text-[11px] text-slate-400 block font-normal">Issued:</span>
              <p className="text-xs font-bold text-slate-900">
                {formatDate(invoice.issueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3 SUMMARY CARDS: BILL TO, BILL FROM, & AMOUNT DUE        */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] my-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* CARD 1: BILL TO */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] font-bold shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  BILL TO:
                </span>
              </div>

              <div className="bg-[#F3F6FA] rounded-xl p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <User className="w-2.5 h-2.5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {invoice.client?.companyName || invoice.client?.name || (
                        <span className="text-slate-400 font-normal italic">Client Name</span>
                      )}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Contact : {invoice.client?.phone || <span className="text-slate-400 italic">Not specified</span>}
                  </p>
                </div>

                <div>
                  <div className="border-b border-dashed border-slate-300 my-2" />
                  <p className="text-[11px] text-slate-500">
                    Location : {[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ') || invoice.client?.addressLine1 || <span className="text-slate-400 italic">Not specified</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: BILL FROM */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] font-bold shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  BILL FROM:
                </span>
              </div>

              <div className="bg-[#F3F6FA] rounded-xl p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {invoice.business?.name || (
                        <span className="text-slate-400 font-normal italic">Your Business Name</span>
                      )}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Contact : {invoice.business?.phone || <span className="text-slate-400 italic">Phone number</span>}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5 mt-1.5">
                  <p>{invoice.business?.addressLine1 || <span className="text-slate-400 italic">Street address</span>}</p>
                  <p>
                    {[invoice.business?.city, invoice.business?.state, invoice.business?.postalCode, invoice.business?.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3: AMOUNT DUE (Standout Vibrant Amber Card) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] font-bold shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  AMOUNT DUE
                </span>
              </div>

              <div 
                className="rounded-xl p-3 sm:p-3.5 text-white shadow-md flex-1 flex flex-col justify-between transition-all"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 8px 20px -4px ${accentColor}40` 
                }}
              >
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-white/90 block">
                    {currency || 'INR'}
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 text-white">
                    {formatMoney(invoice.balanceDue ?? invoice.grandTotal ?? 0, currency)}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] font-medium text-white/90">
                    {invoice.dueDate ? `Due: ${formatDate(invoice.dueDate)}` : 'Due on receipt'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* LINE ITEMS TABLE                                         */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] my-3">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 px-3">
            <div className="col-span-6 sm:col-span-7">DESCRIPTION</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-right">PRICE</div>
            <div className="col-span-2 sm:col-span-1 text-right">TOTAL</div>
          </div>

          {/* Item Rows */}
          <div className="space-y-1.5">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="grid grid-cols-12 gap-3 items-center bg-[#F8FAFC] rounded-xl p-2.5 sm:p-3 text-xs transition-colors hover:bg-slate-100/70"
                >
                  <div className="col-span-6 sm:col-span-7 pr-2">
                    <p className="font-bold text-slate-900">{item.name || <span className="text-slate-400 italic">Untitled Item</span>}</p>
                    {vis.showItemDescription && item.description ? (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="col-span-2 text-center font-medium text-slate-700">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-700">
                    {formatMoney(item.unitPrice, currency)}
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-right font-bold text-slate-900">
                    {formatMoney(item.lineTotal, currency)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs italic bg-[#F8FAFC] rounded-xl">
                No items added yet. Click "+ Add Line Item" to enter details.
              </div>
            )}
          </div>

          {/* Subtotals & Taxes breakdown (if applicable) */}
          {(invoice.totalDiscount > 0 || (invoice.taxes && invoice.taxes.length > 0) || (invoice.shippingFee && invoice.shippingFee > 0)) && (
            <div className="pt-2 mt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatMoney(invoice.subtotal, currency)}</span>
              </div>
              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>−{formatMoney(invoice.totalDiscount, currency)}</span>
                </div>
              )}
              {invoice.taxes?.map((tax, i) => (
                <div key={i} className="flex justify-between">
                  <span>{tax.name}:</span>
                  <span className="text-slate-800">+{formatMoney(tax.amount, currency)}</span>
                </div>
              ))}
              {invoice.shippingFee > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-slate-800">+{formatMoney(invoice.shippingFee, currency)}</span>
                </div>
              )}
            </div>
          )}

          {/* Table Footer: Total Amount */}
          <div className="pt-3 text-right pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              TOTAL AMOUNT:
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {formatMoney(invoice.grandTotal || 0, currency)}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TERMS & CONDITIONS + BANK DETAILS CARD                   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start my-3">
          
          {/* Left Column: Terms & Conditions */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-600 mb-1">
              Terms & Conditions:
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
              {invoice.terms || 'Payment is requested according to the agreed schedule. Please contact us for any billing inquiries.'}
            </p>
          </div>

          {/* Right Column: Bank Details Card with Distinct Yellow Border */}
          <div 
            className="rounded-xl p-3 bg-white shadow-sm transition-all"
            style={{ 
              border: `2px solid ${accentColor}80` 
            }}
          >
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">Name</span>
                <span className="col-span-7 font-bold text-slate-800 uppercase tracking-tight">
                  {invoice.bankDetails?.accountHolder || invoice.business?.name || '—'}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">Bank details</span>
                <span className="col-span-7 font-medium text-slate-800">
                  {invoice.bankDetails?.bankName || '—'}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">Account #</span>
                <span className="col-span-7 font-mono font-medium text-slate-800">
                  {invoice.bankDetails?.accountNumber || '—'}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">IFS code</span>
                <span className="col-span-7 font-mono font-medium text-slate-800">
                  {invoice.bankDetails?.routingNumber || '—'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* DOCUMENT FOOTER WITH ABSTRACT BLUE RADIANT WAVE          */}
      {/* ======================================================== */}
      <div className="relative mt-3 rounded-xl overflow-hidden border-t border-slate-100 p-3 bg-gradient-to-r from-blue-50/70 via-sky-100/50 to-blue-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div>
            <p className="font-extrabold text-slate-900 tracking-tight text-xs">
              Brand Name : <span className="font-bold text-slate-800">{invoice.business?.name || '—'}</span>
            </p>
            {tagline ? (
              <p className="text-[10.5px] italic text-slate-500 mt-0.5">
                Tag Line : <span className="italic">{tagline}</span>
              </p>
            ) : null}
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <p className="font-semibold text-slate-800 text-[11px]">
              Website : <span className="text-slate-600 font-normal">{invoice.business?.website || '—'}</span>
            </p>
            <p className="text-slate-500 text-[10.5px]">
              <span className="font-semibold text-slate-700">Mail ID:</span> {invoice.business?.email || '—'} <span className="mx-1 text-slate-300">|</span> <span className="font-semibold text-slate-700">Contact :</span> {invoice.business?.phone || '—'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
