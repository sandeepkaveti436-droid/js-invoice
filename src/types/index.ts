export type UserRole = 'admin' | 'user';

export type AuthProvider = 'email' | 'google';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  avatarUrl?: string;
  provider: AuthProvider;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended';
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';

export type PricingMode = 'exclusive' | 'inclusive';

export type DiscountType = 'percentage' | 'fixed';

export type GstType = 'CGST_SGST' | 'IGST' | 'NONE';

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  rate?: number;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  upiId?: string;
  additionalInfo?: string;
}

export interface BusinessProfile {
  id: string;
  userId?: string;
  name: string;
  logoUrl?: string;
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  stateCode?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  bankDetails: BankDetails;
  signatureText?: string;
  signatureImageUrl?: string;
  defaultCurrency: string;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId?: string;
  stateCode?: string;
  currency?: string;
  notes?: string;
  createdAt: string;
  archived?: boolean;
}

export interface Product {
  id: string;
  userId?: string;
  name: string;
  description: string;
  sku?: string;
  category: string;
  unit: string;
  unitPrice: number;
  defaultTaxRate: number;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  description: string;
  hsnSacCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: DiscountType;
  taxRate: number;
  lineSubtotal: number;
  lineDiscount: number;
  taxableAmount: number;
  lineTax: number;
  lineTotal: number;
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}

export interface TemplateCustomization {
  templateId: 'modern' | 'minimal' | 'freelancer' | 'agency' | 'corporate' | 'gst';
  accentColor: string;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Playfair Display' | 'JetBrains Mono' | 'Georgia';
  logoPlacement: 'left' | 'center' | 'right';
  tableStyle: 'striped' | 'bordered' | 'clean';
  headerLayout: 'split' | 'stacked' | 'banner';
  showQrCode: boolean;
  watermarkText?: string;
}

export interface FieldVisibilityToggles {
  showLogo: boolean;
  showBusinessAddress: boolean;
  showTaxId: boolean;
  showPoNumber: boolean;
  showItemDiscount: boolean;
  showItemTax: boolean;
  showItemHsn: boolean;
  showItemDescription: boolean;
  showBankDetails: boolean;
  showNotes: boolean;
  showTerms: boolean;
  showSignature: boolean;
  showShipping: boolean;
  showWithholding: boolean;
  showPaymentInstructions: boolean;
}

export interface Invoice {
  id: string;
  userId?: string;
  number: string;
  prefix: string;
  title: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  poNumber?: string;
  referenceNumber?: string;
  paymentTerms: string;
  
  business: BusinessProfile;
  client: Client;
  items: InvoiceItem[];
  
  pricingMode: PricingMode;
  gstEnabled: boolean;
  gstType: GstType;
  placeOfSupply?: string;
  reverseCharge?: boolean;
  
  invoiceDiscount: number;
  invoiceDiscountType: DiscountType;
  shippingFee: number;
  withholdingTaxRate: number;
  
  notes: string;
  terms: string;
  paymentInstructions: string;
  bankDetails: BankDetails;
  
  signatureType: 'text' | 'image' | 'none';
  signatureData?: string;
  authorizedSignatoryName?: string;
  footerText: string;
  
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
  
  status: InvoiceStatus;
  templateConfig: TemplateCustomization;
  visibility: FieldVisibilityToggles;
  
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
}

export interface Quote {
  id: string;
  userId?: string;
  number: string;
  prefix: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  currency: string;
  referenceNumber?: string;
  
  business: BusinessProfile;
  client: Client;
  items: InvoiceItem[];
  
  pricingMode: PricingMode;
  gstEnabled: boolean;
  gstType: GstType;
  
  invoiceDiscount: number;
  invoiceDiscountType: DiscountType;
  shippingFee: number;
  
  notes: string;
  terms: string;
  
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  taxes: TaxBreakdown[];
  totalTax: number;
  grandTotal: number;
  
  status: QuoteStatus;
  convertedInvoiceId?: string;
  templateConfig: TemplateCustomization;
  visibility: FieldVisibilityToggles;
  
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId?: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'stripe' | 'paypal' | 'upi' | 'check' | 'other';
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  userId?: string;
  type: 'invoice_created' | 'invoice_sent' | 'payment_received' | 'invoice_paid' | 'quote_created' | 'quote_converted' | 'client_added';
  title: string;
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'invoice' | 'quote' | 'client' | 'payment';
}

export interface AppSettings {
  userId?: string;
  business: BusinessProfile;
  invoiceDefaults: {
    prefix: string;
    nextNumber: number;
    title: string;
    paymentTerms: string;
    dueInDays: number;
    defaultCurrency: string;
    defaultTaxRate: number;
    pricingMode: PricingMode;
    gstEnabled: boolean;
    defaultNotes: string;
    defaultTerms: string;
    defaultTemplate: TemplateCustomization['templateId'];
    accentColor: string;
  };
  appearance: {
    fontFamily: TemplateCustomization['fontFamily'];
    accentColor: string;
    sidebarCollapsed: boolean;
  };
  emailConfig: {
    senderName: string;
    senderEmail: string;
    replyTo: string;
    apiKey: string;
    provider: 'sandbox' | 'resend' | 'sendgrid' | 'smtp';
    invoiceSubjectTemplate: string;
    invoiceBodyTemplate: string;
  };
  paymentGatewayConfig: {
    enabled: boolean;
    provider: 'stripe' | 'razorpay' | 'paypal';
    publishableKey: string;
    testMode: boolean;
  };
}

export type NavigationPage = 
  | 'overview'
  | 'invoices'
  | 'invoice_create'
  | 'invoice_edit'
  | 'invoice_detail'
  | 'clients'
  | 'client_detail'
  | 'products'
  | 'quotes'
  | 'quote_create'
  | 'quote_edit'
  | 'payments'
  | 'reports'
  | 'templates'
  | 'settings';
