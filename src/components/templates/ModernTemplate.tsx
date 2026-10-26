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

  const defaultTagline = 'We build software systems that grow with your business.';
  const defaultTerms =
    'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.';

  return (
    <div 
      className="p-8 sm:p-12 text-[#1E293B] bg-white min-h-[1050px] flex flex-col justify-between font-sans selection:bg-amber-100"
      style={{ fontFamily: customization?.fontFamily || invoice.templateConfig?.fontFamily || 'Inter, -apple-system, sans-serif' }}
    >
      <div>
        {/* ======================================================== */}
        {/* TOP HEADER: Logo / Brand & Invoice Meta                  */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6">
          {/* Top Left: Logo & Tagline */}
          <div>
            {vis.showLogo && invoice.business?.logoUrl ? (
              <img 
                src={invoice.business.logoUrl} 
                alt={invoice.business.name} 
                className="h-12 max-w-[200px] object-contain mb-2" 
              />
            ) : (
              <div className="flex items-center gap-2 mb-1.5">
                {/* Styled Futuristic Vector Logo Emblem (matching SND in reference) */}
                <div className="flex items-center gap-1 font-mono font-black text-3xl sm:text-4xl tracking-tighter" style={{ color: accentColor }}>
                  <svg className="h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 40 40" fill="none">
                    <rect x="2" y="2" width="36" height="36" rx="10" stroke={accentColor} strokeWidth="3" />
                    <path d="M11 20h18M20 11v18M13 13l14 14" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>{invoice.business?.name ? invoice.business.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() : 'SND'}</span>
                </div>
              </div>
            )}

            <p className="text-xs sm:text-sm italic text-slate-700 font-medium tracking-tight">
              {defaultTagline}
            </p>
          </div>

          {/* Top Right: Invoice Number & Issue Date */}
          <div className="text-left sm:text-right space-y-1.5 shrink-0">
            <div>
              <span className="text-xs text-slate-400 block font-normal">Invoice number:</span>
              <p className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                N°: {invoice.number || '000140'}
              </p>
            </div>

            <div className="pt-1">
              <span className="text-xs text-slate-400 block font-normal">Issued:</span>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {formatDate(invoice.issueDate) || 'September 13, 2026'}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3 SUMMARY CARDS: BILL TO, BILL FROM, & AMOUNT DUE        */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[26px] p-4 sm:p-5 border border-slate-100 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] my-4 sm:my-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CARD 1: BILL TO */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div 
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  BILL TO:
                </span>
              </div>

              <div className="bg-[#F3F6FA] rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {invoice.client?.companyName || invoice.client?.name || 'Food Link F&B Holdings LTD'}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Contact : {invoice.client?.phone || '+91-XXXXXXXXXX'}
                  </p>
                </div>

                <div>
                  <div className="border-b border-dashed border-slate-300 my-2.5" />
                  <p className="text-xs text-slate-500">
                    Location : {invoice.client?.city || invoice.client?.addressLine1 || 'Hyderabad'}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: BILL FROM */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div 
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  BILL FROM:
                </span>
              </div>

              <div className="bg-[#F3F6FA] rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {invoice.business?.name || 'Sky Nova Digitals'}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Contact : {invoice.business?.phone || '+91- 9392525043'}
                  </p>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5 mt-2">
                  <p>{invoice.business?.addressLine1 || 'Beeramguda, Hyderabad'}</p>
                  <p>
                    {invoice.business?.state || 'Telangana'} - {invoice.business?.postalCode || '502032'}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3: AMOUNT DUE (Standout Vibrant Amber Card) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div 
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  AMOUNT DUE
                </span>
              </div>

              <div 
                className="rounded-2xl p-5 sm:p-6 text-white shadow-xl flex-1 flex flex-col justify-between transition-all"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 14px 30px -6px ${accentColor}50` 
                }}
              >
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-white/90 block">
                    {currency || 'INR'}
                  </span>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                    {formatMoney(invoice.balanceDue ?? invoice.grandTotal, currency)}
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-xs sm:text-sm font-medium text-white/90">
                    {formatDate(invoice.dueDate) || 'August 13 2026'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* LINE ITEMS TABLE                                         */}
        {/* ======================================================== */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] my-4 sm:my-6">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-3 px-3">
            <div className="col-span-6 sm:col-span-7">DESCRIPTION</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-right">PRICE</div>
            <div className="col-span-2 sm:col-span-1 text-right">TOTAL</div>
          </div>

          {/* Item Rows */}
          <div className="space-y-2">
            {invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="grid grid-cols-12 gap-3 items-center bg-[#F8FAFC] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm transition-colors hover:bg-slate-100/70"
                >
                  <div className="col-span-6 sm:col-span-7 pr-2">
                    <p className="font-bold text-slate-900">{item.name || 'Untitled Item'}</p>
                    {vis.showItemDescription && item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
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
              /* Fallback single row matching screenshot if empty */
              <div className="grid grid-cols-12 gap-3 items-center bg-[#F8FAFC] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm">
                <div className="col-span-6 sm:col-span-7 font-bold text-slate-900">
                  13th Lunch Design
                </div>
                <div className="col-span-2 text-center font-medium text-slate-700">
                  1
                </div>
                <div className="col-span-2 text-right font-medium text-slate-700">
                  {formatMoney(2500, currency)}
                </div>
                <div className="col-span-2 sm:col-span-1 text-right font-bold text-slate-900">
                  {formatMoney(2500, currency)}
                </div>
              </div>
            )}
          </div>

          {/* Subtotals & Taxes breakdown (if applicable) */}
          {(invoice.totalDiscount > 0 || (invoice.taxes && invoice.taxes.length > 0) || (invoice.shippingFee && invoice.shippingFee > 0)) && (
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 max-w-xs ml-auto">
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
          <div className="pt-6 text-right pr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              TOTAL AMOUNT:
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {formatMoney(invoice.grandTotal || 2500, currency)}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TERMS & CONDITIONS + BANK DETAILS CARD                   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start my-6">
          
          {/* Left Column: Terms & Conditions */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 mb-1.5">
              Terms & Conditions:
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
              {invoice.terms || defaultTerms}
            </p>
          </div>

          {/* Right Column: Bank Details Card with Distinct Yellow Border */}
          <div 
            className="rounded-2xl p-5 bg-white shadow-sm transition-all"
            style={{ 
              border: `2px solid ${accentColor}80` 
            }}
          >
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">Name</span>
                <span className="col-span-7 font-bold text-slate-800 uppercase tracking-tight">
                  {invoice.bankDetails?.accountHolder || 'SANDEEP KAVETI'}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">Bank details</span>
                <span className="col-span-7 font-medium text-slate-800">
                  {invoice.bankDetails?.bankName || 'Yes Bank'}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">Account #</span>
                <span className="col-span-7 font-mono font-medium text-slate-800">
                  {invoice.bankDetails?.accountNumber || '018391600022849'}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 font-bold text-slate-700">IFS code</span>
                <span className="col-span-7 font-mono font-medium text-slate-800">
                  {invoice.bankDetails?.routingNumber || 'YESB0000183'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* DOCUMENT FOOTER WITH ABSTRACT BLUE RADIANT WAVE          */}
      {/* ======================================================== */}
      <div className="relative mt-8 rounded-2xl overflow-hidden border-t border-slate-100 p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-sky-100/50 to-blue-50/30">
        {/* Subtle luminous blue ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div>
            <h5 className="font-extrabold uppercase text-slate-900 tracking-wider">
              {invoice.business?.name || 'SKY NOVA DIGITALS'}
            </h5>
            <p className="text-[11px] italic text-slate-500 mt-0.5">
              {defaultTagline}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <p className="font-semibold text-slate-800">
              Website : <span className="text-slate-600 font-normal">{invoice.business?.website || 'skynovadigitals.vercel.app'}</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              {invoice.business?.email || 'skynovadigitals@gmail.com'} <span className="mx-1 text-slate-300">|</span> {invoice.business?.phone || '+91 - 93925 25043'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
