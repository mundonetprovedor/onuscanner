import React, { useState } from 'react';
import { CommandTemplate, OntDetails } from '../../server/types';
import { Copy, Check, Play, Terminal, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface CommandPaletteProps {
  commands: CommandTemplate[];
  ont: OntDetails;
  onExecuteCommand: (command: CommandTemplate) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands, ont, onExecuteCommand }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (cliCommand: string, index: number) => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Find the "DELETE" (Desautorizar/Remover) command to feature it prominently (User Priority #2)
  const deleteCommand = commands.find((c) => c.category === 'DELETE');
  const otherCommands = commands.filter((c) => c.category !== 'DELETE');

  return (
    <section style={{ marginTop: '24px' }}>
      
      {/* ===================================================================
          FEATURED ACTION: DESAUTORIZAR / REMOVER ONU (SEGUNDA OPÇÃO MAIS RELEVANTE)
          =================================================================== */}
      {deleteCommand && (
        <div className="featured-action-card">
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldAlert size={18} color="#ef4444" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171', margin: 0 }}>
                {deleteCommand.title}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              {deleteCommand.description} (Posição GPON: <strong style={{ color: 'white', fontFamily: 'var(--font-mono)' }}>{ont.slot}/{ont.port}:{ont.ontId}</strong>)
            </p>

            <div className="b2b-code-block" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
              {deleteCommand.cliCommand}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', maxWidth: '320px' }}>
            <button
              className="b2b-btn b2b-btn-secondary"
              onClick={() => handleCopy(deleteCommand.cliCommand, 999)}
              style={{ flex: 1 }}
            >
              {copiedIndex === 999 ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copiedIndex === 999 ? 'Copiado' : 'Copiar CLI'}</span>
            </button>

            <button
              className="b2b-btn b2b-btn-danger"
              onClick={() => onExecuteCommand(deleteCommand)}
              style={{ flex: 1.4 }}
            >
              <Trash2 size={16} />
              <span>Desautorizar ONU</span>
            </button>
          </div>
        </div>
      )}

      {/* Other Utility Management Commands */}
      <div className="b2b-card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="var(--color-brand-primary)" />
          <span>Outros Comandos de Gerenciamento CLI</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {otherCommands.map((cmd, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#0b1120',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {cmd.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                  {cmd.description}
                </p>

                <div className="b2b-code-block" style={{ marginBottom: '12px' }}>
                  {cmd.cliCommand}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  className="b2b-btn b2b-btn-secondary b2b-btn-sm"
                  onClick={() => handleCopy(cmd.cliCommand, idx)}
                  style={{ flex: 1 }}
                >
                  {copiedIndex === idx ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>Copiar</span>
                </button>

                <button
                  className="b2b-btn b2b-btn-primary b2b-btn-sm"
                  onClick={() => onExecuteCommand(cmd)}
                  style={{ flex: 1 }}
                >
                  <Play size={14} />
                  <span>Executar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
