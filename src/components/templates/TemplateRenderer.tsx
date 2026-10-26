import React, { useEffect, useState } from 'react';
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
  zoomScale,
  showWatermark = true,
}) => {
  const [mobileFitScale, setMobileFitScale] = useState<number>(1);

  useEffect(() => {
    const handleFit = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
          // Calculate exact fit for mobile screens (with 32px safe margins)
          const margin = screenWidth < 480 ? 28 : 44;
          const fit = (screenWidth - margin) / 794;
          setMobileFitScale(Number(Math.min(1, Math.max(0.35, fit)).toFixed(2)));
        } else {
          setMobileFitScale(1);
        }
      }
    };

    handleFit();
    window.addEventListener('resize', handleFit);
    return () => window.removeEventListener('resize', handleFit);
  }, []);

  // Use explicit zoomScale if supplied, otherwise auto-fit on mobile screens
  const effectiveScale = zoomScale !== undefined ? zoomScale : mobileFitScale;

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
    <div className="flex justify-center items-start overflow-x-auto w-full py-1">
      <div 
        className="print-scale-reset transition-all duration-200"
        style={{
          width: effectiveScale !== 1 ? `${Math.round(794 * effectiveScale)}px` : '794px',
          height: effectiveScale !== 1 ? `${Math.round(1123 * effectiveScale)}px` : undefined,
          minWidth: effectiveScale !== 1 ? `${Math.round(794 * effectiveScale)}px` : undefined,
        }}
      >
        <div 
          style={{
            transform: effectiveScale !== 1 ? `scale(${effectiveScale})` : undefined,
            transformOrigin: 'top left',
            width: '794px',
            minHeight: '1123px',
          }}
        >
          <div 
            id="invoice-document"
            className="a4-paper-container relative overflow-hidden flex flex-col min-h-[1123px] w-[794px]"
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
      </div>
    </div>
  );
};
