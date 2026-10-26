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
  ChevronRight,
  Crown,
  Users
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { User } from '../types';
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
import { formatMoney, CURRENCIES } from '../utils/currency';
import { formatDate, getInvoiceStatusStyle } from '../utils/formatters';
import { exportInvoiceToPdf } from '../utils/pdfExport';

type TimeRange = '1d' | '1w' | '1m' | 'quarterly' | 'half_yearly' | 'yearly';

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: '1d', label: '1 Day' },
  { id: '1w', label: '1 Week' },
  { id: '1m', label: '1 Month' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'half_yearly', label: 'Half Yearly' },
  { id: 'yearly', label: 'Yearly' },
];

interface RevenueTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  defaultCurr: string;
}

const RevenueChartTooltip: React.FC<RevenueTooltipProps> = ({ active, payload, label, defaultCurr }) => {
  if (!active || !payload || !payload.length) return null;

  const paidItem = payload.find((p: any) => p.dataKey === 'Paid' || p.name?.includes('Paid'));
  const outstandingItem = payload.find((p: any) => p.dataKey === 'Outstanding' || p.name?.includes('Outstanding'));

  const paidVal = Number(paidItem?.value || 0);
  const outstandingVal = Number(outstandingItem?.value || 0);
  const totalVal = paidVal + outstandingVal;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-3 rounded-2xl shadow-2xl border border-slate-700/60 min-w-[210px] text-xs animate-in fade-in-50 duration-150">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
        <span className="font-bold text-slate-200 text-xs tracking-tight">{label}</span>
        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-700/40">
          Revenue Overview
        </span>
      </div>

      <div className="space-y-2">
        {/* Paid Revenue */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm shadow-indigo-500/50" />
            <span className="text-slate-300 font-medium text-[11px]">Paid Revenue</span>
          </div>
          <span className="font-bold font-mono text-emerald-400 text-xs">
            {formatMoney(paidVal, defaultCurr)}
          </span>
        </div>

        {/* Outstanding Balance */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <span className="text-slate-300 font-medium text-[11px]">Outstanding</span>
          </div>
          <span className="font-bold font-mono text-amber-300 text-xs">
            {formatMoney(outstandingVal, defaultCurr)}
          </span>
        </div>

        {/* Total Billed */}
        <div className="pt-2 mt-1 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Billed</span>
          <span className="font-black font-mono text-white text-xs">
            {formatMoney(totalVal, defaultCurr)}
          </span>
        </div>
      </div>
    </div>
  );
};

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

  const isAdmin = currentUser?.role === 'admin';
  const allUsers = useMemo(() => StorageService.getUsers(), []);
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    allUsers.forEach(u => map.set(u.id, u));
    return map;
  }, [allUsers]);

  const [chartRange, setChartRange] = useState<TimeRange>('half_yearly');
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

  // Compute Dynamic Chart Data based on selected time window
  const chartData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (chartRange === '1d') {
      // 1 Day: Hourly breakdown
      const slots = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'];
      const todayInvoices = invoices.filter(i => i.issueDate === todayStr || i.createdAt?.startsWith(todayStr));
      const totalPaidToday = todayInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
      const totalOutToday = todayInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

      return slots.map((time, idx) => ({
        label: time,
        Paid: idx === 3 ? totalPaidToday : 0,
        Outstanding: idx === 3 ? totalOutToday : 0,
      }));
    }

    if (chartRange === '1w') {
      // 1 Week: 7 Days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result: { label: string; Paid: number; Outstanding: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const dayLabel = `${days[d.getDay()]} ${d.getDate()}`;

        const dayInvs = invoices.filter(inv => inv.issueDate === dStr || inv.createdAt?.startsWith(dStr));
        const paid = dayInvs.reduce((sum, inv) => sum + inv.amountPaid, 0);
        const outstanding = dayInvs.reduce((sum, inv) => sum + inv.balanceDue, 0);

        result.push({
          label: dayLabel,
          Paid: Math.round(paid),
          Outstanding: Math.round(outstanding),
        });
      }
      return result;
    }

    if (chartRange === '1m') {
      // 1 Month: 4 Weeks
      const result: { label: string; Paid: number; Outstanding: number }[] = [];
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `${currentYear}-${currentMonth}`;

      const weekBuckets = [
        { label: 'Week 1 (1-7)', start: 1, end: 7 },
        { label: 'Week 2 (8-14)', start: 8, end: 14 },
        { label: 'Week 3 (15-21)', start: 15, end: 21 },
        { label: 'Week 4 (22+)', start: 22, end: 31 },
      ];

      weekBuckets.forEach(b => {
        let paid = 0;
        let outstanding = 0;
        invoices.forEach(inv => {
          if (inv.issueDate.startsWith(prefix)) {
            const day = parseInt(inv.issueDate.split('-')[2] || '1', 10);
            if (day >= b.start && day <= b.end) {
              paid += inv.amountPaid;
              outstanding += inv.balanceDue;
            }
          }
        });
        result.push({
          label: b.label,
          Paid: Math.round(paid),
          Outstanding: Math.round(outstanding),
        });
      });
      return result;
    }

    if (chartRange === 'quarterly') {
      // Quarterly: Last 3 Months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const result: { label: string; Paid: number; Outstanding: number }[] = [];

      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${monthNames[m]} ${y}`;

        let paid = 0;
        let outstanding = 0;
        invoices.forEach(inv => {
          if (inv.issueDate.startsWith(prefix)) {
            paid += inv.amountPaid;
            outstanding += inv.balanceDue;
          }
        });
        result.push({
          label,
          Paid: Math.round(paid),
          Outstanding: Math.round(outstanding),
        });
      }
      return result;
    }

    if (chartRange === 'yearly') {
      // Yearly: 12 Months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const result: { label: string; Paid: number; Outstanding: number }[] = [];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = monthNames[m];

        let paid = 0;
        let outstanding = 0;
        invoices.forEach(inv => {
          if (inv.issueDate.startsWith(prefix)) {
            paid += inv.amountPaid;
            outstanding += inv.balanceDue;
          }
        });
        result.push({
          label,
          Paid: Math.round(paid),
          Outstanding: Math.round(outstanding),
        });
      }
      return result;
    }

    // Default: 'half_yearly' (6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { label: string; Paid: number; Outstanding: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
      const label = monthNames[m];

      let paid = 0;
      let outstanding = 0;
      invoices.forEach(inv => {
        if (inv.issueDate.startsWith(prefix)) {
          paid += inv.amountPaid;
          outstanding += inv.balanceDue;
        }
      });
      result.push({
        label,
        Paid: Math.round(paid),
        Outstanding: Math.round(outstanding),
      });
    }
    return result;
  }, [invoices, chartRange]);

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
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isAdmin ? 'Platform Executive Overview' : (currentUser ? `Welcome back, ${currentUser.name}` : 'Financial Performance')}
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
              ? 'Real-time platform GMV, overall collection volume, tenant performance, and multi-user cash flow.' 
              : 'Real-time billing analytics, pending collections, and cash flow summary.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setCurrentView('admin_dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm shadow-purple-200 transition-all active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>User Onboarding & Tenants</span>
              </button>

              <button
                onClick={() => setCurrentView('invoices')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-subtle transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>All Platform Invoices</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
            {metrics.totalCount > 0 ? (
              <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> Active
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">0% (No data)</span>
            )}
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
            {metrics.paidCount > 0 ? (
              <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Settled
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">0% settled</span>
            )}
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
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              metrics.outstandingCount > 0 ? 'bg-amber-50 text-amber-700' : 'text-slate-400'
            }`}>
              {metrics.outstandingCount > 0 ? 'Active Receivables' : 'All Settled'}
            </span>
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
            {metrics.overdueCount > 0 ? (
              <span className="inline-flex items-center text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                <AlertTriangle className="w-3 h-3 mr-0.5" /> Past Due
              </span>
            ) : (
              <span className="text-emerald-600 text-[11px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> All on Schedule
              </span>
            )}
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

            {/* Premium Range Selector (1 Day, 1 Week, 1 Month, Quarterly, Half Yearly, Yearly) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
              {TIME_RANGES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setChartRange(r.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    chartRange === r.id 
                      ? 'bg-white text-indigo-700 shadow-sm font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={val => {
                    const symbol = CURRENCIES[defaultCurr]?.symbol || '₹';
                    if (val >= 1000000) return `${symbol}${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${symbol}${(val / 1000).toFixed(0)}k`;
                    return `${symbol}${val}`;
                  }} 
                />
                <Tooltip
                  content={<RevenueChartTooltip defaultCurr={defaultCurr} />}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} 
                  formatter={(value) => <span className="text-slate-600 font-semibold text-xs ml-1">{value}</span>}
                />
                <Bar dataKey="Paid" name="Paid Revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Outstanding" name="Outstanding Balance" fill="#94A3B8" radius={[6, 6, 0, 0]} maxBarSize={32} />
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
                          className="hover:text-indigo-600 hover:underline block"
                        >
                          {inv.number}
                        </button>
                        {isAdmin && (
                          <span className="text-[10px] font-sans font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-1 inline-block">
                            👤 {userMap.get(inv.userId || '')?.email || inv.userId}
                          </span>
                        )}
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
