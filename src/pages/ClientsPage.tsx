import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Building, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  ChevronRight, 
  FileText,
  DollarSign,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, User } from '../types';
import { StorageService } from '../services/storage';
import { formatMoney } from '../utils/currency';
import { formatDate } from '../utils/formatters';
import { CountrySelect } from '../components/common/CountrySelect';

export const ClientsPage: React.FC = () => {
  const { 
    currentUser,
    clients, 
    saveClient, 
    deleteClient, 
    openClientDetail, 
    openCreateInvoice,
    settings
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const allUsers = React.useMemo(() => StorageService.getUsers(), []);
  const userMap = React.useMemo(() => {
    const map = new Map<string, User>();
    allUsers.forEach(u => map.set(u.id, u));
    return map;
  }, [allUsers]);

  const defaultCurr = settings?.invoiceDefaults?.defaultCurrency || 'INR';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    taxId: '',
    notes: '',
  });

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      taxId: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) return;

    const payload: Client = {
      ...(editingClient || {
        id: 'cli_' + Date.now(),
        createdAt: new Date().toISOString(),
      }),
      name: formData.name.trim(),
      companyName: formData.companyName?.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim(),
      addressLine1: formData.addressLine1?.trim() || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      postalCode: formData.postalCode?.trim() || '',
      country: formData.country?.trim() || 'United States',
      taxId: formData.taxId?.trim(),
      notes: formData.notes?.trim(),
    };

    saveClient(payload);
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isAdmin ? 'Platform Client Directory' : 'Client Directory'}
            </h2>
            {isAdmin && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-purple-600" />
                Super Admin
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAdmin 
              ? 'Manage and inspect all customer profiles and balances created across platform tenants.' 
              : 'Manage your customer database, billing addresses, and individual statements.'}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or company name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredClients.length} clients
        </span>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const metrics = StorageService.getClientMetrics(client.id);

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 
                        onClick={() => openClientDetail(client.id)}
                        className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {client.name}
                      </h3>
                      {client.companyName && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{client.companyName}</span>
                        </p>
                      )}
                      {isAdmin && (
                        <p className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-1 inline-block">
                          👤 {userMap.get(client.userId || '')?.email || client.userId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove client ${client.name}?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </p>
                  {client.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </p>
                  )}
                  {client.taxId && (
                    <p className="text-[11px] font-mono text-slate-600 pt-0.5">
                      Tax Reg: {client.taxId}
                    </p>
                  )}
                </div>

                {/* Financial Totals */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoiced</span>
                    <span className="font-mono font-bold text-slate-800">{formatMoney(metrics.totalInvoiced, defaultCurr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Paid</span>
                    <span className="font-mono font-bold text-emerald-600">{formatMoney(metrics.totalPaid, defaultCurr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Balance</span>
                    <span className="font-mono font-bold text-slate-900">{formatMoney(metrics.balanceDue, defaultCurr)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => openCreateInvoice(client.id)}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invoice Client</span>
                </button>

                <button
                  onClick={() => openClientDetail(client.id)}
                  className="font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <span>Statement</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-preview border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingClient ? 'Edit Client Profile' : 'Add New Client'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter customer billing details for future invoices and quotes.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Street Address</label>
                <input
                  type="text"
                  value={formData.addressLine1 || ''}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <CountrySelect
                    value={formData.country || 'United States'}
                    onChange={(name) => setFormData({ ...formData, country: name })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax ID / VAT / GSTIN</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
