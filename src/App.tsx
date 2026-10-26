import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InvoicesListPage } from './pages/InvoicesListPage';
import { InvoiceEditorPage } from './pages/InvoiceEditorPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuotesPage } from './pages/QuotesPage';
import { QuoteEditorPage } from './pages/QuoteEditorPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PublicInvoiceView } from './pages/PublicInvoiceView';
import { AuthPage } from './pages/AuthPage';
import { AuthModal } from './components/auth/AuthModal';

const MainViewRouter: React.FC = () => {
  const { currentView, isAdmin } = useApp();

  switch (currentView) {
    case 'overview':
      return <DashboardPage />;
    case 'invoices':
      return <InvoicesListPage />;
    case 'invoice_create':
      return <InvoiceEditorPage isEditing={false} />;
    case 'invoice_edit':
      return <InvoiceEditorPage isEditing={true} />;
    case 'invoice_detail':
      return <InvoiceDetailPage />;
    case 'clients':
      return <ClientsPage />;
    case 'client_detail':
      return <ClientDetailPage />;
    case 'products':
      return <ProductsPage />;
    case 'quotes':
      return <QuotesPage />;
    case 'quote_create':
      return <QuoteEditorPage isEditing={false} />;
    case 'quote_edit':
      return <QuoteEditorPage isEditing={true} />;
    case 'payments':
      return <PaymentsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'templates':
      return <TemplatesPage />;
    case 'settings':
      return <SettingsPage />;
    case 'admin':
      return <AdminDashboardPage />;
    default:
      return <DashboardPage />;
  }
};

export const AppContent: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser } = useApp();
  const [publicInvoiceId, setPublicInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'public_invoice' && params.get('id')) {
      setPublicInvoiceId(params.get('id'));
    }
  }, []);

  if (publicInvoiceId) {
    return (
      <PublicInvoiceView
        invoiceId={publicInvoiceId}
        onExit={() => {
          setPublicInvoiceId(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // Full-page authentication screen when not logged in
  if (!currentUser) {
    return <AuthPage />;
  }

  // Main application workspace (rendered only when user is logged in)
  return (
    <AppLayout>
      <MainViewRouter />

      {/* Switch Account / Secondary Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          canClose={true}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </AppLayout>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
