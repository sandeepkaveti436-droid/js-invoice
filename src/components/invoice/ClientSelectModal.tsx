import React, { useState } from 'react';
import { Client } from '../../types';
import { useApp } from '../../context/AppContext';
import { Plus, X, Search, Check, Building, Mail, Phone } from 'lucide-react';
import { CountrySelect } from '../common/CountrySelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (client: Client) => void;
}

export const ClientSelectModal: React.FC<Props> = ({ isOpen, onClose, onSelectClient }) => {
  const { clients, saveClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Client Form State
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

  if (!isOpen) return null;

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) return;

    const newClient: Client = {
      id: 'cli_' + Date.now(),
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
      createdAt: new Date().toISOString(),
    };

    const saved = saveClient(newClient);
    onSelectClient(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-preview border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isCreatingNew ? 'Add New Client' : 'Select Client for Invoice'}
            </h3>
            <p className="text-xs text-slate-400">
              {isCreatingNew ? 'Fill in client contact and billing info' : 'Choose an existing client or create a new one'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {!isCreatingNew ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by client or company name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Client</span>
                </button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => {
                        onSelectClient(client);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                          {client.name}
                        </p>
                        {client.companyName && (
                          <p className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{client.companyName}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{client.email}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white font-medium transition-colors">
                          Select
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No clients found. Click "New Client" to create one.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveNewClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Billing Street Address
                </label>
                <input
                  type="text"
                  value={formData.addressLine1 || ''}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="123 Financial Way, Suite 400"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Prov</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="94105"
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
                  <label className="block font-semibold text-slate-700 mb-1">Tax ID / GSTIN / VAT</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="Optional Tax Reg #"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200"
                >
                  Save & Apply to Invoice
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
