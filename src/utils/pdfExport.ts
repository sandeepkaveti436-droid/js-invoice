import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type PaperSize = 'a4' | 'a3' | 'letter';

export interface PdfExportOptions {
  filename?: string;
  paperSize?: PaperSize;
  quality?: number;
}

/**
 * High-fidelity client-side PDF generator using html2canvas & jsPDF.
 * Renders the invoice DOM element with 2x retina DPI to standard A4, A3, or Letter format.
 * 
 * Strict Single-Page Priority:
 * - By default, standard invoices (with up to 8-10 line items) fit 100% on a SINGLE PAGE,
 *   scaling down proportionally if needed to avoid awkward spillover of footers onto page 2.
 * - Only multi-page invoices with extensive lists of items (>1.38x page height) paginate across 2+ pages.
 */
export async function exportInvoiceToPdf(
  elementId: string, 
  filenameOrOptions: string | PdfExportOptions = 'invoice.pdf'
): Promise<boolean> {
  const options: PdfExportOptions = typeof filenameOrOptions === 'string' 
    ? { filename: filenameOrOptions, paperSize: 'a4' }
    : { filename: 'invoice.pdf', paperSize: 'a4', ...filenameOrOptions };

  const filename = options.filename || 'invoice.pdf';
  const paperSize = options.paperSize || 'a4';

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  // Paper dimensions in mm
  const paperDimensions: Record<PaperSize, { width: number; height: number; jsPdfFormat: string }> = {
    a4: { width: 210, height: 297, jsPdfFormat: 'a4' },
    a3: { width: 297, height: 420, jsPdfFormat: 'a3' },
    letter: { width: 215.9, height: 279.4, jsPdfFormat: 'letter' },
  };

  const { width: pdfWidth, height: pdfHeight, jsPdfFormat } = paperDimensions[paperSize] || paperDimensions.a4;
  const targetWidthPx = paperSize === 'a3' ? 1120 : paperSize === 'letter' ? 816 : 794;
  const targetHeightPx = Math.round(targetWidthPx * (pdfHeight / pdfWidth));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetWidthPx,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          // Remove zoomScale / CSS transforms on ancestor elements in the cloned DOM
          let current: HTMLElement | null = clonedEl.parentElement;
          while (current && current !== clonedDoc.body) {
            current.style.transform = 'none';
            (current.style as any).zoom = '1';
            current = current.parentElement;
          }

          // Force exact standard paper dimensions
          clonedEl.style.width = `${targetWidthPx}px`;
          clonedEl.style.minWidth = `${targetWidthPx}px`;
          clonedEl.style.maxWidth = `${targetWidthPx}px`;
          clonedEl.style.minHeight = `${targetHeightPx}px`;
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.transform = 'none';
        }
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: jsPdfFormat as any,
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasHeight / canvasWidth;
    const naturalRenderHeight = pdfWidth * canvasRatio;

    // Single-page guarantee threshold:
    // If the invoice is <= 1.38x of a standard page height (standard invoice with up to ~8-10 line items),
    // scale it proportionally to fit 100% on a SINGLE PAGE, completely preventing any orphan 2nd page!
    if (naturalRenderHeight <= pdfHeight * 1.38) {
      let renderWidth = pdfWidth;
      let renderHeight = naturalRenderHeight;
      let xOffset = 0;
      let yOffset = 0;

      if (renderHeight > pdfHeight) {
        // Proportionally scale to fit exactly within single page height
        const scale = pdfHeight / renderHeight;
        renderHeight = pdfHeight;
        renderWidth = pdfWidth * scale;
        xOffset = (pdfWidth - renderWidth) / 2;
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Extensive multi-page document: slice cleanly into 2 or more pages
      const pageHeightPx = (canvasWidth * pdfHeight) / pdfWidth;
      let remainingHeight = canvasHeight;
      let pageIndex = 0;

      while (remainingHeight > 0) {
        // Skip tiny subpixel sliver (< 30px) on the last page to prevent blank pages
        if (pageIndex > 0 && remainingHeight <= 30) {
          break;
        }

        if (pageIndex > 0) {
          pdf.addPage(jsPdfFormat as any, 'portrait');
        }

        const sourceY = pageIndex * pageHeightPx;
        const currentSliceHeight = Math.min(pageHeightPx, remainingHeight);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = currentSliceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvasWidth, currentSliceHeight,
            0, 0, canvasWidth, currentSliceHeight
          );
        }

        const sliceData = pageCanvas.toDataURL('image/jpeg', 0.98);
        const sliceRenderHeight = (currentSliceHeight * pdfWidth) / canvasWidth;
        pdf.addImage(sliceData, 'JPEG', 0, 0, pdfWidth, sliceRenderHeight, undefined, 'FAST');

        remainingHeight -= currentSliceHeight;
        pageIndex++;
      }
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  }
}

/**
 * Triggers clean browser printing.
 * Accompanied by @media print CSS in index.css to hide app shell and print only invoice document.
 */
export function printInvoice(): void {
  window.print();
}
