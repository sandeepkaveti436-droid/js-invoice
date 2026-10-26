import { getSupabase } from './supabaseClient';
import { Invoice, Client, Quote, PaymentRecord, Product, AppSettings, User } from '../types';

/**
 * Cloud Sync Service with Supabase PostgreSQL Database
 */
export const SupabaseSync = {
  // Sync Invoices
  async fetchInvoices(userId?: string): Promise<Invoice[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchInvoices error:', error);
        return null;
      }

      return (data || []).map((row: any) => {
        if (row.data) return row.data as Invoice;
        return {
          id: row.id,
          userId: row.user_id,
          number: row.number,
          title: row.title || 'Tax Invoice',
          issueDate: row.issue_date,
          dueDate: row.due_date,
          currency: row.currency || 'INR',
          status: row.status,
          grandTotal: Number(row.grand_total || 0),
          amountPaid: Number(row.amount_paid || 0),
          balanceDue: Number(row.balance_due || 0),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          ...row,
        } as unknown as Invoice;
      });
    } catch (err) {
      console.warn('Supabase fetchInvoices failed:', err);
      return null;
    }
  },

  async upsertInvoice(invoice: Invoice): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const payload = {
        id: invoice.id,
        user_id: invoice.userId,
        number: invoice.number,
        title: invoice.title,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        currency: invoice.currency,
        status: invoice.status,
        grand_total: invoice.grandTotal,
        amount_paid: invoice.amountPaid,
        balance_due: invoice.balanceDue,
        data: invoice,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('invoices').upsert(payload);
      if (error) {
        console.warn('Supabase upsertInvoice error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase upsertInvoice failed:', err);
      return false;
    }
  },

  async deleteInvoice(invoiceId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
      return !error;
    } catch {
      return false;
    }
  },

  // Sync Clients
  async fetchClients(userId?: string): Promise<Client[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      let query = supabase.from('clients').select('*').order('name');
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (error) return null;

      return (data || []).map((row: any) => {
        if (row.data) return row.data as Client;
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          companyName: row.company_name || '',
          email: row.email || '',
          phone: row.phone || '',
          addressLine1: row.address_line1 || '',
          addressLine2: row.address_line2 || '',
          city: row.city || '',
          state: row.state || '',
          postalCode: row.postal_code || '',
          country: row.country || 'India',
          taxId: row.tax_id || '',
          currency: row.currency || 'INR',
          notes: row.notes || '',
          createdAt: row.created_at,
          ...row,
        } as unknown as Client;
      });
    } catch {
      return null;
    }
  },

  async upsertClient(client: Client): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const payload = {
        id: client.id,
        user_id: client.userId,
        name: client.name,
        company_name: client.companyName,
        email: client.email,
        phone: client.phone,
        address_line1: client.addressLine1,
        address_line2: client.addressLine2,
        city: client.city,
        state: client.state,
        postal_code: client.postalCode,
        country: client.country,
        tax_id: client.taxId,
        currency: client.currency,
        notes: client.notes,
        data: client,
      };

      const { error } = await supabase.from('clients').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteClient(clientId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      return !error;
    } catch {
      return false;
    }
  },

  // Sync Payments
  async fetchPayments(userId?: string): Promise<PaymentRecord[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      let query = supabase.from('payments').select('*').order('payment_date', { ascending: false });
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (error) return null;

      return (data || []).map((row: any) => {
        if (row.data) return row.data as PaymentRecord;
        return {
          id: row.id,
          userId: row.user_id,
          invoiceId: row.invoice_id,
          invoiceNumber: row.invoice_number,
          clientId: row.client_id,
          clientName: row.client_name,
          amount: Number(row.amount),
          currency: row.currency || 'INR',
          paymentDate: row.payment_date,
          method: row.method,
          transactionRef: row.transaction_ref,
          notes: row.notes,
          createdAt: row.created_at,
          ...row,
        } as unknown as PaymentRecord;
      });
    } catch {
      return null;
    }
  },

  async upsertPayment(payment: PaymentRecord): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const payload = {
        id: payment.id,
        user_id: payment.userId,
        invoice_id: payment.invoiceId,
        invoice_number: payment.invoiceNumber,
        client_id: payment.clientId,
        client_name: payment.clientName,
        amount: payment.amount,
        currency: payment.currency,
        payment_date: payment.paymentDate,
        method: payment.method,
        transaction_ref: payment.transactionRef,
        notes: payment.notes,
        data: payment,
      };

      const { error } = await supabase.from('payments').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  },

  // Push all local data to Supabase in bulk
  async pushAllLocalToCloud(
    invoices: Invoice[],
    clients: Client[],
    payments: PaymentRecord[],
    quotes: Quote[]
  ): Promise<{ success: boolean; count: number; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, count: 0, error: 'Supabase client not connected.' };

    try {
      let totalSynced = 0;

      // 1. Clients
      if (clients.length > 0) {
        const clientRows = clients.map(c => ({
          id: c.id,
          user_id: c.userId,
          name: c.name,
          company_name: c.companyName,
          email: c.email,
          phone: c.phone,
          address_line1: c.addressLine1,
          city: c.city,
          state: c.state,
          postal_code: c.postalCode,
          country: c.country,
          tax_id: c.taxId,
          data: c,
        }));
        await supabase.from('clients').upsert(clientRows);
        totalSynced += clientRows.length;
      }

      // 2. Invoices
      if (invoices.length > 0) {
        const invoiceRows = invoices.map(i => ({
          id: i.id,
          user_id: i.userId,
          number: i.number,
          title: i.title,
          issue_date: i.issueDate,
          due_date: i.dueDate,
          currency: i.currency,
          status: i.status,
          grand_total: i.grandTotal,
          amount_paid: i.amountPaid,
          balance_due: i.balanceDue,
          data: i,
        }));
        await supabase.from('invoices').upsert(invoiceRows);
        totalSynced += invoiceRows.length;
      }

      // 3. Payments
      if (payments.length > 0) {
        const paymentRows = payments.map(p => ({
          id: p.id,
          user_id: p.userId,
          invoice_id: p.invoiceId,
          invoice_number: p.invoiceNumber,
          client_id: p.clientId,
          client_name: p.clientName,
          amount: p.amount,
          currency: p.currency,
          payment_date: p.paymentDate,
          method: p.method,
          transaction_ref: p.transactionRef,
          notes: p.notes,
          data: p,
        }));
        await supabase.from('payments').upsert(paymentRows);
        totalSynced += paymentRows.length;
      }

      // 4. Quotes
      if (quotes.length > 0) {
        const quoteRows = quotes.map(q => ({
          id: q.id,
          user_id: q.userId,
          number: q.number,
          title: q.title,
          issue_date: q.issueDate,
          expiry_date: q.expiryDate,
          currency: q.currency,
          status: q.status,
          grand_total: q.grandTotal,
          data: q,
        }));
        await supabase.from('quotes').upsert(quoteRows);
        totalSynced += quoteRows.length;
      }

      return { success: true, count: totalSynced };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Bulk sync error' };
    }
  },

  // Cloud User Directory Sync (Cross-Device Supabase PostgreSQL Sync)
  async fetchPlatformUsers(): Promise<User[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('data')
        .eq('user_id', 'global_platform_users')
        .maybeSingle();

      if (error || !data || !data.data || !Array.isArray(data.data.users)) {
        return null;
      }
      return data.data.users as User[];
    } catch (err) {
      console.warn('Supabase fetchPlatformUsers error:', err);
      return null;
    }
  },

  async syncPlatformUsers(users: User[]): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: 'global_platform_users',
          data: { users, lastSyncedAt: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.warn('Supabase syncPlatformUsers error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncPlatformUsers failed:', err);
      return false;
    }
  },
};
