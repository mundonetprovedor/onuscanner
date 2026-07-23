import React, { useState } from 'react';
import { OntDetails, CommandTemplate } from '../../server/types';
import { Copy, Check, User, Radio, Wifi, Terminal, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface OntDetailsCardProps {
  details: OntDetails;
  commands?: CommandTemplate[];
  onViewRawCli: () => void;
  onExecuteCommand: (command: CommandTemplate) => void;
}

export const OntDetailsCard: React.FC<OntDetailsCardProps> = ({
  details,
  commands = [],
  onViewRawCli,
  onExecuteCommand,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showMoreCommands, setShowMoreCommands] = useState<boolean>(false);

  const rx = details.opticalSignal.rxPower;
  const ponIdStr = `${details.frame}/${details.slot}/${details.port}`;
  const onuNumberStr = `${details.ontId}`;
  const fullGponStr = `${ponIdStr}:${onuNumberStr}`;
  const primaryVlan = details.servicePorts && details.servicePorts.length > 0 ? `${details.servicePorts[0].vlan}` : '3003';
  const subscriberName = details.description || 'ASSINANTE NÃO IDENTIFICADO';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  let signalBadge = { text: 'Ótimo', color: '#34d399' };
  if (rx < -28.0) {
    signalBadge = { text: 'Crítico', color: '#f87171' };
  } else if (rx < -25.0) {
    signalBadge = { text: 'Atenção', color: '#fbbf24' };
  }

  const deleteCmd = commands.find((c) => c.category === 'DELETE');
  const rebootCmd = commands.find((c) => c.category === 'REBOOT');

  return (
    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* ===================================================================
          ULTRA-COMPACT SINGLE-SCREEN MOBILE DASHBOARD
          =================================================================== */}
      <div className="b2b-card" style={{ backgroundColor: '#0b1120', border: '1.5px solid var(--color-brand-primary)', padding: '12px' }}>
        
        {/* 1. Header Line: Subscriber & OLT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <User size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subscriberName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span className={`b2b-badge ${details.status === 'ONLINE' ? 'b2b-badge-online' : 'b2b-badge-offline'}`}>
              {details.status}
            </span>
            <button
              className="b2b-btn b2b-btn-secondary b2b-btn-sm"
              onClick={() => handleCopy(subscriberName, 'sub')}
              style={{ height: '24px', padding: '0 6px', fontSize: '10px' }}
            >
              {copiedKey === 'sub' ? <Check size={10} color="#34d399" /> : <Copy size={10} />}
              <span>{copiedKey === 'sub' ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* 2. Compact 4-Box Telemetry Grid */}
        <div className="mobile-compact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
          
          {/* Box 1: Pon ID */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '6px 8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pon ID</span>
              <button onClick={() => handleCopy(ponIdStr, 'ponId')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}>
                {copiedKey === 'ponId' ? <Check size={10} color="#34d399" /> : <Copy size={10} />}
              </button>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', lineHeight: 1.2 }}>
              {ponIdStr}
            </div>
          </div>

          {/* Box 2: ONU número */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '6px 8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>ONU ID</span>
              <button onClick={() => handleCopy(onuNumberStr, 'onuId')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}>
                {copiedKey === 'onuId' ? <Check size={10} color="#34d399" /> : <Copy size={10} />}
              </button>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', lineHeight: 1.2 }}>
              {onuNumberStr}
            </div>
          </div>

          {/* Box 3: VLAN Uplink */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '6px 8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>VLAN</span>
              <button onClick={() => handleCopy(primaryVlan, 'vlan')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}>
                {copiedKey === 'vlan' ? <Check size={10} color="#34d399" /> : <Copy size={10} />}
              </button>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1.2 }}>
              {primaryVlan}
            </div>
          </div>

          {/* Box 4: Sinal RX */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-lg)', padding: '6px 8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Sinal Rx</span>
              <span style={{ fontSize: '9px', color: signalBadge.color, fontWeight: 700 }}>{signalBadge.text}</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: signalBadge.color, lineHeight: 1.2 }}>
              {rx} <span style={{ fontSize: '10px', fontWeight: 400 }}>dBm</span>
            </div>
          </div>

        </div>

        {/* 3. Direct Management Action Bar (Desautorizar & Reboot No Topo) */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {deleteCmd && (
            <button
              className="b2b-btn b2b-btn-danger"
              onClick={() => onExecuteCommand(deleteCmd)}
              style={{ flex: 1.4, height: '32px', fontSize: '11px', padding: '0 8px' }}
            >
              <Trash2 size={12} />
              <span>Desautorizar ONU</span>
            </button>
          )}

          {rebootCmd && (
            <button
              className="b2b-btn b2b-btn-primary"
              onClick={() => onExecuteCommand(rebootCmd)}
              style={{ flex: 1, height: '32px', fontSize: '11px', padding: '0 8px' }}
            >
              <RefreshCw size={12} />
              <span>Reboot</span>
            </button>
          )}

          <button
            className="b2b-btn b2b-btn-secondary"
            onClick={onViewRawCli}
            style={{ height: '32px', padding: '0 8px', fontSize: '11px' }}
            title="Log CLI Bruto"
          >
            <Terminal size={12} />
            <span>Log CLI</span>
          </button>
        </div>

        {/* Info Secondary Subtext */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span>OLT: <strong style={{ color: '#60a5fa' }}>{details.oltName}</strong> ({details.oltIp})</span>
          <span>SN: <strong style={{ color: '#ffffff' }}>{details.sn}</strong> | Dist: <strong>{details.distance}m</strong></span>
        </div>

      </div>

    </div>
  );
};
