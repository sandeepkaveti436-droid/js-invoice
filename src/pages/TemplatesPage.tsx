import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  Type, 
  Sliders, 
  CheckCircle2,
  ArrowRight,
  Download,
  Building2,
  User,
  CreditCard,
  FileText,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TemplateCustomization, Invoice, InvoiceItem } from '../types';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { exportInvoiceToPdf, PaperSize } from '../utils/pdfExport';
import { CURRENCIES, formatMoney } from '../utils/currency';

interface TemplateCardMeta {
  id: TemplateCustomization['templateId'];
  name: string;
  badge: string;
  description: string;
  tag: string;
  defaultAccent: string;
  headerType: 'card3' | 'dark' | 'gradient' | 'minimal' | 'corporate' | 'gst';
}

export const TemplatesPage: React.FC = () => {
  const { currentUser, settings, updateSettings, openCreateInvoice, showToast } = useApp();

  // Active Template & Styling
  const [activeTemplate, setActiveTemplate] = useState<TemplateCustomization['templateId']>(
    settings.invoiceDefaults.defaultTemplate || 'modern'
  );
  const [accentColor, setAccentColor] = useState(settings.invoiceDefaults.accentColor || '#EAA000');
  const [fontFamily, setFontFamily] = useState<TemplateCustomization['fontFamily']>(settings.appearance.fontFamily || 'Inter');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');

  // Real-time Editable Content State with clean user defaults
  const [brandName, setBrandName] = useState(settings.business.name || currentUser?.name || 'Acme Digital Systems');
  const [tagline, setTagline] = useState(settings.invoiceDefaults.defaultNotes || 'Scalable engineering & commercial advisory services.');
  const [brandEmail, setBrandEmail] = useState(settings.business.email || currentUser?.email || 'billing@acme.com');
  const [brandPhone, setBrandPhone] = useState(settings.business.phone || '+91 9876543210');
  const [brandWebsite, setBrandWebsite] = useState(settings.business.website || 'www.acmedigital.com');
  const [brandAddress, setBrandAddress] = useState(settings.business.addressLine1 || 'Tech Boulevard, Cyber City');
  const [brandState, setBrandState] = useState(settings.business.state || 'Telangana - 500081');

  const [clientName, setClientName] = useState('Nexus Innovations Ltd');
  const [clientPhone, setClientPhone] = useState('+91 9123456780');
  const [clientLocation, setClientLocation] = useState('Bangalore, Karnataka');

  const [itemName, setItemName] = useState('Cloud Infrastructure & Web Architecture');
  const [itemPrice, setItemPrice] = useState(45000);
  const [itemQty, setItemQty] = useState(1);
  const [currency, setCurrency] = useState(settings.invoiceDefaults.defaultCurrency || 'INR');

  const [accountHolder, setAccountHolder] = useState(settings.business.bankDetails?.accountHolder || currentUser?.name || 'ACME GLOBAL');
  const [bankName, setBankName] = useState(settings.business.bankDetails?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(settings.business.bankDetails?.accountNumber || '50200012345678');
  const [ifscCode, setIfscCode] = useState(settings.business.bankDetails?.routingNumber || 'HDFC0001234');

  const [terms, setTerms] = useState(
    settings.invoiceDefaults.defaultTerms ||
    'Payment due on receipt. Please remit payment via bank transfer quoting the invoice number.'
  );

  // Field Visibility Toggles
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'content'>('style');

  // Curated Luxury Color Swatches
  const COLOR_PALETTES = [
    { label: 'Amber Gold', hex: '#EAA000' },
    { label: 'Electric Indigo', hex: '#4F46E5' },
    { label: 'Executive Slate', hex: '#0F172A' },
    { label: 'Emerald Mint', hex: '#059669' },
    { label: 'Royal Sapphire', hex: '#2563EB' },
    { label: 'Crimson Rose', hex: '#E11D48' },
  ];

  const templatesList: TemplateCardMeta[] = [
    {
      id: 'modern',
      name: 'Sky Nova Modern',
      badge: 'Featured',
      description: 'Futuristic geometric brand emblem, 3-card Bill To / Bill From / Amount Due grid, rounded table pills, and framed bank badge.',
      tag: 'SaaS & Digital Tech',
      defaultAccent: '#EAA000',
      headerType: 'card3',
    },
    {
      id: 'executive',
      name: 'Executive Slate',
      badge: 'Enterprise',
      description: 'Ultra-clean two-column executive header, structured dark borders, itemized line totals, and verified bank credentials block.',
      tag: 'Enterprises & Advisory',
      defaultAccent: '#0F172A',
      headerType: 'dark',
    },
    {
      id: 'creative',
      name: 'Creative Studio',
      badge: 'Agency',
      description: 'Modern gradient accent stripe, asymmetric typography, bold numeric highlights, and full-bleed payment summary card.',
      tag: 'Design & Media Studios',
      defaultAccent: '#6366F1',
      headerType: 'gradient',
    },
    {
      id: 'minimal',
      name: 'Minimalist Pure',
      badge: 'Clean',
      description: 'Scandinavian clean layout with hairline dividers, generous white space, and pure monochrome typography.',
      tag: 'Architects & Consultants',
      defaultAccent: '#1E293B',
      headerType: 'minimal',
    },
    {
      id: 'corporate',
      name: 'Corporate Classic',
      badge: 'B2B',
      description: 'Formal corporate ledger header with structured grid lines, formal remittance notes, and dual-column party layout.',
      tag: 'B2B & Legal Firms',
      defaultAccent: '#1E3A8A',
      headerType: 'corporate',
    },
    {
      id: 'gst',
      name: 'GST Tax Invoice',
      badge: 'Statutory',
      description: 'India GST statutory compliant layout with HSN/SAC codes, CGST, SGST, IGST columns, state codes, and amount in words.',
      tag: 'India GST Billing',
      defaultAccent: '#059669',
      headerType: 'gst',
    },
  ];

  const totalCalculated = Number(itemPrice) * Number(itemQty);

  // Live Customizable Invoice Document
  const customizableInvoice: Invoice = {
    id: 'tpl_preview',
    number: 'INV-2026-001',
    prefix: 'N°: ',
    title: 'Tax Invoice',
    issueDate: '2026-10-26',
    dueDate: '2026-11-25',
    currency: currency,
    business: {
      ...settings.business,
      name: brandName,
      email: brandEmail,
      phone: brandPhone,
      website: brandWebsite,
      addressLine1: brandAddress,
      state: brandState,
      bankDetails: {
        accountHolder,
        bankName,
        accountNumber,
        routingNumber: ifscCode,
        additionalInfo: 'Please mention invoice reference during payment.',
      },
    },
    client: {
      id: 'cli_tpl',
      name: clientName,
      companyName: clientName,
      email: 'finance@nexusinnovations.com',
      phone: clientPhone,
      addressLine1: clientLocation,
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      createdAt: '2026-10-01T08:00:00Z',
    },
    items: [
      {
        id: 'it_1',
        name: itemName,
        description: tagline,
        quantity: Number(itemQty) || 1,
        unit: 'qty',
        unitPrice: Number(itemPrice) || 0,
        discount: 0,
        discountType: 'percentage',
        taxRate: 0,
        lineSubtotal: totalCalculated,
        lineDiscount: 0,
        taxableAmount: totalCalculated,
        lineTax: 0,
        lineTotal: totalCalculated,
      },
    ],
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    notes: tagline,
    terms: terms,
    paymentTerms: 'Due on Receipt',
    paymentInstructions: 'Direct bank transfer to listed coordinates.',
    bankDetails: {
      accountHolder,
      bankName,
      accountNumber,
      routingNumber: ifscCode,
    },
    signatureType: 'text',
    authorizedSignatoryName: accountHolder,
    footerText: tagline,
    subtotal: totalCalculated,
    lineDiscountTotal: 0,
    invoiceDiscountAmount: 0,
    totalDiscount: 0,
    taxableAmount: totalCalculated,
    taxes: [],
    totalTax: 0,
    shippingAmount: 0,
    withholdingAmount: 0,
    grandTotal: totalCalculated,
    amountPaid: 0,
    balanceDue: totalCalculated,
    status: 'draft',
    templateConfig: {
      templateId: activeTemplate,
      accentColor,
      fontFamily,
      logoPlacement: 'left',
      tableStyle: 'striped',
      headerLayout: 'split',
      showQrCode: true,
      paperSize,
    },
    visibility: {
      showLogo: true,
      showBusinessAddress: true,
      showTaxId: true,
      showPoNumber: true,
      showItemDiscount: true,
      showItemTax: true,
      showItemHsn: false,
      showItemDescription: true,
      showBankDetails: showBankDetails,
      showNotes: true,
      showTerms: showTerms,
      showSignature: true,
      showShipping: false,
      showWithholding: false,
      showPaymentInstructions: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleApplyAsDefault = () => {
    updateSettings({
      ...settings,
      invoiceDefaults: {
        ...settings.invoiceDefaults,
        defaultTemplate: activeTemplate,
        accentColor,
        defaultCurrency: currency,
        defaultNotes: tagline,
        defaultTerms: terms,
      },
      appearance: {
        ...settings.appearance,
        fontFamily,
        accentColor,
      },
      business: {
        ...settings.business,
        name: brandName,
        email: brandEmail,
        phone: brandPhone,
        website: brandWebsite,
        addressLine1: brandAddress,
        state: brandState,
        bankDetails: {
          accountHolder,
          bankName,
          accountNumber,
          routingNumber: ifscCode,
        },
      },
    });
    showToast(`Template "${activeTemplate}" & ${paperSize.toUpperCase()} format saved as default!`, 'success');
  };

  const handleCreateWithTemplate = () => {
    handleApplyAsDefault();
    openCreateInvoice();
  };

  const handleDownloadPreviewPdf = async () => {
    setIsExporting(true);
    try {
      await exportInvoiceToPdf('invoice-document', {
        filename: `JS_Invoice_${activeTemplate}_${paperSize.toUpperCase()}.pdf`,
        paperSize: paperSize,
      });
      showToast(`Clean single-page ${paperSize.toUpperCase()} PDF generated successfully!`, 'success');
    } catch {
      showToast('Could not generate PDF. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* ======================================================== */}
      {/* 1. HERO HEADER WITH PAPER SIZE & PRIMARY ACTIONS         */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Commercial Template Studio
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Single-Page Optimized
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Invoice Template Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Handcrafted executive commercial layouts. Fits perfectly on 1 page (A4, A3, or Letter) with natural multi-page flow.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Paper Size Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['a4', 'a3', 'letter'] as PaperSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPaperSize(size);
                  showToast(`Paper size set to ${size.toUpperCase()}`, 'info');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all uppercase ${
                  paperSize === size
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            onClick={handleApplyAsDefault}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Set Default</span>
          </button>

          <button
            onClick={handleDownloadPreviewPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{isExporting ? 'Generating...' : `Export ${paperSize.toUpperCase()}`}</span>
          </button>

          <button
            onClick={handleCreateWithTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Create Invoice with This</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. VISUAL TEMPLATE SHOWCASE CARDS (WITH REALISTIC MOCKS) */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Template Model ({templatesList.length} Handcrafted Styles)
          </span>
          <span className="text-xs text-slate-400">
            Click any model to load live interactive preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templatesList.map(tpl => {
            const isSelected = activeTemplate === tpl.id;

            return (
              <div
                key={tpl.id}
                onClick={() => {
                  setActiveTemplate(tpl.id);
                  setAccentColor(tpl.defaultAccent);
                }}
                className={`group relative bg-white rounded-3xl p-4 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/5 -translate-y-1'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* Visual Mini Document Layout Preview */}
                <div className="w-full h-44 rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col justify-between overflow-hidden relative group-hover:scale-[1.01] transition-transform">
                  
                  {/* Top Bar Representation */}
                  {tpl.headerType === 'dark' ? (
                    <div className="h-6 w-full rounded-md bg-slate-900 flex items-center justify-between px-2 text-[9px] text-white">
                      <span className="font-bold">EXECUTIVE</span>
                      <span className="font-mono">INV-001</span>
                    </div>
                  ) : tpl.headerType === 'gradient' ? (
                    <div className="h-2 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${tpl.defaultAccent}, #EC4899, #F59E0B)` }} />
                  ) : tpl.headerType === 'card3' ? (
                    <div className="grid grid-cols-3 gap-1 w-full">
                      <div className="h-4 rounded bg-slate-200/80" />
                      <div className="h-4 rounded bg-slate-200/80" />
                      <div className="h-4 rounded" style={{ backgroundColor: tpl.defaultAccent }} />
                    </div>
                  ) : tpl.headerType === 'gst' ? (
                    <div className="h-6 w-full rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between px-2 text-[9px] text-emerald-800 font-bold">
                      <span>TAX INVOICE (GST)</span>
                      <span>₹45,000</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <div className="w-12 h-3 rounded bg-slate-300" />
                      <div className="w-8 h-3 rounded" style={{ backgroundColor: tpl.defaultAccent }} />
                    </div>
                  )}

                  {/* Body Mock Rows */}
                  <div className="space-y-1.5 my-2">
                    <div className="flex gap-2">
                      <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                      <div className="h-2.5 w-1/4 rounded bg-slate-100" />
                    </div>
                    <div className="h-1.5 w-full rounded bg-slate-100" />
                    <div className="h-1.5 w-5/6 rounded bg-slate-100" />
                    
                    {/* Mock Table */}
                    <div className="pt-1 space-y-1">
                      <div className="h-2 w-full rounded bg-slate-200/70" />
                      <div className="h-1.5 w-full rounded bg-slate-100" />
                      <div className="h-1.5 w-full rounded bg-slate-100" />
                    </div>
                  </div>

                  {/* Bottom Total Pill */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <div className="h-2 w-16 rounded bg-slate-200" />
                    <div 
                      className="px-2 py-0.5 rounded text-[9px] font-mono font-bold text-white"
                      style={{ backgroundColor: tpl.defaultAccent }}
                    >
                      ₹45,000
                    </div>
                  </div>

                  {/* Selection Checkmark Floating Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Card Meta Content */}
                <div className="pt-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tpl.defaultAccent }}
                      />
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{tpl.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tpl.badge}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-semibold text-slate-400">{tpl.tag}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-600' : 'text-slate-600 group-hover:text-slate-900'}`}>
                      {isSelected ? 'Loaded in Preview' : 'Click to Preview'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DOCK CONTROLS: COLOR SWATCHES & VISIBILITY TOGGLES   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Live Styling & Formatting Controls:
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'style' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎨 Style & Palettes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✏️ Live Content Editor
            </button>
          </div>
        </div>

        {/* Tab 1: Style Controls */}
        {activeTab === 'style' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs animate-in fade-in">
            {/* Color Swatches */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Primary Accent Color</label>
              <div className="flex items-center gap-2">
                {COLOR_PALETTES.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center text-white ${
                      accentColor === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 shadow-sm' : 'hover:scale-105'
                    }`}
                    title={c.label}
                  >
                    {accentColor === c.hex && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hex Code */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Custom Hex Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Typography Font */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Typography Font</label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Agency Geometric)</option>
                <option value="Playfair Display">Playfair Display (Luxury Editorial)</option>
                <option value="JetBrains Mono">JetBrains Mono (Technical Ledger)</option>
              </select>
            </div>

            {/* Visibility Toggles */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Document Sections</label>
              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBankDetails}
                    onChange={e => setShowBankDetails(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Show Bank & Wire Instructions</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTerms}
                    onChange={e => setShowTerms(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Show Terms & Conditions</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Content Editor */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Business Name</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Tagline / Notes</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sample Line Item</label>
              <input
                type="text"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME HIGH-FIDELITY DOCUMENT PREVIEW CONTAINER    */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Document View: {paperSize.toUpperCase()} Format
            </span>
            <span className="text-[11px] text-slate-400">
              (Exactly as it will export to PDF & Print)
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadPreviewPdf}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {paperSize.toUpperCase()} PDF</span>
          </button>
        </div>

        {/* Paper Container Mock on luxury desk shadow */}
        <div className="p-4 sm:p-8 bg-slate-100/70 rounded-3xl border border-slate-200 flex justify-center items-center overflow-x-auto shadow-inner">
          <div className="w-full max-w-[850px] shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-200/90">
            <TemplateRenderer
              invoice={customizableInvoice}
              customization={{
                templateId: activeTemplate,
                accentColor,
                fontFamily,
                paperSize,
              }}
              visibility={{
                showBankDetails,
                showTerms,
              }}
              showWatermark={false}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
