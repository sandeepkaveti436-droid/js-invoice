import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/currency';
import { Plus, X, Search, Package, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  currency?: string;
}

export const ProductSelectModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSelectProduct,
  currency = 'USD'
}) => {
  const { products, saveProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sku: '',
    category: 'Services',
    unit: 'hrs',
    unitPrice: 100,
    defaultTaxRate: 10,
    status: 'active',
  });

  if (!isOpen) return null;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const newProd: Product = {
      id: 'prod_' + Date.now(),
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      sku: formData.sku?.trim(),
      category: formData.category || 'Services',
      unit: formData.unit || 'hrs',
      unitPrice: Number(formData.unitPrice) || 0,
      defaultTaxRate: Number(formData.defaultTaxRate) || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const saved = saveProduct(newProd);
    onSelectProduct(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-preview border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isCreatingNew ? 'Add Product to Library' : 'Add Item from Product Library'}
            </h3>
            <p className="text-xs text-slate-400">
              Select reusable services or catalog items
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {!isCreatingNew ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
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
                  <span>New Product</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                            {prod.name}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {prod.category}
                          </span>
                        </div>
                        {prod.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono text-xs text-slate-900 block">
                          {formatMoney(prod.unitPrice, currency)} / {prod.unit}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tax {prod.defaultTaxRate}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No products found. Click "New Product" to add one to your library.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveNewProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Website Development"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed breakdown of deliverables..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="hrs, pcs, project, mo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Unit Price</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Default Tax Rate (%)</label>
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
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-200"
                >
                  Save & Insert into Table
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
