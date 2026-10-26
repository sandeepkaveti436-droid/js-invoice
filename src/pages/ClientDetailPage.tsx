import React from 'react';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Eye,
  Edit
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { formatMoney } from '../utils/currency';
import { formatDate, getInvoiceStatusStyle } from '../utils/formatters';

export const ClientDetailPage: React.FC = () => {
  const { 
    activeClientId, 
    clients, 
    setCurrentView, 
    openCreateInvoice, 
    openViewInvoice, 
    openEditInvoice,
    settings
  } = useApp();

  const defaultCurr = settings?.invoiceDefaults?.defaultCurrency || 'INR';

  const client = clients.find(c => c.id === activeClientId);

  if (!client) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Client Not Found</h3>
        <button
          onClick={() => setCurrentView('clients')}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const metrics = StorageService.getClientMetrics(client.id);

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => setCurrentView('clients')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients Directory</span>
        </button>

        <button
          onClick={() => openCreateInvoice(client.id)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice for {client.name}</span>
        </button>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0">
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{client.name}</h2>
            {client.companyName && (
              <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{client.companyName}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.email}</span>
              </span>
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.phone}</span>
                </span>
              )}
              {client.taxId && (
                <span className="font-mono text-slate-700 font-semibold">
                  Tax ID: {client.taxId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200/80 min-w-[200px]">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Billing Address</p>
          <p className="text-slate-700 font-medium">{client.addressLine1}</p>
          <p>{client.city}, {client.state} {client.postalCode}</p>
          <p>{client.country}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Billed
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900">
            {formatMoney(metrics.totalInvoiced, defaultCurr)}
          </span>
          <p className="text-xs text-slate-500 mt-2">{metrics.invoiceCount} invoices generated</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Paid
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {formatMoney(metrics.totalPaid, defaultCurr)}
          </span>
          <p className="text-xs text-slate-500 mt-2">Received into accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Outstanding Balance
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900" style={{ color: metrics.balanceDue > 0 ? '#B45309' : '#059669' }}>
            {formatMoney(metrics.balanceDue, defaultCurr)}
          </span>
          <p className="text-xs text-slate-500 mt-2">Due across all open invoices</p>
        </div>
      </div>

      {/* Client's Invoice History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm">Invoice History for {client.name}</h3>
          <span className="text-xs text-slate-400 font-medium">{metrics.invoices.length} invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Due</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {metrics.invoices.length > 0 ? (
                metrics.invoices.map(inv => {
                  const statusStyle = getInvoiceStatusStyle(inv.status, inv.dueDate);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.number}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                      <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatMoney(inv.grandTotal, inv.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-800">
                        {formatMoney(inv.balanceDue, inv.currency)}
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No invoices recorded for this client yet.
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
