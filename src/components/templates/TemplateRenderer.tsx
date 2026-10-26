import React from 'react';
import { Invoice, TemplateCustomization, FieldVisibilityToggles } from '../../types';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { FreelancerTemplate } from './FreelancerTemplate';
import { AgencyTemplate } from './AgencyTemplate';
import { CorporateTemplate } from './CorporateTemplate';
import { GSTInvoiceTemplate } from './GSTInvoiceTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CreativeTemplate } from './CreativeTemplate';

interface Props {
  invoice: Invoice;
  customization?: Partial<TemplateCustomization>;
  visibility?: Partial<FieldVisibilityToggles>;
  zoomScale?: number;
  showWatermark?: boolean;
}

export const TemplateRenderer: React.FC<Props> = ({
  invoice,
  customization,
  visibility,
  zoomScale = 1,
  showWatermark = true,
}) => {
  const templateId = customization?.templateId || invoice.templateConfig?.templateId || 'modern';

  const renderTemplateContent = () => {
    switch (templateId) {
      case 'minimal':
        return <MinimalTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'freelancer':
        return <FreelancerTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'agency':
        return <AgencyTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'corporate':
        return <CorporateTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'gst':
        return <GSTInvoiceTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'executive':
        return <ExecutiveTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'creative':
        return <CreativeTemplate invoice={invoice} customization={customization} visibility={visibility} />;
      case 'modern':
      default:
        return <ModernTemplate invoice={invoice} customization={customization} visibility={visibility} />;
    }
  };

  // Do not show intrusive "DRAFT" watermark on invoices
  const watermarkText = customization?.watermarkText || '';

  return (
    <div 
      className="flex justify-center items-start transition-transform duration-200 origin-top overflow-x-auto py-2"
      style={{
        transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      <div 
        id="invoice-document"
        className="a4-paper-container relative overflow-hidden flex flex-col min-h-[1123px] w-full"
      >
        {/* Optional Watermark */}
        {showWatermark && watermarkText && (
          <div 
            className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden z-10 opacity-[0.06]"
            aria-hidden="true"
          >
            <span className="text-[120px] font-black uppercase tracking-widest text-slate-900 transform -rotate-45">
              {watermarkText}
            </span>
          </div>
        )}

        {/* Template Layout */}
        <div className="relative z-0 flex-1 flex flex-col h-full w-full">
          {renderTemplateContent()}
        </div>
      </div>
    </div>
  );
};
