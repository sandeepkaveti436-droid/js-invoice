import React, { useState } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RecordPaymentModal: React.FC<Props> = ({ invoice, isOpen, onClose, onSuccess }) => {
  const { recordPayment } = useApp();

  const [amount, setAmount] = useState<number>(invoice?.balanceDue || 0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'bank_transfer' | 'credit_card' | 'cash' | 'stripe' | 'upi' | 'check' | 'other'>('bank_transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !invoice) return null;

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }

    if (payAmt > invoice.balanceDue + 0.01) {
      setError(`Payment cannot exceed outstanding balance of ${formatMoney(invoice.balanceDue, invoice.currency)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = recordPayment({
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        clientId: invoice.client.id,
        clientName: invoice.client.name,
        amount: payAmt,
        currency: invoice.currency,
        paymentDate,
        method,
        transactionRef: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Confetti celebration if fully settled!
      if (result.invoice.status === 'paid') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to record payment');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-preview border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
              <p className="text-xs text-slate-400">Invoice: {invoice.number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Pill */}
        <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Invoiced</span>
            <span className="font-mono font-bold text-slate-800">{formatMoney(invoice.grandTotal, invoice.currency)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Already Paid</span>
            <span className="font-mono font-bold text-emerald-600">{formatMoney(invoice.amountPaid, invoice.currency)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Balance Due</span>
            <span className="font-mono font-bold text-slate-900">{formatMoney(invoice.balanceDue, invoice.currency)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRecord} className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">
                Payment Amount <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAmount(invoice.balanceDue)}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Pay Full Balance
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">
                {invoice.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balanceDue}
                required
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                <option value="bank_transfer">Bank Wire / Transfer</option>
                <option value="credit_card">Credit / Debit Card</option>
                <option value="stripe">Stripe</option>
                <option value="upi">UPI / Instant Pay</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Reference #</label>
            <input
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              placeholder="e.g. TXN-948201 or Wire Ref"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Cleared via Silicon Valley Bank current account"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-200 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
