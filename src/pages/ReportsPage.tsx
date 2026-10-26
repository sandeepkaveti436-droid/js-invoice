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
  const { invoices, payments, clients, settings, showToast } = useApp();
  const defaultCurr = settings?.invoiceDefaults?.defaultCurrency || 'INR';

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
            {formatMoney(summary.totalInvoiced, defaultCurr)}
          </span>
          <p className="text-xs text-slate-400 mt-2">All issued invoices</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Collected Cash
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {formatMoney(summary.totalPaid, defaultCurr)}
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
            {formatMoney(summary.totalOutstanding, defaultCurr)}
          </span>
          <p className="text-xs text-slate-400 mt-2">Awaiting customer clearance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Tax Collected Liability
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-700">
            {formatMoney(summary.totalTaxCollected, defaultCurr)}
          </span>
          <p className="text-xs text-slate-400 mt-2">Sales tax & GST to remit</p>
        </div>
      </div>

      {/* Grid: Client Distribution & Tax Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Concentration Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Client Revenue Concentration</h3>
            <p className="text-xs text-slate-500">Distribution of revenue generated by accounts</p>
          </div>

          {clientRevenue.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Donut Chart without connector lines */}
              <div className="relative w-48 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientRevenue}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={48}
                      paddingAngle={clientRevenue.length > 1 ? 4 : 0}
                      label={false}
                      labelLine={false}
                    >
                      {clientRevenue.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatMoney(Number(value), defaultCurr), 'Billed']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Clients</span>
                  <span className="text-base font-extrabold text-slate-800 font-mono">
                    {clientRevenue.length}
                  </span>
                </div>
              </div>

              {/* Structured Client Legend List (Zero Overlapping) */}
              <div className="flex-1 w-full space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {clientRevenue.map((client, idx) => {
                  const total = clientRevenue.reduce((sum, c) => sum + c.value, 0) || 1;
                  const pct = Math.round((client.value / total) * 100);
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  return (
                    <div key={client.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-800 truncate" title={client.name}>
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono">
                          {pct}%
                        </span>
                        <span className="font-bold font-mono text-slate-900 text-xs">
                          {formatMoney(client.value, defaultCurr)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No commercial client data available yet.
            </div>
          )}
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
                        {formatMoney(t.taxAmount, defaultCurr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between font-bold text-slate-900 mt-4">
            <span>Total Statutory Taxes:</span>
            <span className="font-mono">{formatMoney(summary.totalTaxCollected, defaultCurr)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
