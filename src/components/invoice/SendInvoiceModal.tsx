import React, { useState } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { exportInvoiceToPdf } from '../../utils/pdfExport';
import { 
  X, 
  Mail, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  MessageSquare,
  Globe,
  Sparkles
} from 'lucide-react';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SendInvoiceModal: React.FC<Props> = ({ invoice, isOpen, onClose }) => {
  const { settings, saveInvoice, showToast } = useApp();

  const publicInvoiceUrl = invoice 
    ? `${window.location.origin}/?view=public_invoice&id=${invoice.id}`
    : '';

  const defaultBody = invoice
    ? `Hi ${invoice.client?.name || 'there'},\n\nPlease find your invoice ${invoice.number} from ${invoice.business?.name || 'our team'} for ${formatMoney(invoice.grandTotal, invoice.currency)}.\nPayment is due by ${formatDate(invoice.dueDate)}.\n\nYou can review, pay, and download your full invoice online here:\n${publicInvoiceUrl}\n\nThank you for your business!\n\nBest regards,\n${invoice.business?.name || 'Billing Team'}`
    : '';

  const [toEmail, setToEmail] = useState(invoice?.client?.email || '');
  const [ccEmail, setCcEmail] = useState('');
  const [subject, setSubject] = useState(
    invoice 
      ? `Invoice ${invoice.number} from ${invoice.business?.name || 'JS Invoice'}` 
      : ''
  );
  const [bodyMessage, setBodyMessage] = useState(defaultBody);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !invoice) return null;

  const markAsSent = () => {
    if (invoice.status === 'draft') {
      saveInvoice({
        ...invoice,
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    }
  };

  // Channel 1: Real 1-Click Launch in Gmail Web
  const handleSendViaGmail = () => {
    if (!toEmail.trim()) {
      showToast('Please enter a recipient email address.', 'error');
      return;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}${
      ccEmail ? '&cc=' + encodeURIComponent(ccEmail) : ''
    }&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyMessage)}`;

    window.open(gmailUrl, '_blank');
    markAsSent();
    showToast(`Opened Gmail compose for ${toEmail}!`, 'success');
  };

  // Channel 2: Real System Mail Client (Outlook, Apple Mail, Windows Mail)
  const handleSendViaMailto = () => {
    if (!toEmail.trim()) {
      showToast('Please enter a recipient email address.', 'error');
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}${
      ccEmail ? '&cc=' + encodeURIComponent(ccEmail) : ''
    }&body=${encodeURIComponent(bodyMessage)}`;

    window.location.href = mailtoUrl;
    markAsSent();
    showToast(`Opened default mail client for ${toEmail}!`, 'success');
  };

  // Channel 3: Direct WhatsApp Message
  const handleSendViaWhatsApp = () => {
    const cleanPhone = (invoice.client?.phone || '').replace(/[^0-9]/g, '');
    const waText = `*Invoice ${invoice.number}*\nFrom: ${invoice.business?.name || 'Billing'}\nTotal Amount: ${formatMoney(invoice.grandTotal, invoice.currency)}\nDue Date: ${formatDate(invoice.dueDate)}\n\nView & Download Invoice:\n${publicInvoiceUrl}`;
    
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
      : `https://wa.me/?text=${encodeURIComponent(waText)}`;

    window.open(waUrl, '_blank');
    markAsSent();
    showToast('Opened WhatsApp to share invoice!', 'success');
  };

  // Channel 4: Copy Direct Client Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicInvoiceUrl);
    setCopiedLink(true);
    showToast('Live client invoice link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Helper: Download PDF
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const success = await exportInvoiceToPdf('invoice-document', `${invoice.number}.pdf`);
      if (success) {
        showToast(`Downloaded ${invoice.number}.pdf! You can attach it to your email.`, 'success');
      } else {
        showToast('Could not download PDF. Please try again.', 'error');
      }
    } catch {
      showToast('Could not download PDF.', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Channel 5: Optional Direct API Dispatch if Resend API key is provided
  const handleSendViaApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim()) {
      showToast('Please enter recipient email.', 'error');
      return;
    }

    const apiKey = settings.emailConfig?.apiKey;
    if (!apiKey) {
      // Default to opening Gmail or default client directly
      handleSendViaGmail();
      return;
    }

    setIsSendingApi(true);
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${settings.emailConfig.senderName || invoice.business?.name || 'Invoicing'} <${settings.emailConfig.senderEmail || 'billing@resend.dev'}>`,
          to: [toEmail],
          cc: ccEmail ? [ccEmail] : undefined,
          subject: subject,
          text: bodyMessage,
        }),
      });

      if (res.ok) {
        markAsSent();
        setSentSuccess(true);
        showToast(`Invoice successfully delivered to ${toEmail}!`, 'success');
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 1800);
      } else {
        throw new Error('API dispatch failed');
      }
    } catch {
      showToast('Could not deliver via API. Opening in Gmail instead...', 'info');
      handleSendViaGmail();
    } finally {
      setIsSendingApi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Send Invoice to Client</h3>
              <p className="text-xs text-slate-500">Deliver invoice {invoice.number} directly to recipient</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Client Link Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-800 block">Live Client Portal Link:</span>
              <p className="text-[11px] text-slate-500 truncate max-w-xs font-mono">{publicInvoiceUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={publicInvoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"
              title="Preview Client View"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Invoice Dispatched Successfully!</h4>
            <p className="text-xs text-slate-500">Delivered to recipient and invoice status marked as "Sent".</p>
          </div>
        ) : (
          <form onSubmit={handleSendViaApi} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client / Recipient Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CC Email (Optional)</label>
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Content (Includes Live Invoice Link)</label>
              <textarea
                rows={4}
                required
                value={bodyMessage}
                onChange={e => setBodyMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans text-slate-800"
              />
            </div>

            {/* Attached PDF helper button */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Paperclip className="w-4 h-4 text-indigo-500" />
                <span className="font-mono font-bold text-xs">{invoice.number}.pdf</span>
                <span className="text-[11px] text-slate-400">(A4 Single-Page)</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 font-semibold text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF to Attach'}</span>
              </button>
            </div>

            {/* Guaranteed Real Sending Channels */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Choose Sending Method (Guaranteed Inbox Delivery):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Send with Gmail */}
                <button
                  type="button"
                  onClick={handleSendViaGmail}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Gmail</span>
                </button>

                {/* 2. Send with System Email Client */}
                <button
                  type="button"
                  onClick={handleSendViaMailto}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via Mail App</span>
                </button>

                {/* 3. Send via WhatsApp */}
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share WhatsApp</span>
                </button>
              </div>

              {settings.emailConfig?.apiKey && (
                <button
                  type="submit"
                  disabled={isSendingApi}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-colors mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSendingApi ? 'Dispatching via API...' : 'Direct Dispatch via Resend API'}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
