import React, { useState } from 'react';
import { X, Copy, Terminal, Check } from 'lucide-react';

interface TerminalModalProps {
  title: string;
  output: string;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ title, output, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="b2b-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="b2b-btn b2b-btn-secondary b2b-btn-sm" onClick={handleCopy}>
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado' : 'Copiar Log'}</span>
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="b2b-code-block" style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh' }}>
          {output || 'Nenhum log retornado pela OLT.'}
        </div>
      </div>
    </div>
  );
};
