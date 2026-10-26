import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  Type, 
  Layout, 
  Eye, 
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TemplateCustomization } from '../types';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';

export const TemplatesPage: React.FC = () => {
  const { invoices, settings, updateSettings, openCreateInvoice, showToast } = useApp();

  const [activeTemplate, setActiveTemplate] = useState<TemplateCustomization['templateId']>(
    settings.invoiceDefaults.defaultTemplate || 'modern'
  );

  const [accentColor, setAccentColor] = useState(settings.invoiceDefaults.accentColor || '#4F46E5');
  const [fontFamily, setFontFamily] = useState<TemplateCustomization['fontFamily']>(settings.appearance.fontFamily || 'Inter');

  // Sample invoice to live-preview each template
  const sampleInvoice = invoices[0] || {
    id: 'sample',
    number: 'INV-2026-PREVIEW',
    prefix: 'INV-2026-',
    title: 'Tax Invoice',
    issueDate: '2026-02-15',
    dueDate: '2026-03-15',
    currency: 'USD',
    business: settings.business,
    client: {
      id: 'cli_sample',
      name: 'Sarah Jenkins',
      companyName: 'Acme Cloud Technologies',
      email: 'sarah.jenkins@acmecloud.io',
      addressLine1: '789 Market Street, Floor 8',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'United States',
      taxId: 'US-EIN-45-9871234',
      createdAt: '2026-01-10T08:00:00Z',
    },
    items: [
      {
        id: 'it_1',
        name: 'UI/UX Design System & Prototyping',
        description: 'Complete dashboard Figma components and responsive React development.',
        quantity: 40,
        unit: 'hrs',
        unitPrice: 125,
        discount: 5,
        discountType: 'percentage',
        taxRate: 10,
        lineSubtotal: 5000,
        lineDiscount: 250,
        taxableAmount: 4750,
        lineTax: 475,
        lineTotal: 5225,
      },
    ],
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    notes: 'Thank you for your business.',
    terms: 'Payment is due within 30 days.',
    paymentInstructions: 'Direct bank transfer to listed coordinates.',
    bankDetails: settings.business.bankDetails,
    signatureType: 'text',
    authorizedSignatoryName: 'Alex Rivera',
    footerText: 'Generated electronically via JS Invoice.',
    subtotal: 5000,
    lineDiscountTotal: 250,
    invoiceDiscountAmount: 0,
    totalDiscount: 250,
    taxableAmount: 4750,
    taxes: [{ name: 'Sales Tax (10%)', rate: 10, amount: 475 }],
    totalTax: 475,
    shippingAmount: 0,
    withholdingAmount: 0,
    grandTotal: 5225,
    amountPaid: 0,
    balanceDue: 5225,
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
      showBankDetails: true,
      showNotes: true,
      showTerms: true,
      showSignature: true,
      showShipping: false,
      showWithholding: false,
      showPaymentInstructions: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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
      subtitle: 'Premium SaaS Card Architecture',
      description: 'Futuristic geometric brand header, 3-card Bill To / Bill From / Amount Due grid, rounded table rows, and framed bank verification badge.',
      tags: ['Featured', 'SaaS', 'Agencies'],
      defaultAccent: '#EAA000',
    },
    {
      id: 'minimal',
      name: 'Minimal Professional',
      subtitle: 'Scandinavian Simplicity',
      description: 'Ultra-clean layout emphasizing delicate hairline borders, generous whitespace, and pure typography.',
      tags: ['Minimalist', 'Monochrome', 'Architects'],
      defaultAccent: '#111827',
    },
    {
      id: 'freelancer',
      name: 'Elegant Freelancer',
      subtitle: 'Artisanal Warm Tones',
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
      defaultAccent: '#0F172A',
    },
    {
      id: 'gst',
      name: 'GST Tax Invoice',
      subtitle: 'Statutory GST Compliance',
      description: 'India GST compliant tax invoice featuring HSN/SAC codes, CGST, SGST, IGST columns, and amount in words.',
      tags: ['India', 'GST', 'Tax Invoices'],
      defaultAccent: '#1E40AF',
    },
  ];

  const handleApplyAsDefault = () => {
    updateSettings({
      ...settings,
      invoiceDefaults: {
        ...settings.invoiceDefaults,
        defaultTemplate: activeTemplate,
        accentColor,
      },
      appearance: {
        ...settings.appearance,
        fontFamily,
        accentColor,
      },
    });
    showToast(`Template "${activeTemplate}" saved as global default!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoice Template Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select and customize one of 6 original invoice designs. Switch anytime without data loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyAsDefault}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Set as Default</span>
          </button>

          <button
            onClick={() => openCreateInvoice()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <span>Create Invoice with this Template</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Template Selection Cards (Grid of 6) */}
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
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-card'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full" 
                      style={{ backgroundColor: tpl.defaultAccent }} 
                    />
                    <h3 className="font-bold text-sm text-slate-900">{tpl.name}</h3>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-600 mb-1">{tpl.subtitle}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tpl.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Click to Preview</span>
                <span className={`font-semibold ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>
                  {isSelected ? 'Currently Viewing' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Container of the Selected Template */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Live Preview: {templatesList.find(t => t.id === activeTemplate)?.name}
            </h3>
            <p className="text-xs text-slate-500">
              This exact styling will be exported to vector PDF and printed on paper.
            </p>
          </div>

          {/* Accent Color Swatches */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-semibold">Custom Accent:</span>
            <div className="flex items-center gap-1.5">
              {['#4F46E5', '#111827', '#E11D48', '#B45309', '#059669', '#2563EB', '#7C3AED'].map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: color }}
                >
                  {accentColor === color && <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-100/70 p-4 sm:p-8 rounded-2xl border border-slate-200/80 shadow-inner flex justify-center overflow-x-auto">
          <TemplateRenderer
            invoice={{
              ...sampleInvoice,
              templateConfig: {
                ...sampleInvoice.templateConfig,
                templateId: activeTemplate,
                accentColor,
                fontFamily,
              },
            }}
            zoomScale={0.92}
          />
        </div>
      </div>
    </div>
  );
};
