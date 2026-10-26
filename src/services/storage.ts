import { 
  Invoice, 
  Quote, 
  Client, 
  Product, 
  PaymentRecord, 
  AppSettings, 
  ActivityItem, 
  BusinessProfile,
  TemplateCustomization,
  FieldVisibilityToggles
} from '../types';
import { calculateInvoice } from '../utils/calculator';
import { generateInvoiceNumber, generateQuoteNumber, getDateAfterDays, getTodayDateString } from '../utils/formatters';

const STORAGE_KEYS = {
  INVOICES: 'invoiceflow_invoices_v1',
  QUOTES: 'invoiceflow_quotes_v1',
  CLIENTS: 'invoiceflow_clients_v1',
  PRODUCTS: 'invoiceflow_products_v1',
  PAYMENTS: 'invoiceflow_payments_v1',
  SETTINGS: 'invoiceflow_settings_v1',
  ACTIVITIES: 'invoiceflow_activities_v1',
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateCustomization = {
  templateId: 'modern',
  accentColor: '#4F46E5', // Indigo
  fontFamily: 'Inter',
  logoPlacement: 'left',
  tableStyle: 'striped',
  headerLayout: 'split',
  showQrCode: true,
  watermarkText: '',
};

export const DEFAULT_VISIBILITY: FieldVisibilityToggles = {
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
  showShipping: true,
  showWithholding: false,
  showPaymentInstructions: true,
};

export const DEFAULT_BUSINESS: BusinessProfile = {
  id: 'biz_default',
  name: 'Nexus Craft Studio LLC',
  logoUrl: '',
  email: 'billing@nexuscraft.design',
  phone: '+1 (555) 234-5678',
  website: 'https://nexuscraft.design',
  taxId: 'US-EIN-94-3829102',
  stateCode: 'CA',
  addressLine1: '450 Mission Street, Suite 1400',
  addressLine2: 'SoMa Tech Center',
  city: 'San Francisco',
  state: 'California',
  postalCode: '94105',
  country: 'United States',
  bankDetails: {
    bankName: 'Silicon Valley Bank / First Republic',
    accountHolder: 'Nexus Craft Studio LLC',
    accountNumber: '982348102948',
    routingNumber: '121000358',
    swiftCode: 'SVBKUS6S',
    iban: '',
    upiId: '',
    additionalInfo: 'Wire transfers take 1 business day. Please mention invoice number in reference.',
  },
  signatureText: 'Alex Rivera, Managing Director',
  defaultCurrency: 'USD',
};

export const DEFAULT_SETTINGS: AppSettings = {
  business: DEFAULT_BUSINESS,
  invoiceDefaults: {
    prefix: 'INV-2026-',
    nextNumber: 6,
    title: 'Tax Invoice',
    paymentTerms: 'Net 30',
    dueInDays: 30,
    defaultCurrency: 'USD',
    defaultTaxRate: 10,
    pricingMode: 'exclusive',
    gstEnabled: false,
    defaultNotes: 'Thank you for your business. We truly appreciate the opportunity to collaborate!',
    defaultTerms: 'Payment is due within the stipulated terms. Overdue accounts are subject to a service fee of 1.5% per month. Work remains property of Nexus Craft until fully settled.',
    defaultTemplate: 'modern',
    accentColor: '#4F46E5',
  },
  appearance: {
    fontFamily: 'Inter',
    accentColor: '#4F46E5',
    sidebarCollapsed: false,
  },
  emailConfig: {
    senderName: 'Nexus Craft Billing',
    senderEmail: 'invoicing@nexuscraft.design',
    replyTo: 'support@nexuscraft.design',
    apiKey: '',
    provider: 'sandbox',
    invoiceSubjectTemplate: 'Invoice {invoice_number} from Nexus Craft Studio',
    invoiceBodyTemplate: 'Hi {client_name},\n\nPlease find attached invoice {invoice_number} for {total_amount}.\nDue date: {due_date}.\n\nThank you for choosing Nexus Craft!\nBest regards,\nNexus Craft Billing Team',
  },
  paymentGatewayConfig: {
    enabled: false,
    provider: 'stripe',
    publishableKey: 'pk_test_sample_key_demo_51J',
    testMode: true,
  },
};

const SEED_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    name: 'Sarah Jenkins',
    companyName: 'Acme Cloud Technologies',
    email: 'sarah.jenkins@acmecloud.io',
    phone: '+1 (415) 890-1200',
    addressLine1: '789 Market Street, Floor 8',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    country: 'United States',
    taxId: 'US-EIN-45-9871234',
    currency: 'USD',
    notes: 'Key enterprise account. Preferred Net 30 terms.',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cli_2',
    name: 'Marcus Aurelius Vance',
    companyName: 'Vance Capital Partners',
    email: 'm.vance@vancecapital.co.uk',
    phone: '+44 20 7946 0991',
    addressLine1: '25 Bank Street, Canary Wharf',
    city: 'London',
    state: 'Greater London',
    postalCode: 'E14 5JP',
    country: 'United Kingdom',
    taxId: 'GB-VAT-992-8192-34',
    currency: 'GBP',
    notes: 'Financial consulting and quarterly dashboards.',
    createdAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'cli_3',
    name: 'Elena Rostova',
    companyName: 'Nordic Light Studio',
    email: 'elena@nordiclight.design',
    phone: '+49 30 555 3829',
    addressLine1: 'Torstraße 142',
    city: 'Berlin',
    state: 'Berlin',
    postalCode: '10119',
    country: 'Germany',
    taxId: 'DE-302918234',
    currency: 'EUR',
    notes: 'E-commerce UI redesign contract.',
    createdAt: '2026-02-01T14:15:00Z',
  },
  {
    id: 'cli_4',
    name: 'Rajesh Sharma',
    companyName: 'Zenith Infotech Pvt Ltd',
    email: 'rajesh.sharma@zenithinfo.in',
    phone: '+91 98200 45678',
    addressLine1: 'Block B, Cyber City, Phase III',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122002',
    country: 'India',
    taxId: '06AAACZ1234F1Z8',
    stateCode: '06',
    currency: 'INR',
    notes: 'Requires GST Tax Invoice with CGST & SGST separation.',
    createdAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'cli_5',
    name: 'David Kim',
    companyName: 'K-Pulse Media Group',
    email: 'david@kpulse.co',
    phone: '+1 (212) 555-0199',
    addressLine1: '120 Broadway, Suite 2200',
    city: 'New York',
    state: 'NY',
    postalCode: '10271',
    country: 'United States',
    taxId: 'US-EIN-12-8374621',
    currency: 'USD',
    notes: 'Monthly video production and branding retainer.',
    createdAt: '2026-02-18T09:20:00Z',
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'UI/UX Design System & Prototyping',
    description: 'High-fidelity Figma components, design tokens, interactive micro-interactions, responsive design.',
    sku: 'SRV-DS-01',
    category: 'Design',
    unit: 'hrs',
    unitPrice: 125,
    defaultTaxRate: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod_2',
    name: 'Full-Stack React & Node Architecture',
    description: 'Scalable frontend engineering with TypeScript, API integrations, and database performance tuning.',
    sku: 'SRV-DEV-02',
    category: 'Engineering',
    unit: 'hrs',
    unitPrice: 150,
    defaultTaxRate: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod_3',
    name: 'Enterprise Cloud Deployment & CI/CD',
    description: 'AWS / Docker / Kubernetes infrastructure setup, automated testing pipeline, and security auditing.',
    sku: 'SRV-OPS-03',
    category: 'DevOps',
    unit: 'project',
    unitPrice: 3200,
    defaultTaxRate: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod_4',
    name: 'Monthly Maintenance & Support Retainer',
    description: '24/7 uptime monitoring, SLA support, bug fixes, minor feature releases, and dependency updates.',
    sku: 'RET-MNT-04',
    category: 'Retainer',
    unit: 'mo',
    unitPrice: 1800,
    defaultTaxRate: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod_5',
    name: 'Brand Identity & Visual Guidelines',
    description: 'Logo mark, typography pairings, color palette, stationery suite, and 40-page brand playbook.',
    sku: 'PKG-BRD-05',
    category: 'Branding',
    unit: 'package',
    unitPrice: 4500,
    defaultTaxRate: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod_6',
    name: 'SEO & Performance Optimization Audit',
    description: 'Core Web Vitals remediation, lighthouse 95+ score achievement, semantic schema markup.',
    sku: 'SRV-SEO-06',
    category: 'Marketing',
    unit: 'audit',
    unitPrice: 950,
    defaultTaxRate: 10,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

function buildSeedInvoices(): Invoice[] {
  // 1. Paid Invoice
  const calc1 = calculateInvoice({
    items: [
      {
        id: 'it_1',
        name: 'UI/UX Design System & Prototyping',
        description: 'Complete dashboard Figma components and responsive layouts for mobile and web.',
        quantity: 40,
        unit: 'hrs',
        unitPrice: 125,
        discount: 5,
        discountType: 'percentage',
        taxRate: 8.5,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
      {
        id: 'it_2',
        name: 'Full-Stack React & Node Architecture',
        description: 'Frontend component library scaffolding in React with Tailwind CSS.',
        quantity: 24,
        unit: 'hrs',
        unitPrice: 150,
        discount: 0,
        discountType: 'fixed',
        taxRate: 8.5,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 200,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    gstEnabled: false,
    gstType: 'NONE',
    amountPaid: 8856.38,
  });

  const inv1: Invoice = {
    id: 'inv_1',
    number: 'INV-2026-001',
    prefix: 'INV-2026-',
    title: 'Tax Invoice',
    issueDate: '2026-01-15',
    dueDate: '2026-02-14',
    currency: 'USD',
    poNumber: 'PO-ACME-9021',
    referenceNumber: 'REF-2026-01',
    paymentTerms: 'Net 30',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[0],
    ...calc1,
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 200,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    notes: 'Thank you for your business. We look forward to Phase 2!',
    terms: DEFAULT_SETTINGS.invoiceDefaults.defaultTerms,
    paymentInstructions: 'Please send wire transfer to the bank details below.',
    bankDetails: DEFAULT_BUSINESS.bankDetails,
    signatureType: 'text',
    authorizedSignatoryName: 'Alex Rivera',
    footerText: 'InvoiceFlow SaaS — Generated electronically & fully compliant.',
    status: 'paid',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'modern',
      accentColor: '#4F46E5',
    },
    visibility: DEFAULT_VISIBILITY,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    sentAt: '2026-01-15T09:15:00Z',
    paidAt: '2026-01-20T14:30:00Z',
  };

  // 2. Partially Paid Invoice
  const calc2 = calculateInvoice({
    items: [
      {
        id: 'it_3',
        name: 'Brand Identity & Visual Guidelines',
        description: 'Complete rebrand package with logo family, vector iconography, and corporate guidelines.',
        quantity: 1,
        unit: 'package',
        unitPrice: 4500,
        discount: 10,
        discountType: 'percentage',
        taxRate: 20,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
      {
        id: 'it_4',
        name: 'SEO & Performance Optimization Audit',
        description: 'Pre-launch web performance tuning and schema validation.',
        quantity: 1,
        unit: 'audit',
        unitPrice: 950,
        discount: 0,
        discountType: 'fixed',
        taxRate: 20,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    gstEnabled: false,
    gstType: 'NONE',
    amountPaid: 3000,
  });

  const inv2: Invoice = {
    id: 'inv_2',
    number: 'INV-2026-002',
    prefix: 'INV-2026-',
    title: 'Commercial Invoice',
    issueDate: '2026-02-01',
    dueDate: getDateAfterDays(14),
    currency: 'GBP',
    poNumber: 'VANCE-PR-441',
    paymentTerms: 'Net 30',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[1],
    ...calc2,
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    notes: 'First milestone of 50% deposit received. Remaining balance due upon final asset handover.',
    terms: DEFAULT_SETTINGS.invoiceDefaults.defaultTerms,
    paymentInstructions: 'Bank transfer to Nexus Craft UK Sterling account.',
    bankDetails: DEFAULT_BUSINESS.bankDetails,
    signatureType: 'text',
    authorizedSignatoryName: 'Alex Rivera',
    footerText: 'Registered business in California with UK trading representation.',
    status: 'partially_paid',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'corporate',
      accentColor: '#0F172A',
    },
    visibility: DEFAULT_VISIBILITY,
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-05T16:00:00Z',
    sentAt: '2026-02-01T11:30:00Z',
  };

  // 3. Sent / Open Invoice
  const calc3 = calculateInvoice({
    items: [
      {
        id: 'it_5',
        name: 'Enterprise Cloud Deployment & CI/CD',
        description: 'Multi-region AWS ECS setup with automated zero-downtime deployment pipelines.',
        quantity: 1,
        unit: 'project',
        unitPrice: 3200,
        discount: 0,
        discountType: 'percentage',
        taxRate: 19,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
      {
        id: 'it_6',
        name: 'Monthly Maintenance & Support Retainer',
        description: 'February 2026 dedicated support retainer.',
        quantity: 1,
        unit: 'mo',
        unitPrice: 1800,
        discount: 0,
        discountType: 'percentage',
        taxRate: 19,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 5,
    invoiceDiscountType: 'percentage',
    shippingFee: 0,
    withholdingTaxRate: 0,
    gstEnabled: false,
    gstType: 'NONE',
    amountPaid: 0,
  });

  const inv3: Invoice = {
    id: 'inv_3',
    number: 'INV-2026-003',
    prefix: 'INV-2026-',
    title: 'Tax Invoice',
    issueDate: '2026-02-15',
    dueDate: getDateAfterDays(10),
    currency: 'EUR',
    paymentTerms: 'Net 15',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[2],
    ...calc3,
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 5,
    invoiceDiscountType: 'percentage',
    shippingFee: 0,
    withholdingTaxRate: 0,
    notes: 'EU reverse charge rules may apply if VAT ID is validated.',
    terms: DEFAULT_SETTINGS.invoiceDefaults.defaultTerms,
    paymentInstructions: 'SEPA Euro transfer accepted directly to IBAN.',
    bankDetails: DEFAULT_BUSINESS.bankDetails,
    signatureType: 'text',
    authorizedSignatoryName: 'Alex Rivera',
    footerText: 'Thank you for your business.',
    status: 'sent',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'freelancer',
      accentColor: '#D97706',
    },
    visibility: DEFAULT_VISIBILITY,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:30:00Z',
    sentAt: '2026-02-15T10:30:00Z',
  };

  // 4. Overdue Invoice
  const calc4 = calculateInvoice({
    items: [
      {
        id: 'it_7',
        name: 'UI/UX Design System & Prototyping',
        description: 'Interactive high-fidelity prototypes and user testing sessions.',
        quantity: 18,
        unit: 'hrs',
        unitPrice: 125,
        discount: 0,
        discountType: 'percentage',
        taxRate: 8.875,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    gstEnabled: false,
    gstType: 'NONE',
    amountPaid: 0,
  });

  const inv4: Invoice = {
    id: 'inv_4',
    number: 'INV-2026-004',
    prefix: 'INV-2026-',
    title: 'Tax Invoice',
    issueDate: '2026-01-05',
    dueDate: '2026-01-25', // Already overdue
    currency: 'USD',
    paymentTerms: 'Net 20',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[4],
    ...calc4,
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    notes: 'Second reminder sent. Please clear balance immediately to avoid late interest.',
    terms: DEFAULT_SETTINGS.invoiceDefaults.defaultTerms,
    paymentInstructions: 'ACH or credit card via invoice link.',
    bankDetails: DEFAULT_BUSINESS.bankDetails,
    signatureType: 'text',
    authorizedSignatoryName: 'Alex Rivera',
    footerText: 'Payment overdue by 30+ days.',
    status: 'overdue',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'agency',
      accentColor: '#E11D48',
    },
    visibility: DEFAULT_VISIBILITY,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-26T09:00:00Z',
    sentAt: '2026-01-05T09:15:00Z',
  };

  // 5. GST Tax Invoice (India)
  const calc5 = calculateInvoice({
    items: [
      {
        id: 'it_8',
        name: 'Full-Stack Software Development Services',
        description: 'Backend microservices architecture and GraphQL API gateway implementation.',
        hsnSacCode: '998314',
        quantity: 80,
        unit: 'hrs',
        unitPrice: 2500,
        discount: 0,
        discountType: 'percentage',
        taxRate: 18,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
      {
        id: 'it_9',
        name: 'Cloud Infrastructure Management & Monitoring',
        description: 'Server cluster optimization and monthly SLA management.',
        hsnSacCode: '998313',
        quantity: 1,
        unit: 'mo',
        unitPrice: 45000,
        discount: 5000,
        discountType: 'fixed',
        taxRate: 18,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 2, // 2% TDS
    gstEnabled: true,
    gstType: 'CGST_SGST',
    amountPaid: 0,
  });

  const inv5: Invoice = {
    id: 'inv_5',
    number: 'INV-2026-005',
    prefix: 'INV-2026-',
    title: 'GST TAX INVOICE',
    issueDate: getTodayDateString(),
    dueDate: getDateAfterDays(30),
    currency: 'INR',
    poNumber: 'PO-ZENITH-2026-88',
    paymentTerms: 'Net 30',
    business: {
      ...DEFAULT_BUSINESS,
      taxId: '06AABCN1234F1Z5',
      stateCode: '06 - Haryana',
    },
    client: SEED_CLIENTS[3],
    ...calc5,
    pricingMode: 'exclusive',
    gstEnabled: true,
    gstType: 'CGST_SGST',
    placeOfSupply: '06 - Haryana',
    reverseCharge: false,
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 2,
    notes: 'Certified that particulars given above are true and correct and amount indicated represents price actually charged.',
    terms: 'TDS applicable u/s 194J at 2%. Form 16A to be issued at end of financial quarter.',
    paymentInstructions: 'NEFT / RTGS to current account details shown.',
    bankDetails: {
      ...DEFAULT_BUSINESS.bankDetails,
      bankName: 'HDFC Bank Ltd',
      routingNumber: 'HDFC0001234 (IFSC)',
      accountNumber: '50200012345678',
      upiId: 'nexuscraft@hdfcbank',
    },
    signatureType: 'text',
    authorizedSignatoryName: 'Alex Rivera, Authorized Signatory',
    footerText: 'This is a computer generated tax invoice and does not require a physical signature.',
    status: 'draft',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'gst',
      accentColor: '#2563EB',
    },
    visibility: {
      ...DEFAULT_VISIBILITY,
      showItemHsn: true,
      showWithholding: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return [inv1, inv2, inv3, inv4, inv5];
}

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_1',
    invoiceId: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    clientId: 'cli_1',
    clientName: 'Sarah Jenkins (Acme Cloud)',
    amount: 8856.38,
    currency: 'USD',
    paymentDate: '2026-01-20',
    method: 'bank_transfer',
    transactionRef: 'WIRE-SVB-948201',
    notes: 'Full payment received via Wire Transfer.',
    createdAt: '2026-01-20T14:30:00Z',
  },
  {
    id: 'pay_2',
    invoiceId: 'inv_2',
    invoiceNumber: 'INV-2026-002',
    clientId: 'cli_2',
    clientName: 'Marcus Aurelius Vance',
    amount: 3000.00,
    currency: 'GBP',
    paymentDate: '2026-02-05',
    method: 'credit_card',
    transactionRef: 'STRIPE-CH-391823',
    notes: '50% project kickoff retainer.',
    createdAt: '2026-02-05T16:00:00Z',
  },
];

function buildSeedQuotes(): Quote[] {
  const calcQ1 = calculateInvoice({
    items: [
      {
        id: 'qit_1',
        name: 'UI/UX Design System & Prototyping',
        description: 'Brand new mobile banking application workflow designs.',
        quantity: 50,
        unit: 'hrs',
        unitPrice: 125,
        discount: 0,
        discountType: 'percentage',
        taxRate: 10,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
      {
        id: 'qit_2',
        name: 'Full-Stack React & Node Architecture',
        description: 'React Native mobile app implementation with biometric security.',
        quantity: 60,
        unit: 'hrs',
        unitPrice: 150,
        discount: 5,
        discountType: 'percentage',
        taxRate: 10,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 500,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    gstEnabled: false,
    gstType: 'NONE',
    amountPaid: 0,
  });

  const quote1: Quote = {
    id: 'quote_1',
    number: 'EST-2026-001',
    prefix: 'EST-2026-',
    title: 'Project Estimate',
    issueDate: getTodayDateString(),
    expiryDate: getDateAfterDays(15),
    currency: 'USD',
    referenceNumber: 'PROP-MOBILE-2026',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[0],
    ...calcQ1,
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 500,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    notes: 'Estimate valid for 15 days from issue date. Deliverables scheduled to begin within 5 days of acceptance.',
    terms: '50% deposit required upon project commencement. Balance due upon deliverable milestones.',
    status: 'sent',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'modern',
      accentColor: '#4F46E5',
    },
    visibility: DEFAULT_VISIBILITY,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const calcQ2 = calculateInvoice({
    items: [
      {
        id: 'qit_3',
        name: 'Brand Identity & Visual Guidelines',
        description: 'Corporate stationery, digital brand book, presentation deck templates.',
        quantity: 1,
        unit: 'package',
        unitPrice: 4500,
        discount: 0,
        discountType: 'fixed',
        taxRate: 20,
        lineSubtotal: 0,
        lineDiscount: 0,
        taxableAmount: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ],
    pricingMode: 'exclusive',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    withholdingTaxRate: 0,
    gstEnabled: false,
    gstType: 'NONE',
    amountPaid: 0,
  });

  const quote2: Quote = {
    id: 'quote_2',
    number: 'EST-2026-002',
    prefix: 'EST-2026-',
    title: 'Brand Refresh Quotation',
    issueDate: '2026-02-10',
    expiryDate: getDateAfterDays(20),
    currency: 'GBP',
    referenceNumber: 'BRAND-Q1-2026',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[1],
    ...calcQ2,
    pricingMode: 'exclusive',
    gstEnabled: false,
    gstType: 'NONE',
    invoiceDiscount: 0,
    invoiceDiscountType: 'fixed',
    shippingFee: 0,
    notes: 'Includes 3 revision rounds for brand mark and typography exploration.',
    terms: 'All IP transfers upon final payment.',
    status: 'draft',
    templateConfig: {
      ...DEFAULT_TEMPLATE_CONFIG,
      templateId: 'minimal',
      accentColor: '#111827',
    },
    visibility: DEFAULT_VISIBILITY,
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-02-10T12:00:00Z',
  };

  return [quote1, quote2];
}

const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'Received $8,856.38 for invoice INV-2026-001 from Acme Cloud Technologies.',
    timestamp: '2026-01-20T14:30:00Z',
    entityId: 'inv_1',
    entityType: 'payment',
  },
  {
    id: 'act_2',
    type: 'invoice_sent',
    title: 'Invoice Sent',
    description: 'Invoice INV-2026-003 (€5,622.75) sent to Nordic Light Studio.',
    timestamp: '2026-02-15T10:30:00Z',
    entityId: 'inv_3',
    entityType: 'invoice',
  },
  {
    id: 'act_3',
    type: 'payment_received',
    title: 'Partial Payment Received',
    description: 'Received £3,000.00 for invoice INV-2026-002 from Vance Capital Partners.',
    timestamp: '2026-02-05T16:00:00Z',
    entityId: 'inv_2',
    entityType: 'payment',
  },
  {
    id: 'act_4',
    type: 'quote_created',
    title: 'Quote Created',
    description: 'Estimate EST-2026-001 ($14,575.00) drafted for Acme Cloud Technologies.',
    timestamp: '2026-02-20T09:00:00Z',
    entityId: 'quote_1',
    entityType: 'quote',
  },
];

// Helper to safely read from localStorage
function readStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

// Helper to safely write to localStorage
function writeStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

/**
 * Storage Service - Full relational CRUD & state persistence
 */
export const StorageService = {
  // Initialize storage with seeds if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      writeStorage(STORAGE_KEYS.CLIENTS, SEED_CLIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      writeStorage(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      writeStorage(STORAGE_KEYS.INVOICES, buildSeedInvoices());
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      writeStorage(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
      writeStorage(STORAGE_KEYS.QUOTES, buildSeedQuotes());
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      writeStorage(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
    }
  },

  // Invoices
  getInvoices(): Invoice[] {
    this.init();
    const invoices = readStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    
    // Automatically flag overdue invoices if unpaid and due date passed
    const today = new Date().toISOString().split('T')[0];
    return invoices.map(inv => {
      if ((inv.status === 'sent' || inv.status === 'partially_paid') && inv.dueDate < today && inv.balanceDue > 0) {
        return { ...inv, status: 'overdue' as const };
      }
      return inv;
    });
  },

  getInvoiceById(id: string): Invoice | undefined {
    return this.getInvoices().find(i => i.id === id);
  },

  saveInvoice(invoice: Invoice): Invoice {
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    
    const now = new Date().toISOString();
    let updatedInvoice: Invoice = {
      ...invoice,
      updatedAt: now,
    };

    if (index >= 0) {
      invoices[index] = updatedInvoice;
    } else {
      updatedInvoice.createdAt = now;
      invoices.unshift(updatedInvoice);

      // Increment next sequence in settings
      const settings = this.getSettings();
      settings.invoiceDefaults.nextNumber += 1;
      this.saveSettings(settings);

      this.addActivity({
        type: 'invoice_created',
        title: 'Invoice Created',
        description: `Invoice ${updatedInvoice.number} was created for ${updatedInvoice.client?.name || 'Client'}.`,
        entityId: updatedInvoice.id,
        entityType: 'invoice',
      });
    }

    writeStorage(STORAGE_KEYS.INVOICES, invoices);
    return updatedInvoice;
  },

  deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices();
    const filtered = invoices.filter(i => i.id !== id);
    if (filtered.length !== invoices.length) {
      writeStorage(STORAGE_KEYS.INVOICES, filtered);
      return true;
    }
    return false;
  },

  duplicateInvoice(id: string): Invoice | null {
    const existing = this.getInvoiceById(id);
    if (!existing) return null;

    const settings = this.getSettings();
    const newNumber = generateInvoiceNumber(
      settings.invoiceDefaults.prefix, 
      settings.invoiceDefaults.nextNumber
    );

    const duplicated: Invoice = {
      ...existing,
      id: 'inv_' + Date.now(),
      number: newNumber,
      title: existing.title || 'Tax Invoice',
      issueDate: getTodayDateString(),
      dueDate: getDateAfterDays(settings.invoiceDefaults.dueInDays || 30),
      status: 'draft',
      amountPaid: 0,
      balanceDue: existing.grandTotal,
      paidAt: undefined,
      sentAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveInvoice(duplicated);
  },

  // Quotes
  getQuotes(): Quote[] {
    this.init();
    return readStorage<Quote[]>(STORAGE_KEYS.QUOTES, []);
  },

  getQuoteById(id: string): Quote | undefined {
    return this.getQuotes().find(q => q.id === id);
  },

  saveQuote(quote: Quote): Quote {
    const quotes = this.getQuotes();
    const index = quotes.findIndex(q => q.id === quote.id);
    const now = new Date().toISOString();

    let updatedQuote: Quote = {
      ...quote,
      updatedAt: now,
    };

    if (index >= 0) {
      quotes[index] = updatedQuote;
    } else {
      updatedQuote.createdAt = now;
      quotes.unshift(updatedQuote);

      this.addActivity({
        type: 'quote_created',
        title: 'Quote Created',
        description: `Estimate ${updatedQuote.number} was created for ${updatedQuote.client?.name || 'Client'}.`,
        entityId: updatedQuote.id,
        entityType: 'quote',
      });
    }

    writeStorage(STORAGE_KEYS.QUOTES, quotes);
    return updatedQuote;
  },

  deleteQuote(id: string): boolean {
    const quotes = this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    if (filtered.length !== quotes.length) {
      writeStorage(STORAGE_KEYS.QUOTES, filtered);
      return true;
    }
    return false;
  },

  convertQuoteToInvoice(quoteId: string): Invoice | null {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return null;

    // Prevent duplicate conversion if already converted
    if (quote.convertedInvoiceId) {
      const existingInv = this.getInvoiceById(quote.convertedInvoiceId);
      if (existingInv) return existingInv;
    }

    const settings = this.getSettings();
    const newNumber = generateInvoiceNumber(
      settings.invoiceDefaults.prefix, 
      settings.invoiceDefaults.nextNumber
    );

    const calculated = calculateInvoice({
      items: quote.items,
      pricingMode: quote.pricingMode,
      invoiceDiscount: quote.invoiceDiscount,
      invoiceDiscountType: quote.invoiceDiscountType,
      shippingFee: quote.shippingFee,
      withholdingTaxRate: 0,
      gstEnabled: quote.gstEnabled,
      gstType: quote.gstType,
      amountPaid: 0,
    });

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      number: newNumber,
      prefix: settings.invoiceDefaults.prefix,
      title: 'Tax Invoice',
      issueDate: getTodayDateString(),
      dueDate: getDateAfterDays(settings.invoiceDefaults.dueInDays || 30),
      currency: quote.currency,
      referenceNumber: `Quote Ref: ${quote.number}`,
      paymentTerms: settings.invoiceDefaults.paymentTerms,
      business: quote.business,
      client: quote.client,
      ...calculated,
      pricingMode: quote.pricingMode,
      gstEnabled: quote.gstEnabled,
      gstType: quote.gstType,
      invoiceDiscount: quote.invoiceDiscount,
      invoiceDiscountType: quote.invoiceDiscountType,
      shippingFee: quote.shippingFee,
      withholdingTaxRate: 0,
      notes: quote.notes,
      terms: quote.terms || settings.invoiceDefaults.defaultTerms,
      paymentInstructions: 'Please remit payment as per bank details below.',
      bankDetails: quote.business.bankDetails,
      signatureType: 'text',
      authorizedSignatoryName: quote.business.signatureText,
      footerText: 'Thank you for approving our estimate.',
      status: 'draft',
      templateConfig: quote.templateConfig,
      visibility: quote.visibility,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedInvoice = this.saveInvoice(newInvoice);

    // Update quote status to accepted & mark convertedInvoiceId
    quote.status = 'converted';
    quote.convertedInvoiceId = savedInvoice.id;
    this.saveQuote(quote);

    this.addActivity({
      type: 'quote_converted',
      title: 'Quote Converted',
      description: `Quote ${quote.number} was converted into Invoice ${savedInvoice.number}.`,
      entityId: savedInvoice.id,
      entityType: 'invoice',
    });

    return savedInvoice;
  },

  // Clients
  getClients(): Client[] {
    this.init();
    return readStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
  },

  getClientById(id: string): Client | undefined {
    return this.getClients().find(c => c.id === id);
  },

  saveClient(client: Client): Client {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);

    let updatedClient: Client = { ...client };
    if (index >= 0) {
      clients[index] = updatedClient;
    } else {
      updatedClient.id = client.id || 'cli_' + Date.now();
      updatedClient.createdAt = new Date().toISOString();
      clients.unshift(updatedClient);

      this.addActivity({
        type: 'client_added',
        title: 'New Client Added',
        description: `Added client "${updatedClient.name}" (${updatedClient.companyName || updatedClient.email}).`,
        entityId: updatedClient.id,
        entityType: 'client',
      });
    }

    writeStorage(STORAGE_KEYS.CLIENTS, clients);
    return updatedClient;
  },

  deleteClient(id: string): { success: boolean; message?: string } {
    const invoices = this.getInvoices();
    const hasInvoices = invoices.some(i => i.client?.id === id);

    // Protected deletion rule: If client has historical invoices, archive instead of silent cascade delete
    const clients = this.getClients();
    if (hasInvoices) {
      const index = clients.findIndex(c => c.id === id);
      if (index >= 0) {
        clients[index].archived = true;
        writeStorage(STORAGE_KEYS.CLIENTS, clients);
        return { success: true, message: 'Client has existing invoices. Client was safely archived.' };
      }
    }

    const filtered = clients.filter(c => c.id !== id);
    writeStorage(STORAGE_KEYS.CLIENTS, filtered);
    return { success: true, message: 'Client removed successfully.' };
  },

  getClientMetrics(clientId: string) {
    const invoices = this.getInvoices().filter(i => i.client?.id === clientId && i.status !== 'cancelled');
    const totalInvoiced = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPaid = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const balanceDue = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
    return {
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      balanceDue: Math.round(balanceDue * 100) / 100,
      invoiceCount: invoices.length,
      invoices,
    };
  },

  // Products
  getProducts(): Product[] {
    this.init();
    return readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);

    let updatedProduct: Product = { ...product };
    if (index >= 0) {
      products[index] = updatedProduct;
    } else {
      updatedProduct.id = product.id || 'prod_' + Date.now();
      updatedProduct.createdAt = new Date().toISOString();
      products.unshift(updatedProduct);
    }

    writeStorage(STORAGE_KEYS.PRODUCTS, products);
    return updatedProduct;
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
      writeStorage(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  },

  // Payments
  getPayments(): PaymentRecord[] {
    this.init();
    return readStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
  },

  recordPayment(record: Omit<PaymentRecord, 'id' | 'createdAt'>): { payment: PaymentRecord; invoice: Invoice } {
    const invoice = this.getInvoiceById(record.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const paymentAmount = Math.round(record.amount * 100) / 100;
    if (paymentAmount <= 0) throw new Error('Payment amount must be greater than zero');

    // Create payment record
    const payment: PaymentRecord = {
      ...record,
      id: 'pay_' + Date.now(),
      amount: paymentAmount,
      createdAt: new Date().toISOString(),
    };

    const payments = this.getPayments();
    payments.unshift(payment);
    writeStorage(STORAGE_KEYS.PAYMENTS, payments);

    // Update invoice paid amount and balance
    const newPaidTotal = Math.min(invoice.grandTotal, Math.round((invoice.amountPaid + paymentAmount) * 100) / 100);
    const newBalance = Math.max(0, Math.round((invoice.grandTotal - newPaidTotal) * 100) / 100);

    invoice.amountPaid = newPaidTotal;
    invoice.balanceDue = newBalance;

    if (newBalance === 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
    } else {
      invoice.status = 'partially_paid';
    }

    const updatedInvoice = this.saveInvoice(invoice);

    this.addActivity({
      type: 'payment_received',
      title: 'Payment Recorded',
      description: `Recorded payment of ${payment.amount} (${payment.method}) for Invoice ${invoice.number}.`,
      entityId: invoice.id,
      entityType: 'payment',
    });

    return { payment, invoice: updatedInvoice };
  },

  // Settings
  getSettings(): AppSettings {
    this.init();
    return readStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: AppSettings): AppSettings {
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // Activities
  getActivities(): ActivityItem[] {
    this.init();
    return readStorage<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, []);
  },

  addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const activities = this.getActivities();
    const newActivity: ActivityItem = {
      ...item,
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    writeStorage(STORAGE_KEYS.ACTIVITIES, activities.slice(0, 50)); // Keep latest 50
  },

  // Global backup & restore
  exportDataToJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      invoices: this.getInvoices(),
      quotes: this.getQuotes(),
      clients: this.getClients(),
      products: this.getProducts(),
      payments: this.getPayments(),
      settings: this.getSettings(),
      activities: this.getActivities(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDataFromJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.invoices) writeStorage(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.quotes) writeStorage(STORAGE_KEYS.QUOTES, data.quotes);
      if (data.clients) writeStorage(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.products) writeStorage(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.payments) writeStorage(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.settings) writeStorage(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.activities) writeStorage(STORAGE_KEYS.ACTIVITIES, data.activities);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  resetToDemoData(): void {
    writeStorage(STORAGE_KEYS.CLIENTS, SEED_CLIENTS);
    writeStorage(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    writeStorage(STORAGE_KEYS.INVOICES, buildSeedInvoices());
    writeStorage(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    writeStorage(STORAGE_KEYS.QUOTES, buildSeedQuotes());
    writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    writeStorage(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
  },
};
