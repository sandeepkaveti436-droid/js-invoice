import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  Invoice, 
  Quote, 
  Client, 
  Product, 
  PaymentRecord, 
  AppSettings, 
  ActivityItem, 
  NavigationPage 
} from '../types';
import { StorageService, createDefaultSettings } from '../services/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, pass?: string) => Promise<User>;
  signup: (name: string, email: string, pass?: string, companyName?: string, phone?: string) => Promise<{ user: User; verificationToken: string; verificationUrl: string }>;
  verifyEmail: (token: string, email?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  switchUserAccount: (userId: string) => void;

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
  
  // Navigation Shortcuts
  openCreateInvoice: (prefillClientId?: string) => void;
  openEditInvoice: (invoiceId: string) => void;
  openViewInvoice: (invoiceId: string) => void;
  openCreateQuote: (prefillClientId?: string) => void;
  openEditQuote: (quoteId: string) => void;
  openClientDetail: (clientId: string) => void;
  
  // Operations (User-isolated)
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
  clearMyData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  StorageService.init();

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return StorageService.getCurrentUser();
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const [settings, setSettings] = useState<AppSettings>(() => createDefaultSettings());
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Refresh data whenever current user changes
  const refreshData = () => {
    const user = StorageService.getCurrentUser();
    if (!user) {
      setInvoices([]);
      setQuotes([]);
      setClients([]);
      setProducts([]);
      setPayments([]);
      setSettings(createDefaultSettings());
      setActivities([]);
      return;
    }

    setInvoices(StorageService.getInvoices(user.id));
    setQuotes(StorageService.getQuotes(user.id));
    setClients(StorageService.getClients(user.id));
    setProducts(StorageService.getProducts(user.id));
    setPayments(StorageService.getPayments(user.id));
    setSettings(StorageService.getUserSettings(user.id));
    setActivities(StorageService.getActivities(user.id));
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Auth Functions
  const login = async (email: string, pass?: string): Promise<User> => {
    const user = StorageService.loginUser(email, pass);
    setCurrentUser(user);
    return user;
  };

  const signup = async (name: string, email: string, pass?: string, companyName?: string, phone?: string): Promise<{ user: User; verificationToken: string; verificationUrl: string }> => {
    const res = StorageService.registerUser({
      name,
      email,
      password: pass,
      phone,
      companyName,
      provider: 'email',
    });
    return res;
  };

  const verifyEmail = async (token: string, email?: string): Promise<User> => {
    const user = StorageService.verifyEmailToken(token, email);
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async (): Promise<User> => {
    // Generate or login via Google
    const { user } = StorageService.registerUser({
      name: 'Google User',
      email: 'user.google@gmail.com',
      companyName: 'Google Workspace Studio',
      provider: 'google',
    });
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('overview');
    showToast('Signed out successfully', 'info');
  };

  const switchUserAccount = (userId: string) => {
    const users = StorageService.getUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      StorageService.setCurrentUser(target);
      setCurrentUser(target);
      setCurrentView('overview');
    }
  };

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
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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

  // Data Operations (Scoped to currentUser)
  const handleSaveInvoice = (invoice: Invoice): Invoice => {
    const saved = StorageService.saveInvoice(invoice, currentUser?.id);
    refreshData();
    showToast(`Invoice ${saved.number} saved!`, 'success');
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
    const dup = StorageService.duplicateInvoice(id, currentUser?.id);
    if (dup) {
      refreshData();
      showToast(`Invoice duplicated as ${dup.number}`, 'success');
      setActiveInvoiceId(dup.id);
      setCurrentView('invoice_edit');
    }
    return dup;
  };

  const handleSaveQuote = (quote: Quote): Quote => {
    const saved = StorageService.saveQuote(quote, currentUser?.id);
    refreshData();
    showToast(`Quote ${saved.number} saved!`, 'success');
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
    const inv = StorageService.convertQuoteToInvoice(quoteId, currentUser?.id);
    if (inv) {
      refreshData();
      showToast(`Quote converted into Invoice ${inv.number}!`, 'success');
      setActiveInvoiceId(inv.id);
      setCurrentView('invoice_detail');
    }
    return inv;
  };

  const handleSaveClient = (client: Client): Client => {
    const saved = StorageService.saveClient(client, currentUser?.id);
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
    const saved = StorageService.saveProduct(product, currentUser?.id);
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
    const result = StorageService.recordPayment(paymentData, currentUser?.id);
    refreshData();
    showToast(`Payment of ${result.payment.amount} recorded for Invoice ${result.invoice.number}!`, 'success');
    return result;
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    StorageService.saveUserSettings(newSettings, currentUser?.id);
    refreshData();
    showToast('Settings updated successfully', 'success');
  };

  const handleClearMyData = () => {
    if (currentUser) {
      StorageService.clearCurrentUserData(currentUser.id);
      refreshData();
      showToast('All your invoice data was cleared.', 'info');
      setCurrentView('overview');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: currentUser?.role === 'admin',
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        signup,
        verifyEmail,
        loginWithGoogle,
        logout,
        switchUserAccount,
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
        clearMyData: handleClearMyData,
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
