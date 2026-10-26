import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES_LIST, Country } from '../../utils/countries';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';

interface Props {
  value: string;
  onChange: (countryName: string, country: Country) => void;
  placeholder?: string;
  className?: string;
}

export const CountrySelect: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Select country',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country
  const selected = COUNTRIES_LIST.find(
    c => c.name.toLowerCase() === (value || '').toLowerCase() || c.code.toLowerCase() === (value || '').toLowerCase()
  );

  // Filtered countries
  const filtered = COUNTRIES_LIST.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q);
  });

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <div className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="text-base leading-none shrink-0">{selected.flag}</span>
              <span className="font-semibold text-slate-800 truncate">{selected.name}</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-xs overflow-hidden animate-in fade-in max-h-72 flex flex-col">
          {/* Search Box */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country name or code..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Countries Scroll List */}
          <div className="overflow-y-auto divide-y divide-slate-50 flex-1">
            {filtered.length > 0 ? (
              filtered.map(c => {
                const isItemActive = selected?.name === c.name;
                return (
                  <button
                    key={`${c.code}-${c.name}`}
                    type="button"
                    onClick={() => {
                      onChange(c.name, c);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-lg transition-colors text-xs ${
                      isItemActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-mono text-[11px]">
                      <span>{c.dialCode}</span>
                      {isItemActive && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-slate-400 text-xs">
                No matching country found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
