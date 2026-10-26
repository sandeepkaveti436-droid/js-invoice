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
  // Theme accent color: defaults to the signature vibrant golden-amber (#E5A000) of ModernTemplate
  const rawAccent = customization?.accentColor || invoice.templateConfig?.accentColor;
  const themeColor = (!rawAccent || rawAccent === '#ffffff' || rawAccent === '#fff' || rawAccent === 'transparent') 
    ? '#E5A000' 
    : rawAccent;

  const vis = { ...invoice.visibility, ...visibility };
  const currency = invoice.currency || 'INR';
  const tagline = invoice.notes || invoice.footerText || '';

  const displayInvoiceNumber = invoice.number 
    ? (invoice.number.startsWith('N°') ? invoice.number : `N°: ${invoice.number}`)
    : 'N°: 000140';

  // Initials for fallback vector emblem
  const brandInitials = invoice.business?.name 
    ? invoice.business.name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 3).toUpperCase()
    : 'SND';

  return (
    <div 
      className="px-8 pt-8 pb-0 text-[#1E293B] bg-white w-full max-w-[794px] mx-auto min-h-[1123px] flex-1 flex flex-col justify-between font-sans selection:bg-amber-100 box-border relative overflow-hidden"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, -apple-system, sans-serif' }}
    >
      <div className="flex-1 flex flex-col">
        {/* ======================================================== */}
        {/* TOP HEADER: Logo / Brand & Invoice Number + Date         */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
          {/* Top Left: Logo & Tagline */}
          <div>
            {vis.showLogo && invoice.business?.logoUrl ? (
              <img 
                src={invoice.business.logoUrl} 
                alt={invoice.business.name || 'Brand Logo'} 
                className="h-10 max-w-[200px] object-contain mb-1.5 rounded-lg" 
              />
            ) : (
              <div className="flex items-center gap-2 mb-1.5">
                {/* Futuristic Bold Geometric Emblem matching Reference SND Logo */}
                <div 
                  className="font-black text-3xl tracking-tighter flex items-center gap-2 font-mono"
                  style={{ color: themeColor }}
                >
                  <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none">
                    <rect x="2" y="2" width="36" height="36" rx="8" stroke={themeColor} strokeWidth="3" />
                    <path d="M12 20h16M20 12v16M14 14l12 12" stroke={themeColor} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className="tracking-widest font-black">{brandInitials}</span>
                </div>
              </div>
            )}

            {tagline ? (
              <p className="text-xs italic text-slate-700 font-medium tracking-tight mt-1 max-w-md">
                {tagline}
              </p>
            ) : null}
          </div>

          {/* Top Right: Invoice Number & Issue Date */}
          <div className="text-left sm:text-right space-y-1 shrink-0">
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
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] my-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* CARD 1: BILL TO */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <div 
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  BILL TO:
                </span>
              </div>

              <div className="bg-[#F4F7FB] rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {invoice.client?.companyName || invoice.client?.name || (
                        <span className="text-slate-400 font-normal italic">Client Name</span>
                      )}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Contact : <span className="text-slate-700">{invoice.client?.phone || <span className="text-slate-400 italic">Not specified</span>}</span>
                  </p>
                </div>

                <div>
                  <div className="border-b border-dashed border-slate-300 my-2.5" />
                  <p className="text-[11px] text-slate-500">
                    Location : <span className="text-slate-700">{[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ') || invoice.client?.addressLine1 || <span className="text-slate-400 italic">Not specified</span>}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: BILL FROM */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <div 
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  BILL FROM:
                </span>
              </div>

              <div className="bg-[#F4F7FB] rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-amber-100/90 text-amber-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-3 h-3 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {invoice.business?.name || (
                        <span className="text-slate-400 font-normal italic">Your Business Name</span>
                      )}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Contact : <span className="text-slate-700">{invoice.business?.phone || <span className="text-slate-400 italic">Phone number</span>}</span>
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5 mt-2">
                  <p>{invoice.business?.addressLine1 || <span className="text-slate-400 italic">Street address</span>}</p>
                  <p>
                    {[invoice.business?.city, invoice.business?.state, invoice.business?.postalCode, invoice.business?.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3: AMOUNT DUE (Signature Golden-Amber Card) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <div 
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  AMOUNT DUE
                </span>
              </div>

              <div 
                className="rounded-2xl p-4 text-white shadow-md flex-1 flex flex-col justify-between min-h-[140px]"
                style={{ 
                  backgroundColor: themeColor,
                  boxShadow: `0 8px 24px -4px ${themeColor}55` 
                }}
              >
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-white/95 block">
                    {currency || 'INR'}
                  </span>
                  <p className="text-2xl sm:text-[28px] font-black tracking-tight mt-1 text-white">
                    {formatMoney(invoice.balanceDue ?? invoice.grandTotal ?? 0, currency)}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-white/95">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : 'Due on receipt'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* LINE ITEMS TABLE                                         */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] my-3">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 px-3">
            <div className="col-span-6 sm:col-span-7">DESCRIPTION</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-right">PRICE</div>
            <div className="col-span-2 sm:col-span-1 text-right">TOTAL</div>
          </div>

          {/* Item Rows */}
          <div className="space-y-2">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="grid grid-cols-12 gap-3 items-center bg-[#F8FAFC] rounded-xl px-4 py-3 text-xs"
                >
                  <div className="col-span-6 sm:col-span-7 pr-2">
                    <p className="font-bold text-slate-900 text-sm">
                      {item.name || <span className="text-slate-400 italic">Untitled Item</span>}
                    </p>
                    {Boolean(vis.showItemDescription && item.description) && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-semibold text-slate-700">
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
          {Boolean((invoice.totalDiscount && invoice.totalDiscount > 0) || (invoice.taxes && invoice.taxes.length > 0) || (invoice.shippingFee && invoice.shippingFee > 0)) ? (
            <div className="pt-3 mt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatMoney(invoice.subtotal, currency)}</span>
              </div>
              {Boolean(invoice.totalDiscount && invoice.totalDiscount > 0) && (
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
              {Boolean(invoice.shippingFee && invoice.shippingFee > 0) && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-slate-800">+{formatMoney(invoice.shippingFee, currency)}</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Table Footer: Total Amount */}
          <div className="pt-4 text-right pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              TOTAL AMOUNT:
            </span>
            <p className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight mt-0.5">
              {formatMoney(invoice.grandTotal || 0, currency)}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TERMS & CONDITIONS + BANK DETAILS CARD                   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start my-3">
          
          {/* Left Column: Terms & Conditions */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-1.5">
              Terms & Conditions:
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
              {invoice.terms || 'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.'}
            </p>
          </div>

          {/* Right Column: Bank Details Card with Distinct Yellow Border */}
          <div 
            className="rounded-2xl p-4 bg-white shadow-sm transition-all"
            style={{ 
              border: `1.5px solid ${themeColor}` 
            }}
          >
            <div className="space-y-1.5 text-xs">
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
                <span className="col-span-7 font-mono font-medium text-slate-800 uppercase">
                  {invoice.bankDetails?.ifscCode || invoice.bankDetails?.routingNumber || '—'}
                </span>
              </div>

              {invoice.bankDetails?.upiId && (
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-5 font-bold text-slate-700">UPI / VPA</span>
                  <span className="col-span-7 font-mono font-medium text-slate-800">
                    {invoice.bankDetails.upiId}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* DOCUMENT FOOTER WITH RADIANT SOFT BLUE WAVE (FLUSH)       */}
      {/* ======================================================== */}
      <div className="relative mt-auto -mx-8 px-8 pt-6 pb-6 border-t border-slate-100/80 bg-gradient-to-r from-blue-50/90 via-sky-100/70 to-blue-50/50 overflow-hidden">
        {/* Soft radiant ambient glow reflections */}
        <div 
          className="absolute -right-8 -bottom-10 w-96 h-36 rounded-full pointer-events-none opacity-60 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(186,230,253,0.15) 70%, transparent 100%)' }}
        />
        <div 
          className="absolute -left-10 -top-10 w-80 h-32 rounded-full pointer-events-none opacity-40 blur-xl"
          style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.3) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div>
            <p className="font-extrabold text-slate-900 tracking-tight text-xs uppercase">
              Brand Name : <span className="font-bold text-slate-800 normal-case">{invoice.business?.name || '—'}</span>
            </p>
            {tagline ? (
              <p className="text-[11px] italic text-slate-500 mt-0.5">
                Tag Line : <span className="italic">{tagline}</span>
              </p>
            ) : null}
          </div>

          <div className="text-left sm:text-right space-y-1">
            <p className="font-bold text-slate-800 text-[11px]">
              Website : <span className="text-slate-600 font-normal">{invoice.business?.website || '—'}</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              <span className="font-bold text-slate-700">Mail ID :</span> {invoice.business?.email || '—'}{' '}
              <span className="mx-1 text-slate-300 font-normal">|</span>{' '}
              <span className="font-bold text-slate-700">Contact :</span> {invoice.business?.phone || '—'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
