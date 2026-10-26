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
    // Render target DOM with 2x scale and background preservation
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page handling if invoice overflows standard A4 length
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
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
