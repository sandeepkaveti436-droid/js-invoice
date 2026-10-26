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
import { isSupabaseConfigured } from '../services/supabaseClient';
import { SupabaseSync } from '../services/supabaseSync';

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

  // Admin Authority & User Management
  adminMetrics: ReturnType<typeof StorageService.getAdminPlatformMetrics> | null;
  refreshAdminMetrics: () => void;
  adminCreateUser: (payload: { name: string; email: string; password?: string; phone?: string; companyName?: string; role?: 'user' | 'admin'; autoVerify?: boolean }) => User;
  adminDeleteUser: (userId: string) => boolean;
  adminToggleUserStatus: (userId: string) => boolean;
  adminVerifyUser: (userId: string) => boolean;
  adminResetUserPassword: (userId: string, newPass: string) => boolean;
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

  // Refresh data whenever current user changes (with offline-first local + cloud sync)
  const refreshData = async () => {
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

    // 1. Instant local read for zero-delay UI response
    setInvoices(StorageService.getInvoices(user.id));
    setQuotes(StorageService.getQuotes(user.id));
    setClients(StorageService.getClients(user.id));
    setProducts(StorageService.getProducts(user.id));
    setPayments(StorageService.getPayments(user.id));
    setSettings(StorageService.getUserSettings(user.id));
    setActivities(StorageService.getActivities(user.id));

    // 2. Seamless cloud sync from Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        const cloudInvoices = await SupabaseSync.fetchInvoices(user.id);
        if (cloudInvoices && cloudInvoices.length > 0) {
          cloudInvoices.forEach(inv => StorageService.saveInvoice(inv, user.id));
          setInvoices(StorageService.getInvoices(user.id));
        }

        const cloudClients = await SupabaseSync.fetchClients(user.id);
        if (cloudClients && cloudClients.length > 0) {
          cloudClients.forEach(c => StorageService.saveClient(c, user.id));
          setClients(StorageService.getClients(user.id));
        }

        const cloudPayments = await SupabaseSync.fetchPayments(user.id);
        if (cloudPayments && cloudPayments.length > 0) {
          setPayments(StorageService.getPayments(user.id));
        }
      } catch (err) {
        console.warn('Background Supabase sync error:', err);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Auth Functions
  const login = async (email: string, pass?: string): Promise<User> => {
    const user = StorageService.loginUser(email, pass);
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin_dashboard');
    }
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
    throw new Error('Please enter your official Google account details in the registration form.');
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

  // Data Operations (Scoped to currentUser with background cloud sync)
  const handleSaveInvoice = (invoice: Invoice): Invoice => {
    const saved = StorageService.saveInvoice(invoice, currentUser?.id);
    refreshData();
    showToast(`Invoice ${saved.number} saved!`, 'success');
    SupabaseSync.upsertInvoice(saved).catch(() => {});
    return saved;
  };

  const handleDeleteInvoice = (id: string): boolean => {
    const success = StorageService.deleteInvoice(id);
    if (success) {
      refreshData();
      showToast('Invoice deleted', 'info');
      SupabaseSync.deleteInvoice(id).catch(() => {});
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
      SupabaseSync.upsertInvoice(dup).catch(() => {});
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
      SupabaseSync.upsertInvoice(inv).catch(() => {});
      setActiveInvoiceId(inv.id);
      setCurrentView('invoice_detail');
    }
    return inv;
  };

  const handleSaveClient = (client: Client): Client => {
    const saved = StorageService.saveClient(client, currentUser?.id);
    refreshData();
    showToast(`Client "${saved.name}" saved!`, 'success');
    SupabaseSync.upsertClient(saved).catch(() => {});
    return saved;
  };

  const handleDeleteClient = (id: string): { success: boolean; message?: string } => {
    const res = StorageService.deleteClient(id);
    refreshData();
    showToast(res.message || 'Client deleted', res.success ? 'info' : 'error');
    if (res.success) {
      SupabaseSync.deleteClient(id).catch(() => {});
    }
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
    SupabaseSync.upsertPayment(result.payment).catch(() => {});
    SupabaseSync.upsertInvoice(result.invoice).catch(() => {});
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

  // Admin Telemetry & User Management
  const [adminMetrics, setAdminMetrics] = useState<ReturnType<typeof StorageService.getAdminPlatformMetrics> | null>(() => {
    return StorageService.getCurrentUser()?.role === 'admin' ? StorageService.getAdminPlatformMetrics() : null;
  });

  const refreshAdminMetrics = () => {
    setAdminMetrics(StorageService.getAdminPlatformMetrics());
  };

  const handleAdminCreateUser = (payload: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    companyName?: string;
    role?: 'user' | 'admin';
    autoVerify?: boolean;
  }): User => {
    const newUser = StorageService.adminCreateUser(payload);
    refreshAdminMetrics();
    showToast(`User "${newUser.name}" created successfully!`, 'success');
    return newUser;
  };

  const handleAdminDeleteUser = (userId: string): boolean => {
    try {
      const ok = StorageService.adminDeleteUser(userId);
      refreshAdminMetrics();
      showToast('User account and related data removed permanently.', 'info');
      return ok;
    } catch (e: any) {
      showToast(e.message || 'Cannot delete user', 'error');
      return false;
    }
  };

  const handleAdminToggleUserStatus = (userId: string): boolean => {
    try {
      const ok = StorageService.adminToggleUserStatus(userId);
      refreshAdminMetrics();
      showToast('User account status updated.', 'info');
      return ok;
    } catch (e: any) {
      showToast(e.message || 'Cannot update user status', 'error');
      return false;
    }
  };

  const handleAdminVerifyUser = (userId: string): boolean => {
    const ok = StorageService.adminVerifyUser(userId);
    refreshAdminMetrics();
    showToast('User account verified & activated.', 'success');
    return ok;
  };

  const handleAdminResetUserPassword = (userId: string, newPass: string): boolean => {
    try {
      const ok = StorageService.adminResetUserPassword(userId, newPass);
      showToast('User password updated successfully.', 'success');
      return ok;
    } catch (e: any) {
      showToast(e.message || 'Password reset failed', 'error');
      return false;
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
        adminMetrics,
        refreshAdminMetrics,
        adminCreateUser: handleAdminCreateUser,
        adminDeleteUser: handleAdminDeleteUser,
        adminToggleUserStatus: handleAdminToggleUserStatus,
        adminVerifyUser: handleAdminVerifyUser,
        adminResetUserPassword: handleAdminResetUserPassword,
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
