import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  ExternalLink, 
  Building, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/currency';
import { formatDate } from '../utils/formatters';
import { RecordPaymentModal } from '../components/invoice/RecordPaymentModal';
import { Invoice } from '../types';

export const PaymentsPage: React.FC = () => {
  const { payments, invoices, settings, openViewInvoice, setCurrentView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const filteredPayments = payments.filter(p =>
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  // Invoices with pending balances ready for payment
  const openInvoices = invoices.filter(
    i => (i.status === 'sent' || i.status === 'partially_paid' || i.status === 'overdue') && i.balanceDue > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Payments Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time transaction history, settled funds, and payment method distribution.
          </p>
        </div>

        {openInvoices.length > 0 && (
          <button
            onClick={() => {
              setSelectedInvoice(openInvoices[0]);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      {/* Gateway Callout Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-indigo-300">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Online Payment Gateway Integration</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customers can settle invoices via simulated Stripe checkout or manual wire transfer.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('settings')}
          className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-colors shrink-0"
        >
          Gateway Settings
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Payments Settled
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">
            {formatMoney(totalCollected, settings?.invoiceDefaults?.defaultCurrency || 'INR')}
          </span>
          <p className="text-xs text-slate-400 mt-1">{payments.length} transactions recorded</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Primary Method
          </span>
          <span className="text-xl font-bold text-slate-900">
            Bank Transfer (Wire / ACH)
          </span>
          <p className="text-xs text-slate-400 mt-1">Direct to verified business accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Unsettled Invoices
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900">
            {openInvoices.length} Pending
          </span>
          <p className="text-xs text-slate-400 mt-1">Ready for payment recording</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payments by invoice #, client, or transaction ref..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredPayments.length} records
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Transaction Reference</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <button
                      onClick={() => openViewInvoice(p.invoiceId)}
                      className="hover:text-indigo-600 hover:underline"
                    >
                      {p.invoiceNumber}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {p.clientName}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 font-mono">
                    {formatDate(p.paymentDate)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    +{formatMoney(p.amount, p.currency)}
                  </td>

                  <td className="py-3.5 px-4 capitalize">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      {p.method.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {p.transactionRef || '—'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {p.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordPaymentModal
        invoice={selectedInvoice}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
};
