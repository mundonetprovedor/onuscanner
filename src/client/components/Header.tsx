import React from 'react';
import { Server, Activity, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  oltsCount: number;
  user: { username: string; name: string; role: string } | null;
  onOpenOltManager: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ oltsCount, user, onOpenOltManager, onLogout }) => {
  return (
    <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '8px 0' }}>
      <div className="b2b-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ backgroundColor: 'var(--color-brand-primary)', padding: '6px', borderRadius: 'var(--radius-lg)', color: '#ffffff', display: 'flex' }}>
            <Activity size={15} />
          </div>
          <div>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              MUNDONET <span style={{ color: '#60a5fa', fontWeight: 400 }}>ONT SCANNER</span>
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="b2b-btn b2b-btn-secondary b2b-btn-sm" onClick={onOpenOltManager} style={{ height: '28px', fontSize: '11px' }}>
            <Server size={12} />
            <span>OLTs ({oltsCount})</span>
          </button>

          {user && (
            <button
              className="b2b-btn b2b-btn-secondary b2b-btn-sm"
              onClick={onLogout}
              title="Sair"
              style={{ height: '28px', padding: '0 6px', color: '#f87171' }}
            >
              <LogOut size={12} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
