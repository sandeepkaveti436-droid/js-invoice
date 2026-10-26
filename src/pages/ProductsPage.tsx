import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  DollarSign, 
  Percent, 
  Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatMoney } from '../utils/currency';

export const ProductsPage: React.FC = () => {
  const { products, saveProduct, deleteProduct, openCreateInvoice } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sku: '',
    category: 'Engineering',
    unit: 'hrs',
    unitPrice: 100,
    defaultTaxRate: 10,
    status: 'active',
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: 'Services',
      unit: 'hrs',
      unitPrice: 100,
      defaultTaxRate: 10,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const payload: Product = {
      ...(editingProduct || {
        id: 'prod_' + Date.now(),
        createdAt: new Date().toISOString(),
      }),
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      sku: formData.sku?.trim(),
      category: formData.category || 'Services',
      unit: formData.unit || 'hrs',
      unitPrice: Number(formData.unitPrice) || 0,
      defaultTaxRate: Number(formData.defaultTaxRate) || 0,
      status: formData.status || 'active',
    };

    saveProduct(payload);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Products & Services Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define reusable deliverables, hourly rates, and standard pricing for quick invoice line-item insertion.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Product / Service</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by title, SKU, or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Item Name & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-3 text-center">Unit</th>
                <th className="py-3.5 px-4 text-right">Unit Price</th>
                <th className="py-3.5 px-3 text-right">Tax Rate</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    {p.sku && <p className="text-[10px] font-mono text-indigo-600 mt-0.5">{p.sku}</p>}
                    {p.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono text-slate-600">{p.unit}</td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatMoney(p.unitPrice, 'USD')}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-600">{p.defaultTaxRate}%</td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove product "${p.name}"?`)) {
                            deleteProduct(p.id);
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-preview border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingProduct ? 'Edit Product / Service' : 'Add Item to Library'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Save standard rates and descriptions for instant reuse on invoices.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Full-Stack React Development"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scope details and deliverables..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SRV-DEV-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Engineering / Design"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="hrs, pcs, mo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice || 0}
                    onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.defaultTaxRate || 0}
                    onChange={e => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
