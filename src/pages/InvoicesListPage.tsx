import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  CreditCard, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  Check,
  Crown,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceStatus, User } from '../types';
import { StorageService } from '../services/storage';
import { formatMoney } from '../utils/currency';
import { formatDate, getInvoiceStatusStyle } from '../utils/formatters';
import { exportInvoiceToPdf, printInvoice } from '../utils/pdfExport';
import { RecordPaymentModal } from '../components/invoice/RecordPaymentModal';
import { SendInvoiceModal } from '../components/invoice/SendInvoiceModal';

export const InvoicesListPage: React.FC = () => {
  const { 
    currentUser,
    invoices, 
    openCreateInvoice, 
    openEditInvoice, 
    openViewInvoice, 
    duplicateInvoice, 
    deleteInvoice, 
    saveInvoice,
    showToast 
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const allUsers = useMemo(() => StorageService.getUsers(), []);
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    allUsers.forEach(u => map.set(u.id, u));
    return map;
  }, [allUsers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [tenantFilter, setTenantFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'half_paid' | InvoiceStatus>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'number'>('date_desc');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Quick Dropdowns
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [sendModalInvoice, setSendModalInvoice] = useState<Invoice | null>(null);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

  const handleQuickStatusChange = (inv: Invoice, newStatus: 'paid' | 'unpaid' | 'half_paid' | 'overdue') => {
    let updated: Invoice;
    if (newStatus === 'paid') {
      updated = {
        ...inv,
        status: 'paid',
        amountPaid: inv.grandTotal,
        balanceDue: 0,
        paidAt: new Date().toISOString(),
      };
      showToast(`Invoice ${inv.number} marked as Paid in full!`, 'success');
    } else if (newStatus === 'half_paid') {
      const half = Math.round((inv.grandTotal / 2) * 100) / 100;
      updated = {
        ...inv,
        status: 'partially_paid',
        amountPaid: half,
        balanceDue: Math.round((inv.grandTotal - half) * 100) / 100,
      };
      showToast(`Invoice ${inv.number} set to Half Payment Done (${formatMoney(half, inv.currency)})`, 'info');
    } else if (newStatus === 'overdue') {
      updated = {
        ...inv,
        status: 'overdue',
        amountPaid: 0,
        balanceDue: inv.grandTotal,
      };
      showToast(`Invoice ${inv.number} marked as Overdue`, 'info');
    } else {
      // Unpaid
      updated = {
        ...inv,
        status: 'sent',
        amountPaid: 0,
        balanceDue: inv.grandTotal,
      };
      showToast(`Invoice ${inv.number} marked as Unpaid (Pending)`, 'info');
    }
    saveInvoice(updated);
    setStatusDropdownId(null);
  };

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    let list = invoices.filter(inv => {
      // Tenant filter (Admin)
      if (isAdmin && tenantFilter !== 'all' && inv.userId !== tenantFilter) {
        return false;
      }

      // Search
      const user = inv.userId ? userMap.get(inv.userId) : null;
      const matchesSearch = 
        inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isAdmin && user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (isAdmin && user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status
      let matchesStatus = true;
      if (statusFilter === 'all') {
        matchesStatus = true;
      } else if (statusFilter === 'unpaid') {
        matchesStatus = inv.status === 'draft' || inv.status === 'sent';
      } else if (statusFilter === 'half_paid' || statusFilter === 'partially_paid') {
        matchesStatus = inv.status === 'partially_paid';
      } else {
        matchesStatus = inv.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      } else if (sortBy === 'date_asc') {
        return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      } else if (sortBy === 'amount_desc') {
        return b.grandTotal - a.grandTotal;
      } else if (sortBy === 'number') {
        return a.number.localeCompare(b.number);
      }
      return 0;
    });

    return list;
  }, [invoices, searchTerm, tenantFilter, statusFilter, sortBy, isAdmin, userMap]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection
  const isAllSelected = paginatedInvoices.length > 0 && paginatedInvoices.every(i => selectedInvoiceIds.includes(i.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedInvoiceIds(prev => prev.filter(id => !paginatedInvoices.some(i => i.id === id)));
    } else {
      const pageIds = paginatedInvoices.map(i => i.id);
      setSelectedInvoiceIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkMarkPaid = () => {
    if (!confirm(`Mark ${selectedInvoiceIds.length} invoices as Paid?`)) return;
    selectedInvoiceIds.forEach(id => {
      const inv = invoices.find(i => i.id === id);
      if (inv) {
        saveInvoice({
          ...inv,
          status: 'paid',
          amountPaid: inv.grandTotal,
          balanceDue: 0,
          paidAt: new Date().toISOString(),
        });
      }
    });
    setSelectedInvoiceIds([]);
    showToast(`${selectedInvoiceIds.length} invoices marked as Paid`, 'success');
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedInvoiceIds.length} invoices? This action cannot be undone.`)) return;
    selectedInvoiceIds.forEach(id => deleteInvoice(id));
    setSelectedInvoiceIds([]);
    showToast('Selected invoices deleted', 'info');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Invoice Number', 'Client Name', 'Company', 'Issue Date', 'Due Date', 'Status', 'Currency', 'Grand Total', 'Amount Paid', 'Balance Due'];
    const rows = filteredInvoices.map(i => [
      i.number,
      `"${i.client?.name || ''}"`,
      `"${i.client?.companyName || ''}"`,
      i.issueDate,
      i.dueDate,
      i.status,
      i.currency,
      i.grandTotal,
      i.amountPaid,
      i.balanceDue,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `js_invoice_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isAdmin ? 'Platform Invoices' : 'Invoices Management'}
            </h2>
            {isAdmin && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-purple-600" />
                Super Admin
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAdmin 
              ? 'View, edit, filter, and modify payment status for all tenant invoices across the platform.' 
              : 'Create, track, filter, record payments, and export commercial invoices.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openCreateInvoice()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Super Admin Tenant Quick Filter Callout */}
      {isAdmin && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-purple-950 block">Filter Invoices by User / Tenant</span>
              <span className="text-[11px] text-purple-700">Filter the roster to inspect a single tenant's invoices or view all platform billing</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={tenantFilter}
              onChange={e => {
                setTenantFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">🌐 All Platform Tenants ({invoices.length} invoices)</option>
              {allUsers.map(u => {
                const count = invoices.filter(i => i.userId === u.id).length;
                return (
                  <option key={u.id} value={u.id}>
                    👤 {u.name} ({u.email}) — {count} invoices
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Invoices', count: invoices.length },
            { id: 'paid', label: '🟢 Paid', count: invoices.filter(i => i.status === 'paid').length },
            { id: 'unpaid', label: '🟡 Unpaid', count: invoices.filter(i => i.status === 'draft' || i.status === 'sent').length },
            { id: 'partially_paid', label: '🔵 Half Payment Done', count: invoices.filter(i => i.status === 'partially_paid').length },
            { id: 'overdue', label: '🔴 Overdue', count: invoices.filter(i => i.status === 'overdue').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice number or client..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="number">Invoice Number</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedInvoiceIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950 animate-in fade-in duration-150">
          <span className="font-semibold">
            {selectedInvoiceIds.length} invoice(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkPaid}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              Mark as Paid
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedInvoiceIds([])}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Invoices List - Dual Mode: Mobile Cards (<md) & Desktop Data Table (>=md) */}
      
      {/* Mobile Card List (Visible on phones) */}
      <div className="block md:hidden space-y-3">
        {paginatedInvoices.length > 0 ? (
          paginatedInvoices.map(inv => {
            const isSelected = selectedInvoiceIds.includes(inv.id);
            const statusStyle = getInvoiceStatusStyle(inv.status, inv.dueDate);

            return (
              <div
                key={inv.id}
                className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle space-y-3 transition-colors ${
                  isSelected ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(inv.id)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => openViewInvoice(inv.id)}
                        className="font-mono font-bold text-sm text-slate-900 hover:text-indigo-600"
                      >
                        {inv.number}
                      </button>
                      {isAdmin && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 truncate max-w-[150px]">
                          👤 {userMap.get(inv.userId || '')?.email || inv.userId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => setStatusDropdownId(statusDropdownId === `m_${inv.id}` ? null : `m_${inv.id}`)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
                      <span>{statusStyle.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                    </button>

                    {statusDropdownId === `m_${inv.id}` && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setStatusDropdownId(null)} 
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-left">
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(inv, 'paid')}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between"
                          >
                            <span>🟢 Paid (Full)</span>
                            {inv.status === 'paid' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(inv, 'unpaid')}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-amber-50 text-amber-800 font-semibold flex items-center justify-between"
                          >
                            <span>🟡 Unpaid (Pending)</span>
                            {(inv.status === 'sent' || inv.status === 'draft') && <Check className="w-3.5 h-3.5 text-amber-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(inv, 'half_paid')}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-blue-50 text-blue-800 font-semibold flex items-center justify-between"
                          >
                            <span>🔵 Half Paid (50%)</span>
                            {inv.status === 'partially_paid' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(inv, 'overdue')}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-rose-50 text-rose-800 font-semibold flex items-center justify-between"
                          >
                            <span>🔴 Overdue</span>
                            {inv.status === 'overdue' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between text-xs pt-1 border-t border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">{inv.client?.name || 'Unnamed Client'}</p>
                    {inv.client?.companyName && (
                      <p className="text-[11px] text-slate-400">{inv.client.companyName}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5">Due: {formatDate(inv.dueDate)}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-slate-900 block">
                      {formatMoney(inv.grandTotal, inv.currency)}
                    </span>
                    {inv.balanceDue > 0 && inv.status !== 'draft' && (
                      <span className="text-[11px] font-mono text-amber-700 font-semibold block">
                        Due: {formatMoney(inv.balanceDue, inv.currency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Touch Action Strip */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openViewInvoice(inv.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => openEditInvoice(inv.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {inv.balanceDue > 0 && (
                      <button
                        onClick={() => setPaymentModalInvoice(inv)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        title="Record Payment"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSendModalInvoice(inv)}
                      className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      title="Send Invoice"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete invoice ${inv.number}?`)) {
                          deleteInvoice(inv.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No invoices found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try altering your search or status filters.</p>
          </div>
        )}
      </div>

      {/* Desktop Invoices Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-3">Issue Date</th>
                <th className="py-3.5 px-3">Due Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map(inv => {
                  const isSelected = selectedInvoiceIds.includes(inv.id);
                  const statusStyle = getInvoiceStatusStyle(inv.status, inv.dueDate);

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(inv.id)}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => openViewInvoice(inv.id)}
                          className="hover:text-indigo-600 hover:underline block"
                        >
                          {inv.number}
                        </button>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-1 border border-purple-200">
                            👤 {userMap.get(inv.userId || '')?.email || inv.userId}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{inv.client?.name}</p>
                        {inv.client?.companyName && (
                          <p className="text-[11px] text-slate-400">{inv.client.companyName}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                      <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatMoney(inv.grandTotal, inv.currency)}
                        </span>
                        {inv.balanceDue > 0 && inv.status !== 'draft' && (
                          <span className="text-[10px] text-amber-700 font-mono">
                            Due: {formatMoney(inv.balanceDue, inv.currency)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setStatusDropdownId(statusDropdownId === inv.id ? null : inv.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all hover:shadow-sm cursor-pointer ${statusStyle.badgeClass}`}
                            title="Click to change payment status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
                            <span>{statusStyle.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                          </button>

                          {statusDropdownId === inv.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setStatusDropdownId(null)} 
                              />
                              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 text-left">
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                                  Change Payment Status
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(inv, 'paid')}
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>🟢 Paid (Full)</span>
                                  </span>
                                  {inv.status === 'paid' && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(inv, 'unpaid')}
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-amber-50 text-amber-800 font-semibold flex items-center justify-between transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span>🟡 Unpaid (Pending)</span>
                                  </span>
                                  {(inv.status === 'sent' || inv.status === 'draft') && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(inv, 'half_paid')}
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-blue-50 text-blue-800 font-semibold flex items-center justify-between transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>🔵 Half Payment Done (50%)</span>
                                  </span>
                                  {inv.status === 'partially_paid' && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(inv, 'overdue')}
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-rose-50 text-rose-800 font-semibold flex items-center justify-between transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    <span>🔴 Overdue</span>
                                  </span>
                                  {inv.status === 'overdue' && <Check className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => setPaymentModalInvoice(inv)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Record Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setSendModalInvoice(inv)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Send Invoice"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => duplicateInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Duplicate Invoice"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.number}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No invoices found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try altering your search or status filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of{' '}
              {filteredInvoices.length} invoices
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-medium text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoice={paymentModalInvoice}
        isOpen={Boolean(paymentModalInvoice)}
        onClose={() => setPaymentModalInvoice(null)}
      />

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        invoice={sendModalInvoice}
        isOpen={Boolean(sendModalInvoice)}
        onClose={() => setSendModalInvoice(null)}
      />
    </div>
  );
};
