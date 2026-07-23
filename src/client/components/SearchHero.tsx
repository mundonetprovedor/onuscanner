import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { OLTConfig } from '../../server/types';

interface SearchHeroProps {
  olts: OLTConfig[];
  selectedOltId: string;
  setSelectedOltId: (id: string) => void;
  onSearch: (snOrMac: string) => void;
  isLoading: boolean;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  olts,
  selectedOltId,
  setSelectedOltId,
  onSearch,
  isLoading,
}) => {
  const [inputSn, setInputSn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSn.trim()) {
      onSearch(inputSn);
    }
  };

  return (
    <section style={{ marginTop: '10px' }}>
      <div className="b2b-card" style={{ padding: '10px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="b2b-input"
              placeholder="Cole o SN (HWTC...)"
              value={inputSn}
              onChange={(e) => setInputSn(e.target.value.toUpperCase())}
              style={{ height: '34px', fontSize: '12px' }}
            />
          </div>

          <div style={{ width: '130px' }}>
            <select
              className="b2b-select"
              value={selectedOltId}
              onChange={(e) => setSelectedOltId(e.target.value)}
              style={{ height: '34px', fontSize: '11px', padding: '0 4px' }}
            >
              <option value="">Todas OLTs</option>
              {olts.map((olt) => (
                <option key={olt.id} value={olt.id}>
                  {olt.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="b2b-btn b2b-btn-primary" disabled={isLoading} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Buscar</span>
          </button>
        </form>
      </div>
    </section>
  );
};
