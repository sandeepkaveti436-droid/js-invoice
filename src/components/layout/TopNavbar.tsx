import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  HelpCircle, 
  User, 
  Plus, 
  FileText, 
  FileCheck, 
  Users, 
  Package, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMobileMenuToggle }) => {
  const { 
    currentView, 
    setCurrentView, 
    openCreateInvoice, 
    openCreateQuote, 
    openEditInvoice,
    openClientDetail,
    invoices, 
    clients, 
    quotes, 
    activities,
    globalSearch, 
    setGlobalSearch,
    resetDemoData
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickNew, setShowQuickNew] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setShowQuickNew(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Search Matches
  const filteredInvoices = globalSearch.trim()
    ? invoices.filter(
        i =>
          i.number.toLowerCase().includes(globalSearch.toLowerCase()) ||
          i.client?.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
          i.client?.companyName?.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredClients = globalSearch.trim()
    ? clients.filter(
        c =>
          c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
          c.companyName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredQuotes = globalSearch.trim()
    ? quotes.filter(
        q =>
          q.number.toLowerCase().includes(globalSearch.toLowerCase()) ||
          q.client?.name?.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchMatches = filteredInvoices.length > 0 || filteredClients.length > 0 || filteredQuotes.length > 0;

  // Breadcrumbs text helper
  const getPageInfo = () => {
    switch (currentView) {
      case 'overview':
        return { title: 'Dashboard Overview', breadcrumb: 'Overview' };
      case 'invoices':
        return { title: 'Invoices', breadcrumb: 'Invoices' };
      case 'invoice_create':
        return { title: 'Create New Invoice', breadcrumb: 'Invoices / New' };
      case 'invoice_edit':
        return { title: 'Edit Invoice', breadcrumb: 'Invoices / Edit' };
      case 'invoice_detail':
        return { title: 'Invoice Details', breadcrumb: 'Invoices / Detail' };
      case 'clients':
        return { title: 'Client Management', breadcrumb: 'Clients' };
      case 'client_detail':
        return { title: 'Client Details & Statements', breadcrumb: 'Clients / Profile' };
      case 'products':
        return { title: 'Products & Services Catalog', breadcrumb: 'Products & Services' };
      case 'quotes':
        return { title: 'Estimates & Quotes', breadcrumb: 'Estimates' };
      case 'quote_create':
        return { title: 'Create New Estimate', breadcrumb: 'Estimates / New' };
      case 'quote_edit':
        return { title: 'Edit Estimate', breadcrumb: 'Estimates / Edit' };
      case 'payments':
        return { title: 'Payment Records & Ledger', breadcrumb: 'Payments' };
      case 'reports':
        return { title: 'Financial Reports & Analytics', breadcrumb: 'Reports' };
      case 'templates':
        return { title: 'Invoice Template Gallery', breadcrumb: 'Templates' };
      case 'settings':
        return { title: 'System & Business Settings', breadcrumb: 'Settings' };
      default:
        return { title: 'InvoiceFlow SaaS', breadcrumb: 'Home' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="hover:text-slate-600 cursor-pointer" onClick={() => setCurrentView('overview')}>App</span>
              <span>/</span>
              <span className="text-slate-600">{pageInfo.breadcrumb}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Center: Interactive Global Search */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoices, clients, quotes..."
              value={globalSearch}
              onChange={e => {
                setGlobalSearch(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Search Popover Results */}
          {showSearchResults && globalSearch.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-dropdown border border-slate-200 p-2 z-50 text-xs divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {hasSearchMatches ? (
                <>
                  {filteredInvoices.length > 0 && (
                    <div className="py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 block">
                        Invoices
                      </span>
                      {filteredInvoices.map(inv => (
                        <button
                          key={inv.id}
                          onClick={() => {
                            openEditInvoice(inv.id);
                            setShowSearchResults(false);
                            setGlobalSearch('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-mono font-bold text-slate-900">{inv.number}</span>
                            <span className="text-slate-500 truncate max-w-[150px]">{inv.client?.name}</span>
                          </div>
                          <span className="text-[11px] capitalize px-2 py-0.5 rounded-full bg-slate-100 font-medium">
                            {inv.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredClients.length > 0 && (
                    <div className="py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 block">
                        Clients
                      </span>
                      {filteredClients.map(cli => (
                        <button
                          key={cli.id}
                          onClick={() => {
                            openClientDetail(cli.id);
                            setShowSearchResults(false);
                            setGlobalSearch('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-bold text-slate-900">{cli.name}</span>
                            {cli.companyName && <span className="text-slate-400">({cli.companyName})</span>}
                          </div>
                          <span className="text-slate-400">{cli.email}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredQuotes.length > 0 && (
                    <div className="py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 block">
                        Estimates
                      </span>
                      {filteredQuotes.map(q => (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentView('quotes');
                            setShowSearchResults(false);
                            setGlobalSearch('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-mono font-bold text-slate-900">{q.number}</span>
                            <span className="text-slate-500 truncate max-w-[150px]">{q.client?.name}</span>
                          </div>
                          <span className="text-slate-400 font-mono">${q.grandTotal}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No records match "{globalSearch}". Try another keyword.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick + New, Notifications, Help, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Dropdown */}
          <div ref={quickRef} className="relative">
            <button
              onClick={() => setShowQuickNew(!showQuickNew)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showQuickNew && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-dropdown border border-slate-200 p-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    openCreateInvoice();
                    setShowQuickNew(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Invoice</span>
                </button>

                <button
                  onClick={() => {
                    openCreateQuote();
                    setShowQuickNew(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-amber-500" />
                  <span>Estimate / Quote</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('clients');
                    setShowQuickNew(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Client</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('products');
                    setShowQuickNew(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                >
                  <Package className="w-4 h-4 text-blue-500" />
                  <span>Product / Service</span>
                </button>
              </div>
            )}
          </div>

          {/* Activity Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activities.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-dropdown border border-slate-200 z-50 text-xs overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900">Recent Activity</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {activities.length} events
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {activities.slice(0, 8).map(act => (
                    <div key={act.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-[11px]">{act.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDate(act.timestamp, 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => {
                      setCurrentView('reports');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Complete Audit Trail & Reports
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Modal Trigger */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Help & Guides"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Account Menu */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50">
                AR
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-1" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-dropdown border border-slate-200 p-2 z-50 text-xs divide-y divide-slate-100">
                <div className="px-3 py-2">
                  <p className="font-bold text-slate-900">Alex Rivera</p>
                  <p className="text-[11px] text-slate-400">Owner • Nexus Craft Studio</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Business Profile & Settings
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('templates');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Manage Templates
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (confirm('Reset application data back to default demo records?')) {
                        resetDemoData();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Demo Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-preview border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">InvoiceFlow Quick Reference</h3>
                  <p className="text-xs text-slate-400">Everything you need to create invoices in under 2 minutes</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Instant Invoice Creation
                </h4>
                <p>
                  Click <strong>+ Create Invoice</strong> anywhere. Select or type a client, add line items from your product library, adjust taxes or discounts, and watch the live A4 preview update simultaneously!
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  6 Original Professional Templates
                </h4>
                <p>
                  Switch between <strong>Modern Business</strong>, <strong>Minimal Professional</strong>, <strong>Elegant Freelancer</strong>, <strong>Creative Agency</strong>, <strong>Corporate Classic</strong>, and <strong>GST Tax Invoice</strong> on the fly without losing entered data.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  PDF Export & Native Clean Print
                </h4>
                <p>
                  Click <strong>Download PDF</strong> for genuine high-resolution A4 vector PDF files, or <strong>Print</strong> for formatted clean printer output with no browser chrome.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
