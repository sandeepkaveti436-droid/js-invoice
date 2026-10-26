import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { exportInvoiceToPdf, printInvoice } from '../utils/pdfExport';
import { formatMoney } from '../utils/currency';
import { 
  Download, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  invoiceId: string;
  onExit?: () => void;
}

export const PublicInvoiceView: React.FC<Props> = ({ invoiceId, onExit }) => {
  const { invoices, recordPayment, showToast } = useApp();
  const invoice = invoices.find(i => i.id === invoiceId);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-preview max-w-md w-full text-center border border-slate-200">
          <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Invoice Link Invalid or Expired</h2>
          <p className="text-xs text-slate-500 mt-1">This private invoice link could not be validated.</p>
          {onExit && (
            <button
              onClick={onExit}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Return to Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      try {
        recordPayment({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          clientId: invoice.client.id,
          clientName: invoice.client.name,
          amount: invoice.balanceDue,
          currency: invoice.currency,
          paymentDate: new Date().toISOString().split('T')[0],
          method: 'credit_card',
          transactionRef: 'ONLINE-ST-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          notes: 'Settled via secure client portal checkout.',
        });

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        showToast('Payment processed successfully! Thank you.', 'success');
      } catch (err: any) {
        setIsProcessingPayment(false);
        showToast(err.message || 'Payment failed', 'error');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Floating Client Action Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-dropdown flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              JS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{invoice.number}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Issued by <span className="font-semibold text-slate-700">{invoice.business?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => exportInvoiceToPdf('invoice-document', `${invoice.number}.pdf`)}
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
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-200 transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessingPayment ? 'Processing...' : `Pay ${formatMoney(invoice.balanceDue, invoice.currency)}`}
                </span>
              </button>
            )}

            {onExit && (
              <button
                onClick={onExit}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                Close View
              </button>
            )}
          </div>
        </div>

        {paymentSuccess && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Payment Verified & Settled!</p>
              <p className="text-[11px] text-emerald-700">
                A receipt confirmation has been issued. Thank you for your prompt settlement.
              </p>
            </div>
          </div>
        )}

        {/* The Clean A4 Invoice Document */}
        <div className="bg-white rounded-2xl shadow-preview border border-slate-200/80 p-2 sm:p-6 overflow-hidden">
          <TemplateRenderer invoice={invoice} zoomScale={1} />
        </div>

        {/* Security Footer */}
        <div className="text-center text-[11px] text-slate-400 py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted & Verified Commercial Document • Powered by JS Invoice</span>
        </div>
      </div>
    </div>
  );
};
