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
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TemplateCustomization, Invoice, InvoiceItem } from '../types';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { exportInvoiceToPdf } from '../utils/pdfExport';
import { CURRENCIES, formatMoney } from '../utils/currency';

export const TemplatesPage: React.FC = () => {
  const { invoices, settings, updateSettings, openCreateInvoice, showToast } = useApp();

  // Active Template & Styling
  const [activeTemplate, setActiveTemplate] = useState<TemplateCustomization['templateId']>(
    settings.invoiceDefaults.defaultTemplate || 'modern'
  );
  const [accentColor, setAccentColor] = useState(settings.invoiceDefaults.accentColor || '#EAA000');
  const [fontFamily, setFontFamily] = useState<TemplateCustomization['fontFamily']>(settings.appearance.fontFamily || 'Inter');

  // Customizer Panel Tab: 'style' | 'brand' | 'client_item' | 'bank_terms'
  const [customizerTab, setCustomizerTab] = useState<'style' | 'brand' | 'client_item' | 'bank_terms'>('style');

  // Real-time Editable Content State
  const [brandName, setBrandName] = useState(settings.business.name || 'Sky Nova Digitals');
  const [tagline, setTagline] = useState(settings.invoiceDefaults.defaultNotes || 'We build software systems that grow with your business.');
  const [brandEmail, setBrandEmail] = useState(settings.business.email || 'skynovadigitals@gmail.com');
  const [brandPhone, setBrandPhone] = useState(settings.business.phone || '+91- 9392525043');
  const [brandWebsite, setBrandWebsite] = useState(settings.business.website || 'skynovadigitals.vercel.app');
  const [brandAddress, setBrandAddress] = useState(settings.business.addressLine1 || 'Beeramguda, Hyderabad');
  const [brandState, setBrandState] = useState(settings.business.state || 'Telangana - 502032');

  const [clientName, setClientName] = useState('Food Link F&B Holdings LTD');
  const [clientPhone, setClientPhone] = useState('+91-XXXXXXXXXX');
  const [clientLocation, setClientLocation] = useState('Hyderabad');

  const [itemName, setItemName] = useState('13th Lunch Design');
  const [itemPrice, setItemPrice] = useState(2500);
  const [itemQty, setItemQty] = useState(1);
  const [currency, setCurrency] = useState(settings.invoiceDefaults.defaultCurrency || 'INR');

  const [accountHolder, setAccountHolder] = useState(settings.business.bankDetails?.accountHolder || 'SANDEEP KAVETI');
  const [bankName, setBankName] = useState(settings.business.bankDetails?.bankName || 'Yes Bank');
  const [accountNumber, setAccountNumber] = useState(settings.business.bankDetails?.accountNumber || '018391600022849');
  const [ifscCode, setIfscCode] = useState(settings.business.bankDetails?.routingNumber || 'YESB0000183');

  const [terms, setTerms] = useState(
    settings.invoiceDefaults.defaultTerms ||
    'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.'
  );

  // Field Visibility Toggles
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showTerms, setShowTerms] = useState(true);

  const [isExporting, setIsExporting] = useState(false);

  const templatesList: {
    id: TemplateCustomization['templateId'];
    name: string;
    subtitle: string;
    description: string;
    tags: string[];
    defaultAccent: string;
  }[] = [
    {
      id: 'modern',
      name: 'Sky Nova Modern (Featured)',
      subtitle: 'Standout 3-Card Architecture',
      description: 'Futuristic geometric brand emblem, 3-card Bill To / Bill From / Amount Due grid, rounded table pills, and framed bank verification badge.',
      tags: ['Featured', 'SaaS', 'Modern Digital'],
      defaultAccent: '#EAA000',
    },
    {
      id: 'minimal',
      name: 'Minimal Professional',
      subtitle: 'Scandinavian Clean Simplicity',
      description: 'Ultra-clean layout emphasizing delicate hairline borders, generous whitespace, and pure typography.',
      tags: ['Minimalist', 'Monochrome', 'Architects'],
      defaultAccent: '#111827',
    },
    {
      id: 'freelancer',
      name: 'Elegant Freelancer',
      subtitle: 'Artisanal Warm Editorial Tones',
      description: 'Refined serif typography, framed client showcase cards, and warm copper/amber tones.',
      tags: ['Designers', 'Writers', 'Consultants'],
      defaultAccent: '#B45309',
    },
    {
      id: 'agency',
      name: 'Creative Agency',
      subtitle: 'Bold High-Impact Contrast',
      description: 'Striking dark header banner with vibrant accent badge and modern Plus Jakarta Sans typography.',
      tags: ['Studios', 'Media', 'Production'],
      defaultAccent: '#E11D48',
    },
    {
      id: 'corporate',
      name: 'Corporate Classic',
      subtitle: 'Executive Enterprise B2B',
      description: 'Traditional dual-column corporate header with structured grid lines, formal terms, and remittance instructions.',
      tags: ['B2B', 'Enterprises', 'Legal'],
      defaultAccent: '#1E3A8A',
    },
    {
      id: 'gst',
      name: 'GST Tax Invoice',
      subtitle: 'Statutory GST Compliance',
      description: 'India GST compliant tax invoice featuring HSN/SAC codes, CGST, SGST, IGST columns, and amount in words.',
      tags: ['India', 'GST', 'Tax Invoices'],
      defaultAccent: '#059669',
    },
  ];

  const totalCalculated = Number(itemPrice) * Number(itemQty);

  // Live Customizable Invoice Document
  const customizableInvoice: Invoice = {
    id: 'tpl_preview',
    number: '000140',
    prefix: 'N°: ',
    title: 'Tax Invoice',
    issueDate: '2026-09-13',
    dueDate: '2026-08-13',
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
      email: 'accounts@foodlink.com',
      phone: clientPhone,
      addressLine1: clientLocation,
      city: clientLocation,
      state: 'Telangana',
      postalCode: '500081',
      country: 'India',
      createdAt: '2026-09-01T08:00:00Z',
    },
    items: [
      {
        id: 'it_1',
        name: itemName,
        description: tagline,
        quantity: Number(itemQty) || 1,
        unit: 'pkg',
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
    showToast(`Template "${activeTemplate}" & your custom brand settings saved as default!`, 'success');
  };

  const handleCreateWithTemplate = () => {
    handleApplyAsDefault();
    openCreateInvoice();
  };

  const handleDownloadPreviewPdf = async () => {
    setIsExporting(true);
    try {
      await exportInvoiceToPdf('invoice-document', `Invoice_Template_${activeTemplate}.pdf`);
      showToast('Downloaded clean vector A4 PDF successfully!', 'success');
    } catch {
      showToast('Could not generate PDF. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Reusable Invoice Template Designer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize any template live. Edit your brand, items, bank details, and colors in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleApplyAsDefault}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Set as Default</span>
          </button>

          <button
            onClick={handleDownloadPreviewPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleCreateWithTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Create Invoice with this Template</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Template Cards Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesList.map(tpl => {
          const isSelected = activeTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              onClick={() => {
                setActiveTemplate(tpl.id);
                setAccentColor(tpl.defaultAccent);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: tpl.defaultAccent }} 
                    />
                    <h3 className="font-bold text-slate-900 text-sm">{tpl.name}</h3>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ✓ Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tpl.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tpl.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Click to Load</span>
                <span className={`font-semibold ${isSelected ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                  {isSelected ? 'Currently Loaded' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* REAL-TIME TEMPLATE CONTROLLER & CUSTOMIZER DRAWER        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Customizer Tabs Navigation */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50/80 gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Live Template Customizer:
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCustomizerTab('style')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                customizerTab === 'style' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎨 Style & Colors
            </button>
            <button
              onClick={() => setCustomizerTab('brand')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                customizerTab === 'brand' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Brand & Seller
            </button>
            <button
              onClick={() => setCustomizerTab('client_item')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                customizerTab === 'client_item' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 Client & Pricing
            </button>
            <button
              onClick={() => setCustomizerTab('bank_terms')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                customizerTab === 'bank_terms' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏦 Bank & Legal
            </button>
          </div>
        </div>

        {/* Tab 1: Style & Colors */}
        {customizerTab === 'style' && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white animate-in fade-in">
            {/* Accent Color Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Primary Accent Color:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {['#EAA000', '#4F46E5', '#059669', '#E11D48', '#1E3A8A', '#0F172A', '#EA580C', '#7C3AED'].map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110 relative shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {accentColor === color && <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hex Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Custom Hex:
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5" 
                />
                <input 
                  type="text" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg uppercase" 
                />
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Typography Font:
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
                <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                <option value="Space Grotesk">Space Grotesk (Tech & Startup)</option>
                <option value="Roboto">Roboto (Google Standard)</option>
              </select>
            </div>

            {/* Section Toggles */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Visibility Controls:
              </label>
              <div className="space-y-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showBankDetails} 
                    onChange={e => setShowBankDetails(e.target.checked)} 
                    className="rounded text-amber-500" 
                  />
                  <span>Show Bank Details Card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showTerms} 
                    onChange={e => setShowTerms(e.target.checked)} 
                    className="rounded text-amber-500" 
                  />
                  <span>Show Terms & Conditions</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Brand & Seller */}
        {customizerTab === 'brand' && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name:</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="e.g. Sky Nova Digitals"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline:</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="We build software systems that grow..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone:</label>
              <input
                type="text"
                value={brandPhone}
                onChange={e => setBrandPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="+91- 9392525043"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL:</label>
              <input
                type="text"
                value={brandWebsite}
                onChange={e => setBrandWebsite(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="skynovadigitals.vercel.app"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Client & Pricing */}
        {customizerTab === 'client_item' && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Name / Co.:</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="Food Link F&B Holdings LTD"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Location:</label>
              <input
                type="text"
                value={clientLocation}
                onChange={e => setClientLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="Hyderabad"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency Code:</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold bg-white"
              >
                {Object.values(CURRENCIES).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Line Item Title:</label>
              <input
                type="text"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="13th Lunch Design"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Price ({currency}):</label>
              <input
                type="number"
                value={itemPrice}
                onChange={e => setItemPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                placeholder="2500"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Bank Details & Legal Terms */}
        {customizerTab === 'bank_terms' && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder (Name):</label>
              <input
                type="text"
                value={accountHolder}
                onChange={e => setAccountHolder(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-bold"
                placeholder="SANDEEP KAVETI"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name:</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="Yes Bank"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Number:</label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                placeholder="018391600022849"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFS Code / Routing:</label>
              <input
                type="text"
                value={ifscCode}
                onChange={e => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase"
                placeholder="YESB0000183"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 mt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Conditions:</label>
              <textarea
                rows={2}
                value={terms}
                onChange={e => setTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl leading-relaxed"
                placeholder="Enter payment terms and conditions..."
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* LIVE A4 CANVAS PREVIEW                                   */}
      {/* ======================================================== */}
      <div className="bg-slate-100/70 p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-inner flex justify-center overflow-x-auto">
        <TemplateRenderer
          invoice={customizableInvoice}
          customization={{
            templateId: activeTemplate,
            accentColor,
            fontFamily,
          }}
          zoomScale={0.94}
          showWatermark={false}
        />
      </div>
    </div>
  );
};
