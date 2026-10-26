import { 
  User,
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
  USERS: 'js_invoice_users_v2',
  CURRENT_USER: 'js_invoice_current_user_v2',
  INVOICES: 'js_invoice_invoices_v2',
  QUOTES: 'js_invoice_quotes_v2',
  CLIENTS: 'js_invoice_clients_v2',
  PRODUCTS: 'js_invoice_products_v2',
  PAYMENTS: 'js_invoice_payments_v2',
  SETTINGS: 'js_invoice_settings_v2',
  ACTIVITIES: 'js_invoice_activities_v2',
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

export const createDefaultBusiness = (user?: Partial<User>): BusinessProfile => ({
  id: 'biz_' + (user?.id || 'default'),
  userId: user?.id,
  name: user?.companyName || user?.name || 'JS Invoice Studio',
  logoUrl: '',
  email: user?.email || 'contact@jsinvoice.com',
  phone: '',
  website: '',
  taxId: '',
  stateCode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  bankDetails: {
    bankName: '',
    accountHolder: user?.companyName || user?.name || '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    iban: '',
    upiId: '',
    additionalInfo: 'Please mention invoice reference during payment.',
  },
  signatureText: user?.name || 'Authorized Signatory',
  defaultCurrency: 'USD',
});

export const createDefaultSettings = (user?: Partial<User>): AppSettings => ({
  userId: user?.id,
  business: createDefaultBusiness(user),
  invoiceDefaults: {
    prefix: 'INV-2026-',
    nextNumber: 1,
    title: 'Tax Invoice',
    paymentTerms: 'Net 30',
    dueInDays: 30,
    defaultCurrency: 'USD',
    defaultTaxRate: 10,
    pricingMode: 'exclusive',
    gstEnabled: false,
    defaultNotes: 'Thank you for your business. We appreciate collaborating with you!',
    defaultTerms: 'Payment is due within 30 days of invoice date. Overdue balances may incur a 1.5% late fee.',
    defaultTemplate: 'modern',
    accentColor: '#4F46E5',
  },
  appearance: {
    fontFamily: 'Inter',
    accentColor: '#4F46E5',
    sidebarCollapsed: false,
  },
  emailConfig: {
    senderName: user?.companyName || 'JS Invoice Billing',
    senderEmail: user?.email || 'billing@jsinvoice.com',
    replyTo: user?.email || 'support@jsinvoice.com',
    apiKey: '',
    provider: 'sandbox',
    invoiceSubjectTemplate: 'Invoice {invoice_number} from ' + (user?.companyName || 'JS Invoice'),
    invoiceBodyTemplate: 'Hi {client_name},\n\nPlease find attached invoice {invoice_number} for {total_amount}.\nDue date: {due_date}.\n\nThank you for choosing JS Invoice!\nBest regards,\n' + (user?.name || 'Billing Team'),
  },
  paymentGatewayConfig: {
    enabled: false,
    provider: 'stripe',
    publishableKey: '',
    testMode: true,
  },
});

// Built-in Admin Account for Platform Management
const SEED_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'JS Invoice Admin',
    email: 'admin@jsinvoice.com',
    companyName: 'JS Invoice Operations Ltd',
    avatarUrl: '',
    provider: 'email',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    status: 'active',
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
 * Storage Service - Real user isolation and clean state without dummy data
 */
export const StorageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      writeStorage(STORAGE_KEYS.USERS, SEED_USERS);
    }
  },

  // Auth & User Management
  getUsers(): User[] {
    this.init();
    return readStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },

  getCurrentUser(): User | null {
    return readStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: User | null): void {
    writeStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  registerUser(payload: { name: string; email: string; companyName?: string; provider?: 'email' | 'google' }): User {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      // Return existing or update last login
      existing.lastLoginAt = new Date().toISOString();
      writeStorage(STORAGE_KEYS.USERS, users);
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      companyName: payload.companyName?.trim() || `${payload.name}'s Studio`,
      provider: payload.provider || 'email',
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
    };

    users.push(newUser);
    writeStorage(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newUser);

    // Initialize user's settings
    const settings = this.getUserSettings(newUser.id);
    writeStorage(STORAGE_KEYS.SETTINGS + '_' + newUser.id, settings);

    return newUser;
  },

  loginUser(email: string): User | null {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;

    if (found.status === 'suspended') {
      throw new Error('This account has been suspended by an administrator.');
    }

    found.lastLoginAt = new Date().toISOString();
    writeStorage(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(found);
    return found;
  },

  toggleUserStatus(userId: string): boolean {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return false;
    target.status = target.status === 'active' ? 'suspended' : 'active';
    writeStorage(STORAGE_KEYS.USERS, users);
    return true;
  },

  deleteUser(userId: string): boolean {
    let users = this.getUsers();
    if (userId === 'user_admin') return false; // Prevent deleting master admin
    users = users.filter(u => u.id !== userId);
    writeStorage(STORAGE_KEYS.USERS, users);
    return true;
  },

  // Invoices (Isolated per User)
  getAllInvoicesRaw(): Invoice[] {
    return readStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
  },

  getInvoices(userId?: string): Invoice[] {
    const all = this.getAllInvoicesRaw();
    if (!userId) {
      const current = this.getCurrentUser();
      if (!current) return [];
      userId = current.id;
    }

    const userInvoices = all.filter(i => i.userId === userId);
    const today = new Date().toISOString().split('T')[0];

    return userInvoices.map(inv => {
      if ((inv.status === 'sent' || inv.status === 'partially_paid') && inv.dueDate < today && inv.balanceDue > 0) {
        return { ...inv, status: 'overdue' as const };
      }
      return inv;
    });
  },

  getInvoiceById(id: string): Invoice | undefined {
    return this.getAllInvoicesRaw().find(i => i.id === id);
  },

  saveInvoice(invoice: Invoice, userId?: string): Invoice {
    const current = this.getCurrentUser();
    const effectiveUserId = userId || invoice.userId || current?.id || 'user_guest';

    const allInvoices = this.getAllInvoicesRaw();
    const index = allInvoices.findIndex(i => i.id === invoice.id);
    const now = new Date().toISOString();

    const updatedInvoice: Invoice = {
      ...invoice,
      userId: effectiveUserId,
      updatedAt: now,
    };

    if (index >= 0) {
      allInvoices[index] = updatedInvoice;
    } else {
      updatedInvoice.createdAt = now;
      allInvoices.unshift(updatedInvoice);

      // Increment sequence for this user's settings
      const settings = this.getUserSettings(effectiveUserId);
      settings.invoiceDefaults.nextNumber += 1;
      this.saveUserSettings(settings, effectiveUserId);

      this.addActivity({
        userId: effectiveUserId,
        type: 'invoice_created',
        title: 'Invoice Created',
        description: `Invoice ${updatedInvoice.number} was created for ${updatedInvoice.client?.name || 'Client'}.`,
        entityId: updatedInvoice.id,
        entityType: 'invoice',
      });
    }

    writeStorage(STORAGE_KEYS.INVOICES, allInvoices);
    return updatedInvoice;
  },

  deleteInvoice(id: string): boolean {
    const allInvoices = this.getAllInvoicesRaw();
    const filtered = allInvoices.filter(i => i.id !== id);
    if (filtered.length !== allInvoices.length) {
      writeStorage(STORAGE_KEYS.INVOICES, filtered);
      return true;
    }
    return false;
  },

  duplicateInvoice(id: string, userId?: string): Invoice | null {
    const existing = this.getInvoiceById(id);
    if (!existing) return null;

    const current = this.getCurrentUser();
    const effectiveUserId = userId || current?.id || existing.userId;
    const settings = this.getUserSettings(effectiveUserId);

    const newNumber = generateInvoiceNumber(
      settings.invoiceDefaults.prefix, 
      settings.invoiceDefaults.nextNumber
    );

    const duplicated: Invoice = {
      ...existing,
      id: 'inv_' + Date.now(),
      userId: effectiveUserId,
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

    return this.saveInvoice(duplicated, effectiveUserId);
  },

  // Quotes (Isolated per User)
  getAllQuotesRaw(): Quote[] {
    return readStorage<Quote[]>(STORAGE_KEYS.QUOTES, []);
  },

  getQuotes(userId?: string): Quote[] {
    const all = this.getAllQuotesRaw();
    if (!userId) {
      const current = this.getCurrentUser();
      if (!current) return [];
      userId = current.id;
    }
    return all.filter(q => q.userId === userId);
  },

  saveQuote(quote: Quote, userId?: string): Quote {
    const current = this.getCurrentUser();
    const effectiveUserId = userId || quote.userId || current?.id || 'user_guest';

    const all = this.getAllQuotesRaw();
    const index = all.findIndex(q => q.id === quote.id);
    const now = new Date().toISOString();

    const updatedQuote: Quote = {
      ...quote,
      userId: effectiveUserId,
      updatedAt: now,
    };

    if (index >= 0) {
      all[index] = updatedQuote;
    } else {
      updatedQuote.createdAt = now;
      all.unshift(updatedQuote);

      this.addActivity({
        userId: effectiveUserId,
        type: 'quote_created',
        title: 'Quote Created',
        description: `Estimate ${updatedQuote.number} was created for ${updatedQuote.client?.name || 'Client'}.`,
        entityId: updatedQuote.id,
        entityType: 'quote',
      });
    }

    writeStorage(STORAGE_KEYS.QUOTES, all);
    return updatedQuote;
  },

  deleteQuote(id: string): boolean {
    const all = this.getAllQuotesRaw();
    const filtered = all.filter(q => q.id !== id);
    if (filtered.length !== all.length) {
      writeStorage(STORAGE_KEYS.QUOTES, filtered);
      return true;
    }
    return false;
  },

  convertQuoteToInvoice(quoteId: string, userId?: string): Invoice | null {
    const allQuotes = this.getAllQuotesRaw();
    const quote = allQuotes.find(q => q.id === quoteId);
    if (!quote) return null;

    if (quote.convertedInvoiceId) {
      const existing = this.getInvoiceById(quote.convertedInvoiceId);
      if (existing) return existing;
    }

    const current = this.getCurrentUser();
    const effectiveUserId = userId || quote.userId || current?.id;
    const settings = this.getUserSettings(effectiveUserId);

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
      userId: effectiveUserId,
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
      footerText: 'Generated electronically with JS Invoice.',
      status: 'draft',
      templateConfig: quote.templateConfig,
      visibility: quote.visibility,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedInvoice = this.saveInvoice(newInvoice, effectiveUserId);

    quote.status = 'converted';
    quote.convertedInvoiceId = savedInvoice.id;
    this.saveQuote(quote, effectiveUserId);

    this.addActivity({
      userId: effectiveUserId,
      type: 'quote_converted',
      title: 'Quote Converted',
      description: `Quote ${quote.number} was converted into Invoice ${savedInvoice.number}.`,
      entityId: savedInvoice.id,
      entityType: 'invoice',
    });

    return savedInvoice;
  },

  // Clients (Isolated per User)
  getAllClientsRaw(): Client[] {
    return readStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
  },

  getClients(userId?: string): Client[] {
    const all = this.getAllClientsRaw();
    if (!userId) {
      const current = this.getCurrentUser();
      if (!current) return [];
      userId = current.id;
    }
    return all.filter(c => c.userId === userId && !c.archived);
  },

  saveClient(client: Client, userId?: string): Client {
    const current = this.getCurrentUser();
    const effectiveUserId = userId || client.userId || current?.id || 'user_guest';

    const all = this.getAllClientsRaw();
    const index = all.findIndex(c => c.id === client.id);

    const updatedClient: Client = {
      ...client,
      userId: effectiveUserId,
    };

    if (index >= 0) {
      all[index] = updatedClient;
    } else {
      updatedClient.id = client.id || 'cli_' + Date.now();
      updatedClient.createdAt = new Date().toISOString();
      all.unshift(updatedClient);

      this.addActivity({
        userId: effectiveUserId,
        type: 'client_added',
        title: 'New Client Added',
        description: `Added client "${updatedClient.name}" (${updatedClient.companyName || updatedClient.email}).`,
        entityId: updatedClient.id,
        entityType: 'client',
      });
    }

    writeStorage(STORAGE_KEYS.CLIENTS, all);
    return updatedClient;
  },

  deleteClient(id: string): { success: boolean; message?: string } {
    const invoices = this.getAllInvoicesRaw();
    const hasInvoices = invoices.some(i => i.client?.id === id);

    const clients = this.getAllClientsRaw();
    if (hasInvoices) {
      const index = clients.findIndex(c => c.id === id);
      if (index >= 0) {
        clients[index].archived = true;
        writeStorage(STORAGE_KEYS.CLIENTS, clients);
        return { success: true, message: 'Client has existing invoices. Safely archived client.' };
      }
    }

    const filtered = clients.filter(c => c.id !== id);
    writeStorage(STORAGE_KEYS.CLIENTS, filtered);
    return { success: true, message: 'Client deleted successfully.' };
  },

  getClientMetrics(clientId: string, userId?: string) {
    const userInvoices = this.getInvoices(userId).filter(i => i.client?.id === clientId && i.status !== 'cancelled');
    const totalInvoiced = userInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPaid = userInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const balanceDue = userInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
    return {
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      balanceDue: Math.round(balanceDue * 100) / 100,
      invoiceCount: userInvoices.length,
      invoices: userInvoices,
    };
  },

  // Products (Isolated per User)
  getAllProductsRaw(): Product[] {
    return readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  getProducts(userId?: string): Product[] {
    const all = this.getAllProductsRaw();
    if (!userId) {
      const current = this.getCurrentUser();
      if (!current) return [];
      userId = current.id;
    }
    return all.filter(p => p.userId === userId && p.status !== 'archived');
  },

  saveProduct(product: Product, userId?: string): Product {
    const current = this.getCurrentUser();
    const effectiveUserId = userId || product.userId || current?.id || 'user_guest';

    const all = this.getAllProductsRaw();
    const index = all.findIndex(p => p.id === product.id);

    const updatedProduct: Product = {
      ...product,
      userId: effectiveUserId,
    };

    if (index >= 0) {
      all[index] = updatedProduct;
    } else {
      updatedProduct.id = product.id || 'prod_' + Date.now();
      updatedProduct.createdAt = new Date().toISOString();
      all.unshift(updatedProduct);
    }

    writeStorage(STORAGE_KEYS.PRODUCTS, all);
    return updatedProduct;
  },

  deleteProduct(id: string): boolean {
    const all = this.getAllProductsRaw();
    const filtered = all.filter(p => p.id !== id);
    if (filtered.length !== all.length) {
      writeStorage(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  },

  // Payments (Isolated per User)
  getAllPaymentsRaw(): PaymentRecord[] {
    return readStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
  },

  getPayments(userId?: string): PaymentRecord[] {
    const all = this.getAllPaymentsRaw();
    if (!userId) {
      const current = this.getCurrentUser();
      if (!current) return [];
      userId = current.id;
    }
    return all.filter(p => p.userId === userId);
  },

  recordPayment(record: Omit<PaymentRecord, 'id' | 'createdAt'>, userId?: string): { payment: PaymentRecord; invoice: Invoice } {
    const invoice = this.getInvoiceById(record.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const paymentAmount = Math.round(record.amount * 100) / 100;
    if (paymentAmount <= 0) throw new Error('Payment amount must be greater than zero');

    const current = this.getCurrentUser();
    const effectiveUserId = userId || invoice.userId || current?.id;

    const payment: PaymentRecord = {
      ...record,
      id: 'pay_' + Date.now(),
      userId: effectiveUserId,
      amount: paymentAmount,
      createdAt: new Date().toISOString(),
    };

    const payments = this.getAllPaymentsRaw();
    payments.unshift(payment);
    writeStorage(STORAGE_KEYS.PAYMENTS, payments);

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

    const updatedInvoice = this.saveInvoice(invoice, effectiveUserId);

    this.addActivity({
      userId: effectiveUserId,
      type: 'payment_received',
      title: 'Payment Recorded',
      description: `Recorded payment of ${payment.amount} (${payment.method}) for Invoice ${invoice.number}.`,
      entityId: invoice.id,
      entityType: 'payment',
    });

    return { payment, invoice: updatedInvoice };
  },

  // Settings
  getUserSettings(userId?: string): AppSettings {
    const current = this.getCurrentUser();
    const id = userId || current?.id || 'user_guest';
    const key = STORAGE_KEYS.SETTINGS + '_' + id;
    const existing = readStorage<AppSettings | null>(key, null);
    if (existing) return existing;
    return createDefaultSettings(current || undefined);
  },

  saveUserSettings(settings: AppSettings, userId?: string): AppSettings {
    const current = this.getCurrentUser();
    const id = userId || current?.id || 'user_guest';
    const key = STORAGE_KEYS.SETTINGS + '_' + id;
    writeStorage(key, settings);
    return settings;
  },

  // Activities
  getAllActivitiesRaw(): ActivityItem[] {
    return readStorage<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, []);
  },

  getActivities(userId?: string): ActivityItem[] {
    const all = this.getAllActivitiesRaw();
    if (!userId) {
      const current = this.getCurrentUser();
      if (!current) return [];
      userId = current.id;
    }
    return all.filter(a => a.userId === userId);
  },

  addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const all = this.getAllActivitiesRaw();
    const newActivity: ActivityItem = {
      ...item,
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    all.unshift(newActivity);
    writeStorage(STORAGE_KEYS.ACTIVITIES, all.slice(0, 100));
  },

  // Admin Analytics & Platform Statistics
  getPlatformStats() {
    const users = this.getUsers();
    const allInvoices = this.getAllInvoicesRaw();
    const allPayments = this.getAllPaymentsRaw();

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalInvoicesCreated = allInvoices.length;
    const totalPlatformGmv = allInvoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.grandTotal : 0), 0);
    const totalCollectionsSettled = allPayments.reduce((acc, p) => acc + p.amount, 0);

    // User breakdown list with their individual invoice counts and GMV
    const userStats = users.map(user => {
      const userInvoices = allInvoices.filter(i => i.userId === user.id);
      const invoicedSum = userInvoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.grandTotal : 0), 0);
      const paidSum = userInvoices.reduce((acc, i) => acc + i.amountPaid, 0);

      return {
        ...user,
        invoicesCount: userInvoices.length,
        totalInvoiced: Math.round(invoicedSum * 100) / 100,
        totalPaid: Math.round(paidSum * 100) / 100,
      };
    });

    return {
      totalUsers,
      activeUsers,
      totalInvoicesCreated,
      totalPlatformGmv: Math.round(totalPlatformGmv * 100) / 100,
      totalCollectionsSettled: Math.round(totalCollectionsSettled * 100) / 100,
      userStats,
    };
  },

  // Export JSON backup for user
  exportDataToJson(userId?: string): string {
    const current = this.getCurrentUser();
    const id = userId || current?.id;
    const backup = {
      version: '2.0',
      brand: 'JS Invoice',
      exportedAt: new Date().toISOString(),
      user: current,
      invoices: this.getInvoices(id),
      quotes: this.getQuotes(id),
      clients: this.getClients(id),
      products: this.getProducts(id),
      payments: this.getPayments(id),
      settings: this.getUserSettings(id),
      activities: this.getActivities(id),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDataFromJson(jsonStr: string, userId?: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      const current = this.getCurrentUser();
      const id = userId || current?.id;

      if (data.invoices && Array.isArray(data.invoices)) {
        const existing = this.getAllInvoicesRaw().filter(i => i.userId !== id);
        const imported = data.invoices.map((i: any) => ({ ...i, userId: id }));
        writeStorage(STORAGE_KEYS.INVOICES, [...imported, ...existing]);
      }
      if (data.clients && Array.isArray(data.clients)) {
        const existing = this.getAllClientsRaw().filter(c => c.userId !== id);
        const imported = data.clients.map((c: any) => ({ ...c, userId: id }));
        writeStorage(STORAGE_KEYS.CLIENTS, [...imported, ...existing]);
      }
      if (data.products && Array.isArray(data.products)) {
        const existing = this.getAllProductsRaw().filter(p => p.userId !== id);
        const imported = data.products.map((p: any) => ({ ...p, userId: id }));
        writeStorage(STORAGE_KEYS.PRODUCTS, [...imported, ...existing]);
      }
      if (data.settings) {
        this.saveUserSettings(data.settings, id);
      }
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  // Reset current user's data to clean slate
  clearCurrentUserData(userId?: string): void {
    const current = this.getCurrentUser();
    const id = userId || current?.id;
    if (!id) return;

    writeStorage(STORAGE_KEYS.INVOICES, this.getAllInvoicesRaw().filter(i => i.userId !== id));
    writeStorage(STORAGE_KEYS.QUOTES, this.getAllQuotesRaw().filter(q => q.userId !== id));
    writeStorage(STORAGE_KEYS.CLIENTS, this.getAllClientsRaw().filter(c => c.userId !== id));
    writeStorage(STORAGE_KEYS.PRODUCTS, this.getAllProductsRaw().filter(p => p.userId !== id));
    writeStorage(STORAGE_KEYS.PAYMENTS, this.getAllPaymentsRaw().filter(p => p.userId !== id));
    writeStorage(STORAGE_KEYS.ACTIVITIES, this.getAllActivitiesRaw().filter(a => a.userId !== id));
  },
};
