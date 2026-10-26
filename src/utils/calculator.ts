import { 
  InvoiceItem, 
  PricingMode, 
  DiscountType, 
  GstType, 
  TaxBreakdown 
} from '../types';

/**
 * Monetary rounding helper to eliminate floating point imprecision.
 * Rounds to 2 decimal places safely.
 */
export function round2(num: number): number {
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates a single invoice line item with support for:
 * - Fractional quantities
 * - Item-level percentage or fixed discount
 * - Tax-exclusive vs Tax-inclusive calculations
 */
export function calculateLineItem(
  item: Omit<InvoiceItem, 'lineSubtotal' | 'lineDiscount' | 'taxableAmount' | 'lineTax' | 'lineTotal'> & {
    lineSubtotal?: number;
    lineDiscount?: number;
    taxableAmount?: number;
    lineTax?: number;
    lineTotal?: number;
  },
  pricingMode: PricingMode = 'exclusive'
): InvoiceItem {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discountVal = Number(item.discount) || 0;
  const taxRate = Number(item.taxRate) || 0;

  // 1. Line subtotal = quantity * unit price
  const lineSubtotal = round2(qty * price);

  // 2. Line discount
  let lineDiscount = 0;
  if (item.discountType === 'percentage') {
    lineDiscount = round2((lineSubtotal * Math.min(Math.max(discountVal, 0), 100)) / 100);
  } else {
    // Fixed discount cannot exceed subtotal
    lineDiscount = round2(Math.min(Math.max(discountVal, 0), lineSubtotal));
  }

  // 3. Taxable amount before tax
  const discountedAmount = round2(Math.max(0, lineSubtotal - lineDiscount));

  let taxableAmount = discountedAmount;
  let lineTax = 0;
  let lineTotal = 0;

  if (taxRate <= 0) {
    lineTax = 0;
    taxableAmount = discountedAmount;
    lineTotal = discountedAmount;
  } else if (pricingMode === 'inclusive') {
    // Tax-inclusive pricing: unit price already contains tax.
    // Base taxable amount = discountedAmount / (1 + taxRate/100)
    // Tax amount = discountedAmount - Base
    const baseAmount = round2(discountedAmount / (1 + taxRate / 100));
    lineTax = round2(discountedAmount - baseAmount);
    taxableAmount = baseAmount;
    lineTotal = discountedAmount; // Total matches the inclusive price
  } else {
    // Tax-exclusive pricing: tax is added on top of taxable line amount
    taxableAmount = discountedAmount;
    lineTax = round2((taxableAmount * taxRate) / 100);
    lineTotal = round2(taxableAmount + lineTax);
  }

  return {
    ...item,
    quantity: qty,
    unitPrice: price,
    discount: discountVal,
    discountType: item.discountType || 'percentage',
    taxRate: taxRate,
    lineSubtotal,
    lineDiscount,
    taxableAmount,
    lineTax,
    lineTotal,
  };
}

export interface CalculationInput {
  items: InvoiceItem[];
  pricingMode: PricingMode;
  invoiceDiscount: number;
  invoiceDiscountType: DiscountType;
  shippingFee: number;
  withholdingTaxRate: number; // e.g. 2% or 10% TDS
  gstEnabled: boolean;
  gstType: GstType;
  amountPaid: number;
}

export interface CalculationResult {
  items: InvoiceItem[];
  subtotal: number;
  lineDiscountTotal: number;
  invoiceDiscountAmount: number;
  totalDiscount: number;
  taxableAmount: number;
  taxes: TaxBreakdown[];
  totalTax: number;
  shippingAmount: number;
  withholdingAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
}

/**
 * Master Invoice & Quote Financial Calculation Engine.
 * 
 * Consistent calculation pipeline:
 * 1. Process all line items and line-level discounts & taxes
 * 2. Sum Subtotal = sum of all line subtotals (gross before discounts)
 * 3. Sum Line Discount Total = sum of all line-level discounts
 * 4. Apply Invoice-Level Discount (% or fixed) against post-line-discount subtotal
 * 5. Aggregate Taxes (with CGST / SGST 50-50 split or IGST full rate if GST enabled)
 * 6. Add Additional Charges (Shipping / Handling)
 * 7. Deduct Withholding Tax / Retention (TDS) if applicable
 * 8. Grand Total = Subtotal - Total Discounts + Total Tax + Shipping - Withholding
 * 9. Balance Due = Grand Total - Amount Paid
 */
export function calculateInvoice(input: CalculationInput): CalculationResult {
  const {
    items = [],
    pricingMode = 'exclusive',
    invoiceDiscount = 0,
    invoiceDiscountType = 'percentage',
    shippingFee = 0,
    withholdingTaxRate = 0,
    gstEnabled = false,
    gstType = 'CGST_SGST',
    amountPaid = 0,
  } = input;

  // 1. Recalculate each line item safely
  const processedItems = items.map(item => calculateLineItem(item, pricingMode));

  // 2. Subtotal & line discounts
  const subtotal = round2(processedItems.reduce((acc, it) => acc + it.lineSubtotal, 0));
  const lineDiscountTotal = round2(processedItems.reduce((acc, it) => acc + it.lineDiscount, 0));
  const postLineDiscountTotal = round2(Math.max(0, subtotal - lineDiscountTotal));

  // 3. Invoice-level discount
  let invoiceDiscountAmount = 0;
  if (invoiceDiscountType === 'percentage') {
    invoiceDiscountAmount = round2(
      (postLineDiscountTotal * Math.min(Math.max(Number(invoiceDiscount) || 0, 0), 100)) / 100
    );
  } else {
    invoiceDiscountAmount = round2(
      Math.min(Math.max(Number(invoiceDiscount) || 0, 0), postLineDiscountTotal)
    );
  }

  const totalDiscount = round2(lineDiscountTotal + invoiceDiscountAmount);

  // 4. Taxable amount (net of discounts)
  const taxableAmount = round2(Math.max(0, subtotal - totalDiscount));

  // 5. Aggregate taxes
  const taxMap = new Map<number, number>(); // rate -> total tax amount
  processedItems.forEach(item => {
    if (item.taxRate > 0 && item.lineTax > 0) {
      const existing = taxMap.get(item.taxRate) || 0;
      taxMap.set(item.taxRate, round2(existing + item.lineTax));
    }
  });

  const taxes: TaxBreakdown[] = [];

  if (gstEnabled && (gstType === 'CGST_SGST' || gstType === 'IGST')) {
    taxMap.forEach((taxAmt, rate) => {
      if (gstType === 'CGST_SGST') {
        const halfRate = round2(rate / 2);
        const halfAmount = round2(taxAmt / 2);
        taxes.push({
          name: `CGST (${halfRate}%)`,
          rate: halfRate,
          amount: halfAmount,
        });
        taxes.push({
          name: `SGST (${halfRate}%)`,
          rate: halfRate,
          amount: round2(taxAmt - halfAmount),
        });
      } else {
        taxes.push({
          name: `IGST (${rate}%)`,
          rate,
          amount: taxAmt,
        });
      }
    });
  } else {
    taxMap.forEach((taxAmt, rate) => {
      taxes.push({
        name: `Tax (${rate}%)`,
        rate,
        amount: taxAmt,
      });
    });
  }

  const totalTax = round2(taxes.reduce((acc, t) => acc + t.amount, 0));

  // 6. Additional charges
  const shippingAmount = round2(Math.max(0, Number(shippingFee) || 0));

  // 7. Withholding tax / TDS (calculated on taxable amount)
  const safeWithholdingRate = Math.min(Math.max(Number(withholdingTaxRate) || 0, 0), 100);
  const withholdingAmount = round2((taxableAmount * safeWithholdingRate) / 100);

  // 8. Grand total
  // Grand total = taxableAmount + totalTax + shippingAmount - withholdingAmount
  let grandTotal = 0;
  if (pricingMode === 'inclusive') {
    // In inclusive mode, the tax was already inside taxableAmount + lineTax = postLineDiscountTotal
    grandTotal = round2(Math.max(0, postLineDiscountTotal - invoiceDiscountAmount + shippingAmount - withholdingAmount));
  } else {
    grandTotal = round2(Math.max(0, taxableAmount + totalTax + shippingAmount - withholdingAmount));
  }

  // 9. Balance due
  const safePaid = round2(Math.max(0, Number(amountPaid) || 0));
  const balanceDue = round2(Math.max(0, grandTotal - safePaid));

  return {
    items: processedItems,
    subtotal,
    lineDiscountTotal,
    invoiceDiscountAmount,
    totalDiscount,
    taxableAmount,
    taxes,
    totalTax,
    shippingAmount,
    withholdingAmount,
    grandTotal,
    amountPaid: safePaid,
    balanceDue,
  };
}
