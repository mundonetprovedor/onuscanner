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
    <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
      <div className="b2b-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="b2b-btn b2b-btn-secondary b2b-btn-sm" onClick={onOpenOltManager}>
            <Server size={14} />
            <span>OLTs ({oltsCount})</span>
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px', borderLeft: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                <UserIcon size={14} color="#60a5fa" />
                <span style={{ fontWeight: 600 }}>{user.name}</span>
              </div>

              <button
                className="b2b-btn b2b-btn-secondary b2b-btn-sm"
                onClick={onLogout}
                title="Sair da Conta"
                style={{ padding: '0 8px', color: '#f87171' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
