import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Invoice, 
  Quote, 
  Client, 
  Product, 
  PaymentRecord, 
  AppSettings, 
  ActivityItem, 
  NavigationPage 
} from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../services/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentView: NavigationPage;
  setCurrentView: (view: NavigationPage) => void;
  activeInvoiceId: string | null;
  setActiveInvoiceId: (id: string | null) => void;
  activeQuoteId: string | null;
  setActiveQuoteId: (id: string | null) => void;
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  
  invoices: Invoice[];
  quotes: Quote[];
  clients: Client[];
  products: Product[];
  payments: PaymentRecord[];
  settings: AppSettings;
  activities: ActivityItem[];
  
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Quick Actions
  openCreateInvoice: (prefillClientId?: string) => void;
  openEditInvoice: (invoiceId: string) => void;
  openViewInvoice: (invoiceId: string) => void;
  openCreateQuote: (prefillClientId?: string) => void;
  openEditQuote: (quoteId: string) => void;
  openClientDetail: (clientId: string) => void;
  
  // Data Mutators
  refreshData: () => void;
  saveInvoice: (invoice: Invoice) => Invoice;
  deleteInvoice: (id: string) => boolean;
  duplicateInvoice: (id: string) => Invoice | null;
  saveQuote: (quote: Quote) => Quote;
  deleteQuote: (id: string) => boolean;
  convertQuote: (quoteId: string) => Invoice | null;
  saveClient: (client: Client) => Client;
  deleteClient: (id: string) => { success: boolean; message?: string };
  saveProduct: (product: Product) => Product;
  deleteProduct: (id: string) => boolean;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => { payment: PaymentRecord; invoice: Invoice };
  updateSettings: (settings: AppSettings) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<NavigationPage>('overview');
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshData = () => {
    StorageService.init();
    setInvoices(StorageService.getInvoices());
    setQuotes(StorageService.getQuotes());
    setClients(StorageService.getClients());
    setProducts(StorageService.getProducts());
    setPayments(StorageService.getPayments());
    setSettings(StorageService.getSettings());
    setActivities(StorageService.getActivities());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Navigators
  const openCreateInvoice = (prefillClientId?: string) => {
    setActiveInvoiceId(null);
    if (prefillClientId) {
      setActiveClientId(prefillClientId);
    }
    setCurrentView('invoice_create');
  };

  const openEditInvoice = (invoiceId: string) => {
    setActiveInvoiceId(invoiceId);
    setCurrentView('invoice_edit');
  };

  const openViewInvoice = (invoiceId: string) => {
    setActiveInvoiceId(invoiceId);
    setCurrentView('invoice_detail');
  };

  const openCreateQuote = (prefillClientId?: string) => {
    setActiveQuoteId(null);
    if (prefillClientId) {
      setActiveClientId(prefillClientId);
    }
    setCurrentView('quote_create');
  };

  const openEditQuote = (quoteId: string) => {
    setActiveQuoteId(quoteId);
    setCurrentView('quote_edit');
  };

  const openClientDetail = (clientId: string) => {
    setActiveClientId(clientId);
    setCurrentView('client_detail');
  };

  // Data Operations
  const handleSaveInvoice = (invoice: Invoice): Invoice => {
    const saved = StorageService.saveInvoice(invoice);
    refreshData();
    showToast(`Invoice ${saved.number} saved successfully!`, 'success');
    return saved;
  };

  const handleDeleteInvoice = (id: string): boolean => {
    const success = StorageService.deleteInvoice(id);
    if (success) {
      refreshData();
      showToast('Invoice deleted', 'info');
      if (activeInvoiceId === id) {
        setActiveInvoiceId(null);
        setCurrentView('invoices');
      }
    }
    return success;
  };

  const handleDuplicateInvoice = (id: string): Invoice | null => {
    const dup = StorageService.duplicateInvoice(id);
    if (dup) {
      refreshData();
      showToast(`Invoice duplicated as ${dup.number}`, 'success');
      setActiveInvoiceId(dup.id);
      setCurrentView('invoice_edit');
    }
    return dup;
  };

  const handleSaveQuote = (quote: Quote): Quote => {
    const saved = StorageService.saveQuote(quote);
    refreshData();
    showToast(`Quote ${saved.number} saved successfully!`, 'success');
    return saved;
  };

  const handleDeleteQuote = (id: string): boolean => {
    const success = StorageService.deleteQuote(id);
    if (success) {
      refreshData();
      showToast('Quote deleted', 'info');
      if (activeQuoteId === id) {
        setActiveQuoteId(null);
        setCurrentView('quotes');
      }
    }
    return success;
  };

  const handleConvertQuote = (quoteId: string): Invoice | null => {
    const inv = StorageService.convertQuoteToInvoice(quoteId);
    if (inv) {
      refreshData();
      showToast(`Quote converted into Invoice ${inv.number}!`, 'success');
      setActiveInvoiceId(inv.id);
      setCurrentView('invoice_detail');
    }
    return inv;
  };

  const handleSaveClient = (client: Client): Client => {
    const saved = StorageService.saveClient(client);
    refreshData();
    showToast(`Client "${saved.name}" saved!`, 'success');
    return saved;
  };

  const handleDeleteClient = (id: string): { success: boolean; message?: string } => {
    const res = StorageService.deleteClient(id);
    refreshData();
    showToast(res.message || 'Client deleted', res.success ? 'info' : 'error');
    if (activeClientId === id) {
      setActiveClientId(null);
      setCurrentView('clients');
    }
    return res;
  };

  const handleSaveProduct = (product: Product): Product => {
    const saved = StorageService.saveProduct(product);
    refreshData();
    showToast(`Product "${saved.name}" saved!`, 'success');
    return saved;
  };

  const handleDeleteProduct = (id: string): boolean => {
    const success = StorageService.deleteProduct(id);
    if (success) {
      refreshData();
      showToast('Product removed', 'info');
    }
    return success;
  };

  const handleRecordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const result = StorageService.recordPayment(paymentData);
    refreshData();
    showToast(`Payment of ${result.payment.amount} recorded for Invoice ${result.invoice.number}!`, 'success');
    return result;
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    StorageService.saveSettings(newSettings);
    refreshData();
    showToast('Settings updated successfully', 'success');
  };

  const handleResetDemoData = () => {
    StorageService.resetToDemoData();
    refreshData();
    showToast('Application reset to initial demo state', 'info');
    setCurrentView('overview');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeInvoiceId,
        setActiveInvoiceId,
        activeQuoteId,
        setActiveQuoteId,
        activeClientId,
        setActiveClientId,
        invoices,
        quotes,
        clients,
        products,
        payments,
        settings,
        activities,
        globalSearch,
        setGlobalSearch,
        toasts,
        showToast,
        removeToast,
        openCreateInvoice,
        openEditInvoice,
        openViewInvoice,
        openCreateQuote,
        openEditQuote,
        openClientDetail,
        refreshData,
        saveInvoice: handleSaveInvoice,
        deleteInvoice: handleDeleteInvoice,
        duplicateInvoice: handleDuplicateInvoice,
        saveQuote: handleSaveQuote,
        deleteQuote: handleDeleteQuote,
        convertQuote: handleConvertQuote,
        saveClient: handleSaveClient,
        deleteClient: handleDeleteClient,
        saveProduct: handleSaveProduct,
        deleteProduct: handleDeleteProduct,
        recordPayment: handleRecordPayment,
        updateSettings: handleUpdateSettings,
        resetDemoData: handleResetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
