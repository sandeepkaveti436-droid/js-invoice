import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  UserPlus, 
  FileCheck, 
  Palette, 
  DollarSign, 
  Calendar,
  Eye,
  Download,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/currency';
import { formatDate, getInvoiceStatusStyle } from '../utils/formatters';
import { exportInvoiceToPdf } from '../utils/pdfExport';

export const DashboardPage: React.FC = () => {
  const { 
    currentUser,
    invoices, 
    quotes, 
    clients, 
    settings,
    openCreateInvoice, 
    openCreateQuote, 
    openEditInvoice, 
    openViewInvoice,
    setCurrentView,
    openClientDetail
  } = useApp();

  const [chartRange, setChartRange] = useState<'6m' | '12m'>('6m');
  const defaultCurr = settings?.invoiceDefaults?.defaultCurrency || 'INR';

  // Compute KPI metrics dynamically
  const metrics = useMemo(() => {
    const totalInvoicesCount = invoices.length;
    const totalInvoicedAmount = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.grandTotal : 0), 0);
    
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const paidAmount = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.amountPaid : 0), 0);
    
    const outstandingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue');
    const outstandingAmount = outstandingInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices = invoices.filter(i => (i.status === 'overdue' || (i.balanceDue > 0 && i.dueDate < today)));
    const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

    return {
      totalCount: totalInvoicesCount,
      totalAmount: totalInvoicedAmount,
      paidCount: paidInvoices.length,
      paidAmount,
      outstandingCount: outstandingInvoices.length,
      outstandingAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount,
    };
  }, [invoices]);

  // Compute Chart Data (monthly aggregate of paid vs outstanding)
  const chartData = useMemo(() => {
    const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];
    
    return months.map(month => {
      // Aggregate real invoice values or baseline
      const isJan = month.startsWith('Jan');
      const isFeb = month.startsWith('Feb');

      let paid = 0;
      let outstanding = 0;

      invoices.forEach(inv => {
        if (isJan && inv.issueDate.startsWith('2026-01')) {
          paid += inv.amountPaid;
          outstanding += inv.balanceDue;
        } else if (isFeb && inv.issueDate.startsWith('2026-02')) {
          paid += inv.amountPaid;
          outstanding += inv.balanceDue;
        }
      });

      return {
        month: month.split(' ')[0],
        Paid: Math.round(paid),
        Outstanding: Math.round(outstanding),
      };
    });
  }, [invoices]);

  // Upcoming payments (pending or partial invoices ordered by due date)
  const upcomingPayments = useMemo(() => {
    return invoices
      .filter(i => (i.status === 'sent' || i.status === 'partially_paid') && i.balanceDue > 0)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [invoices]);

  // Recent invoices
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 5);
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {currentUser ? `Welcome back, ${currentUser.name}` : 'Financial Performance'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentUser?.companyName ? `${currentUser.companyName} • ` : ''}Real-time billing analytics, pending collections, and cash flow summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openCreateInvoice()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>

          <button
            onClick={() => setCurrentView('clients')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-subtle transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Client</span>
          </button>

          <button
            onClick={() => openCreateQuote()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-subtle transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>New Quote</span>
          </button>

          <button
            onClick={() => setCurrentView('templates')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-subtle transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards with Staggered Entrance Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle animate-card-1">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {formatMoney(metrics.totalAmount, defaultCurr)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">{metrics.totalCount} total billed</span>
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2%
            </span>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle animate-card-2">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Paid Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
            {formatMoney(metrics.paidAmount, defaultCurr)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">{metrics.paidCount} settled in full</span>
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.5%
            </span>
          </div>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle animate-card-3">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Outstanding</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-800 tracking-tight">
            {formatMoney(metrics.outstandingAmount, defaultCurr)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">{metrics.outstandingCount} pending receipt</span>
            <span className="text-slate-500 font-medium">Active Net Terms</span>
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle animate-card-4">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Overdue</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-700 tracking-tight">
            {formatMoney(metrics.overdueAmount, defaultCurr)}
          </p>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">{metrics.overdueCount} require follow-up</span>
            <span className="inline-flex items-center text-rose-600 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Past Due
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Overview Chart & Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Section (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Revenue Overview</h3>
              <p className="text-xs text-slate-500">Collected cash receipts vs outstanding receivables</p>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
              <button
                onClick={() => setChartRange('6m')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartRange === '6m' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setChartRange('12m')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartRange === '12m' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                12 Months
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                />
                <Bar dataKey="Paid" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Outstanding" fill="#CBD5E1" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Payments Due (1 column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Upcoming Payments</h3>
              <p className="text-xs text-slate-500">Scheduled receivables due soon</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {upcomingPayments.length} Due
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => openViewInvoice(inv.id)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {inv.client?.companyName || inv.client?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">{inv.number}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Calendar className="w-3 h-3" /> Due {formatDate(inv.dueDate, 'MMM dd')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-sm text-slate-900 block">
                      {formatMoney(inv.balanceDue, inv.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">Balance</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-medium">All invoices settled!</p>
                <p className="text-[11px] text-slate-400">No pending payments due.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2">
            <button
              onClick={() => setCurrentView('payments')}
              className="w-full py-2 rounded-xl text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
            >
              <span>Go to Payments Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Invoices</h3>
            <p className="text-xs text-slate-500">Latest generated bills and payment records</p>
          </div>

          <button
            onClick={() => setCurrentView('invoices')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Due</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentInvoices.length > 0 ? (
                recentInvoices.map(inv => {
                  const statusStyle = getInvoiceStatusStyle(inv.status, inv.dueDate);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/75 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => openViewInvoice(inv.id)}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {inv.number}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {inv.client?.name || 'Unnamed Client'}
                        </p>
                        {inv.client?.companyName && (
                          <p className="text-[11px] text-slate-400">{inv.client.companyName}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                      <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatMoney(inv.grandTotal, inv.currency)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
                          {statusStyle.label}
                        </span>
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
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No Invoices Yet</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">
                      You haven't created any invoices in your JS Invoice account yet.
                    </p>
                    <button
                      onClick={() => openCreateInvoice()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200"
                    >
                      + Create Your First Invoice
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
