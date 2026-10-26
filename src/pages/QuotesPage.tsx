import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/currency';
import { formatDate, getQuoteStatusStyle } from '../utils/formatters';

export const QuotesPage: React.FC = () => {
  const { 
    quotes, 
    openCreateQuote, 
    openEditQuote, 
    convertQuote, 
    deleteQuote, 
    openViewInvoice 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = quotes.filter(q =>
    q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Estimates & Quotations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Issue proposals to prospective clients and convert approved quotes into invoices in one click.
          </p>
        </div>

        <button
          onClick={() => openCreateQuote()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Estimate</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search estimates by number or client..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredQuotes.length} quotes
        </span>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Quote #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-3">Issued</th>
                <th className="py-3.5 px-3">Valid Until</th>
                <th className="py-3.5 px-4 text-right">Estimate Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQuotes.map(q => {
                const statusStyle = getQuoteStatusStyle(q.status);

                return (
                  <tr key={q.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {q.number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{q.client?.name}</p>
                      {q.client?.companyName && (
                        <p className="text-[11px] text-slate-400">{q.client.companyName}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">{formatDate(q.issueDate)}</td>
                    <td className="py-3.5 px-3 text-slate-600">{formatDate(q.expiryDate)}</td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatMoney(q.grandTotal, q.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
                        {statusStyle.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {q.status === 'converted' && q.convertedInvoiceId ? (
                          <button
                            onClick={() => openViewInvoice(q.convertedInvoiceId!)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <span>View Invoice</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => convertQuote(q.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="Convert into unique Invoice"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Convert to Invoice</span>
                          </button>
                        )}

                        <button
                          onClick={() => openEditQuote(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete quote ${q.number}?`)) {
                              deleteQuote(q.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
