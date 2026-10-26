import React, { useState } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { X, Mail, Send, Paperclip, CheckCircle2, AlertCircle, Settings } from 'lucide-react';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SendInvoiceModal: React.FC<Props> = ({ invoice, isOpen, onClose }) => {
  const { settings, saveInvoice, showToast, setCurrentView } = useApp();

  const [toEmail, setToEmail] = useState(invoice?.client?.email || '');
  const [ccEmail, setCcEmail] = useState('');
  const [subject, setSubject] = useState(
    invoice 
      ? `Invoice ${invoice.number} from ${invoice.business?.name || 'Nexus Craft Studio'}` 
      : ''
  );
  const [bodyMessage, setBodyMessage] = useState(
    invoice
      ? `Hi ${invoice.client?.name || 'there'},\n\nPlease find attached invoice ${invoice.number} for ${formatMoney(invoice.grandTotal, invoice.currency)}.\nPayment is due by ${formatDate(invoice.dueDate)}.\n\nThank you for your business!\n\nBest regards,\n${invoice.business?.name || 'Nexus Craft Studio'}`
      : ''
  );

  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !invoice) return null;

  const isConfigured = Boolean(settings.emailConfig?.apiKey);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim()) return;

    setIsSending(true);

    // Simulate sending with latency
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);

      // Update invoice status to 'sent' if it was 'draft'
      if (invoice.status === 'draft') {
        saveInvoice({
          ...invoice,
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
      }

      showToast(`Invoice ${invoice.number} dispatched to ${toEmail}!`, 'success');

      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-preview border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Send Invoice via Email</h3>
              <p className="text-xs text-slate-400">Dispatch directly to client with PDF attached</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development Mode Notice Banner */}
        <div className="my-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Development & Sandbox Email Mode</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Live transactional email provider (Resend / SendGrid / SMTP) is currently in sandbox. Emails are simulated and logged to the activity timeline.
            </p>
          </div>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Invoice Sent Successfully!</h4>
            <p className="text-xs text-slate-500">Logged to activity history & invoice status updated to "Sent".</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CC / BCC (Optional)</label>
              <input
                type="text"
                value={ccEmail}
                onChange={e => setCcEmail(e.target.value)}
                placeholder="billing@yourcompany.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                value={bodyMessage}
                onChange={e => setBodyMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Attached PDF Badge */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Paperclip className="w-4 h-4 text-indigo-500" />
                <span className="font-mono font-medium">{invoice.number}.pdf</span>
                <span className="text-[10px] text-slate-400">(A4 Vector Format)</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Attached
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setCurrentView('settings');
                }}
                className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure SMTP / Resend</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200 flex items-center gap-1.5"
                >
                  {isSending ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
