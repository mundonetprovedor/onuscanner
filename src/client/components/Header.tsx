import React from 'react';
import { Server, Activity } from 'lucide-react';

interface HeaderProps {
  oltsCount: number;
  onOpenOltManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({ oltsCount, onOpenOltManager }) => {
  return (
    <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '14px 0' }}>
      <div className="b2b-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--color-brand-primary)', padding: '8px', borderRadius: 'var(--radius-lg)', color: '#ffffff', display: 'flex' }}>
            <Activity size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              MUNDONET <span style={{ color: '#60a5fa', fontWeight: 400 }}>ONT SCANNER</span>
            </h1>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Diagnóstico & Gerenciamento OLT (B2B Enterprise)</span>
          </div>
        </div>

        <button className="b2b-btn b2b-btn-secondary b2b-btn-sm" onClick={onOpenOltManager}>
          <Server size={14} />
          <span>OLTs Cadastradas ({oltsCount})</span>
        </button>
      </div>
    </header>
  );
};
