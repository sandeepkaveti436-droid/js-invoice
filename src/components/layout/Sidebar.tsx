import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  FileCheck, 
  CreditCard, 
  BarChart3, 
  Palette, 
  Settings, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Building2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentView, setCurrentView, openCreateInvoice, invoices, quotes, settings } = useApp();

  const unpaidInvoicesCount = invoices.filter(
    i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue'
  ).length;

  const navItems: { id: NavigationPage; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText, badge: unpaidInvoicesCount || undefined },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'products', label: 'Products & Services', icon: Package },
    { id: 'quotes', label: 'Estimates / Quotes', icon: FileCheck, badge: quotes.filter(q => q.status === 'sent').length || undefined },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: NavigationPage) => {
    setCurrentView(id);
    setMobileOpen(false);
  };

  const isActive = (id: NavigationPage) => {
    if (currentView === id) return true;
    if (id === 'invoices' && (currentView === 'invoice_create' || currentView === 'invoice_edit' || currentView === 'invoice_detail')) return true;
    if (id === 'quotes' && (currentView === 'quote_create' || currentView === 'quote_edit')) return true;
    if (id === 'clients' && currentView === 'client_detail') return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">
                  Invoice<span className="text-indigo-600">Flow</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                  Pro SaaS
                </span>
              </div>
            )}
          </div>

          {/* Close mobile button */}
          <button 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: Create Invoice */}
        <div className="p-4">
          <button
            onClick={() => {
              openCreateInvoice();
              setMobileOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200 group ${
              collapsed ? 'px-0' : ''
            }`}
            title="Create New Invoice"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            {!collapsed && <span>Create Invoice</span>}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors text-left group relative ${
                  active
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />

                {!collapsed && (
                  <span className="flex-1 truncate">
                    {item.label}
                  </span>
                )}

                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    } ${collapsed ? 'absolute top-1 right-2 w-2 h-2 p-0 text-[0px] rounded-full' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Company Profile Footer Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {settings.business?.name || 'Nexus Craft Studio'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {settings.business?.email || 'billing@nexuscraft.design'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-2">
              <div 
                className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs" 
                title={settings.business?.name}
              >
                NC
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <div className="hidden lg:flex justify-end pt-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
