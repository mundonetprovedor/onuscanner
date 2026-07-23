import React, { useState } from 'react';
import { CommandTemplate, OntDetails } from '../../server/types';
import { Copy, Check, Play, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface CommandPaletteProps {
  commands: CommandTemplate[];
  ont: OntDetails;
  onExecuteCommand: (command: CommandTemplate) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands, ont, onExecuteCommand }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleCopy = (cliCommand: string, index: number) => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const otherCommands = commands.filter((c) => c.category !== 'DELETE');

  return (
    <section style={{ marginTop: '6px' }}>
      <div className="b2b-card" style={{ padding: '8px 12px' }}>
        
        {/* Accordion Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            <Terminal size={13} color="var(--color-brand-primary)" />
            <span>Outros Comandos CLI ({otherCommands.length})</span>
          </div>

          <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            {otherCommands.map((cmd, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#0b1120',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {cmd.title}
                  </h4>
                  <div className="b2b-code-block" style={{ margin: '4px 0', fontSize: '11px', padding: '6px 8px' }}>
                    {cmd.cliCommand}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    className="b2b-btn b2b-btn-secondary b2b-btn-sm"
                    onClick={() => handleCopy(cmd.cliCommand, idx)}
                    style={{ flex: 1, height: '26px', fontSize: '10px' }}
                  >
                    {copiedIndex === idx ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    <span>Copiar</span>
                  </button>

                  <button
                    className="b2b-btn b2b-btn-primary b2b-btn-sm"
                    onClick={() => onExecuteCommand(cmd)}
                    style={{ flex: 1, height: '26px', fontSize: '10px' }}
                  >
                    <Play size={12} />
                    <span>Executar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
