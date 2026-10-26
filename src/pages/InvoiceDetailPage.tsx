import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Printer, 
  Send, 
  CreditCard, 
  Copy, 
  Share2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  FileText,
  Calendar,
  Building,
  Mail,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/currency';
import { formatDate, getInvoiceStatusStyle } from '../utils/formatters';
import { exportInvoiceToPdf, printInvoice } from '../utils/pdfExport';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { RecordPaymentModal } from '../components/invoice/RecordPaymentModal';
import { SendInvoiceModal } from '../components/invoice/SendInvoiceModal';

export const InvoiceDetailPage: React.FC = () => {
  const { 
    activeInvoiceId, 
    invoices, 
    payments, 
    setCurrentView, 
    openEditInvoice, 
    duplicateInvoice, 
    deleteInvoice, 
    saveInvoice,
    showToast 
  } = useApp();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const invoice = invoices.find(i => i.id === activeInvoiceId);

  if (!invoice) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Invoice Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">The selected invoice could not be located.</p>
        <button
          onClick={() => setCurrentView('invoices')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  // Linked Payments
  const invoicePayments = payments.filter(p => p.invoiceId === invoice.id);
  const statusStyle = getInvoiceStatusStyle(invoice.status, invoice.dueDate);

  // Copy shareable link
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}?view=public_invoice&id=${invoice.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Secure invoice viewing link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownloadPdf = async () => {
    showToast('Generating official PDF...', 'info');
    await exportInvoiceToPdf('invoice-document', `${invoice.number}.pdf`);
    showToast('PDF downloaded successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => setCurrentView('invoices')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <button
            onClick={() => openEditInvoice(invoice.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-500" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => printInvoice()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-subtle transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          {invoice.balanceDue > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* Invoice Status & Metrics Ribbon */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-mono text-slate-900">{invoice.number}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
                {statusStyle.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Issued {formatDate(invoice.issueDate)} • Payment due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoiced</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {formatMoney(invoice.grandTotal, invoice.currency)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Settled</span>
            <span className="text-lg font-bold font-mono text-emerald-600">
              {formatMoney(invoice.amountPaid, invoice.currency)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining Balance</span>
            <span className="text-xl font-bold font-mono text-slate-900" style={{ color: invoice.balanceDue > 0 ? '#B45309' : '#059669' }}>
              {formatMoney(invoice.balanceDue, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Content: Left Document Preview (8 cols), Right Activity & Payment History (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Preview */}
        <div className="lg:col-span-8 bg-slate-100/70 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-inner flex justify-center overflow-x-auto">
          <TemplateRenderer invoice={invoice} zoomScale={0.95} />
        </div>

        {/* Right Side: Payment History & Activity Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment History Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Payment History</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {invoicePayments.length} recorded
              </span>
            </div>

            <div className="space-y-3">
              {invoicePayments.length > 0 ? (
                invoicePayments.map(p => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold font-mono text-emerald-700 text-sm">
                        +{formatMoney(p.amount, p.currency)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(p.paymentDate)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 capitalize">
                      Method: <span className="font-medium text-slate-800">{p.method.replace('_', ' ')}</span>
                    </p>
                    {p.transactionRef && (
                      <p className="text-[11px] text-slate-500 font-mono">
                        Ref: {p.transactionRef}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Clock className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p>No payments recorded yet.</p>
                </div>
              )}
            </div>

            {invoice.balanceDue > 0 && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record New Payment</span>
              </button>
            )}
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              Audit Trail & Timeline
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Invoice Created</p>
                  <p className="text-slate-400 text-[11px]">{formatDate(invoice.createdAt, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              {invoice.sentAt && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Invoice Dispatched to Client</p>
                    <p className="text-slate-400 text-[11px]">{formatDate(invoice.sentAt, 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              )}

              {invoice.paidAt && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Marked as Paid in Full</p>
                    <p className="text-slate-400 text-[11px]">{formatDate(invoice.paidAt, 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoice={invoice}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Send Email Modal */}
      <SendInvoiceModal
        invoice={invoice}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />
    </div>
  );
};
