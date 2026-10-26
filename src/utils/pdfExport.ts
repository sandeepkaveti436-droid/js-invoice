import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  quality?: number;
}

/**
 * High-fidelity client-side PDF generator using html2canvas & jsPDF.
 * Renders the invoice DOM element with 2x retina DPI to standard A4 format (210mm x 297mm).
 */
export async function exportInvoiceToPdf(
  elementId: string, 
  filename = 'invoice.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  try {
    // Render target DOM with 2x scale and background preservation at standard A4 width
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasHeight / canvasWidth;

    // Strict Single-Page Fit: Proportional scaling so the invoice fits 100% on a single A4 page
    let renderWidth = pdfWidth;
    let renderHeight = pdfWidth * canvasRatio;
    let xOffset = 0;
    let yOffset = 0;

    if (renderHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = pdfHeight / canvasRatio;
      xOffset = (pdfWidth - renderWidth) / 2;
    }

    // Add exactly one single page
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

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
