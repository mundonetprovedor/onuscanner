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

  const handleQuickSn = (sn: string) => {
    setInputSn(sn);
    onSearch(sn);
  };

  return (
    <section style={{ marginTop: '24px' }}>
      <div className="b2b-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="mobile-column" style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="b2b-input"
                placeholder="Insira o Serial Number (SN / MAC) da ONT..."
                value={inputSn}
                onChange={(e) => setInputSn(e.target.value.toUpperCase())}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ minWidth: '220px' }}>
              <select
                className="b2b-select"
                value={selectedOltId}
                onChange={(e) => setSelectedOltId(e.target.value)}
              >
                <option value="">Todas as OLTs (Busca Global)</option>
                {olts.map((olt) => (
                  <option key={olt.id} value={olt.id}>
                    {olt.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="b2b-btn b2b-btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Consultando OLT...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Localizar ONT</span>
                </>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
            <span>Exemplos de SN:</span>
            <button
              type="button"
              onClick={() => handleQuickSn('485754430296CBB7')}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px', color: '#60a5fa', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              485754430296CBB7 (Huawei)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSn('FHTT87654321')}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px', color: '#34d399', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              FHTT87654321 (Fiberhome)
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
