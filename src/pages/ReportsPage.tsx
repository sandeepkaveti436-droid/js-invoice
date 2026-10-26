import React, { useMemo } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  ArrowUpRight, 
  Download, 
  DollarSign, 
  PieChart as PieIcon, 
  Receipt,
  Building 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/currency';

export const ReportsPage: React.FC = () => {
  const { invoices, payments, clients, showToast } = useApp();

  // Summary Metrics
  const summary = useMemo(() => {
    const totalInvoiced = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.grandTotal : 0), 0);
    const totalPaid = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.amountPaid : 0), 0);
    const totalOutstanding = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.balanceDue : 0), 0);
    const totalTaxCollected = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.totalTax : 0), 0);
    const totalDiscountsGiven = invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? i.totalDiscount : 0), 0);

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalTaxCollected,
      totalDiscountsGiven,
    };
  }, [invoices]);

  // Tax Breakdown by Rate
  const taxSummary = useMemo(() => {
    const map = new Map<string, { rate: string; taxable: number; taxAmount: number }>();

    invoices.forEach(inv => {
      if (inv.status !== 'cancelled') {
        inv.taxes?.forEach(t => {
          const key = t.name;
          const current = map.get(key) || { rate: t.name, taxable: 0, taxAmount: 0 };
          current.taxAmount += t.amount;
          current.taxable += inv.taxableAmount / (inv.taxes.length || 1);
          map.set(key, current);
        });
      }
    });

    return Array.from(map.values());
  }, [invoices]);

  // Client Revenue Breakdown
  const clientRevenue = useMemo(() => {
    const map = new Map<string, number>();

    invoices.forEach(inv => {
      if (inv.status !== 'cancelled') {
        const clientName = inv.client?.companyName || inv.client?.name || 'Other';
        const current = map.get(clientName) || 0;
        map.set(clientName, current + inv.grandTotal);
      }
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [invoices]);

  const PIE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#E11D48', '#8B5CF6', '#06B6D4'];

  const handleExportTaxReportCsv = () => {
    const headers = ['Tax Name / Rate', 'Taxable Sales Amount', 'Tax Collected'];
    const rows = taxSummary.map(t => [
      `"${t.rate}"`,
      t.taxable.toFixed(2),
      t.taxAmount.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `tax_summary_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tax Report CSV downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Financial Reports & Tax Summary
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Exportable accounts receivable reports, tax liabilities, and client concentration breakdown.
          </p>
        </div>

        <button
          onClick={handleExportTaxReportCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Tax Report (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Billed Gross
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900">
            {formatMoney(summary.totalInvoiced, 'USD')}
          </span>
          <p className="text-xs text-slate-400 mt-2">All issued invoices</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Collected Cash
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {formatMoney(summary.totalPaid, 'USD')}
          </span>
          <p className="text-xs text-emerald-600 font-medium mt-2">
            {Math.round((summary.totalPaid / (summary.totalInvoiced || 1)) * 100)}% realization rate
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Receivables Balance
          </span>
          <span className="text-2xl font-bold font-mono text-amber-800">
            {formatMoney(summary.totalOutstanding, 'USD')}
          </span>
          <p className="text-xs text-slate-400 mt-2">Awaiting customer clearance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Tax Collected Liability
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-700">
            {formatMoney(summary.totalTaxCollected, 'USD')}
          </span>
          <p className="text-xs text-slate-400 mt-2">Sales tax & GST to remit</p>
        </div>
      </div>

      {/* Grid: Client Distribution & Tax Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Concentration Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Client Revenue Concentration</h3>
            <p className="text-xs text-slate-500">Distribution of revenue generated by accounts</p>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientRevenue}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {clientRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Billed']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax Summary Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tax Collection Summary</h3>
                <p className="text-xs text-slate-500">Detailed tax liability categorized by tax bracket</p>
              </div>
              <button
                onClick={handleExportTaxReportCsv}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Tax Description</th>
                    <th className="py-2.5 px-3 text-right">Tax Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxSummary.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-slate-800">{t.rate}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                        {formatMoney(t.taxAmount, 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between font-bold text-slate-900 mt-4">
            <span>Total Statutory Taxes:</span>
            <span className="font-mono">{formatMoney(summary.totalTaxCollected, 'USD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
