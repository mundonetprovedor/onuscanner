import React, { useState } from 'react';
import { OntDetails } from '../../server/types';
import { Terminal, Copy, Check, Radio, User, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

interface OntDetailsCardProps {
  details: OntDetails;
  onViewRawCli: () => void;
}

export const OntDetailsCard: React.FC<OntDetailsCardProps> = ({ details, onViewRawCli }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rx = details.opticalSignal.rxPower;
  const ponIdStr = `${details.frame}/${details.slot}/${details.port}`;
  const onuNumberStr = `${details.ontId}`;
  const fullGponStr = `${ponIdStr}:${onuNumberStr}`;
  const primaryVlan = details.servicePorts && details.servicePorts.length > 0 ? `${details.servicePorts[0].vlan}` : '3003';
  const subscriberName = details.description || 'ASSINANTE NÃO IDENTIFICADO';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  let signalBadge = { text: 'Sinal Ótimo', color: '#34d399', bg: 'var(--color-status-success-bg)' };
  if (rx < -28.0) {
    signalBadge = { text: 'Atenuação Crítica', color: '#f87171', bg: 'var(--color-status-danger-bg)' };
  } else if (rx < -25.0) {
    signalBadge = { text: 'Atenção (Sinal Baixo)', color: '#fbbf24', bg: 'var(--color-status-warning-bg)' };
  }

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ===================================================================
          1. DESTAQUE PRINCIPAL: ASSINANTE / CLIENTE (PRIMEIRA COISA A APARECER)
          =================================================================== */}
      <div className="b2b-card" style={{ backgroundColor: '#0b1120', border: '1px solid var(--color-brand-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <User size={16} color="#60a5fa" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                CLIENTE / ASSINANTE
              </span>
              <span className={`b2b-badge ${details.status === 'ONLINE' ? 'b2b-badge-online' : 'b2b-badge-offline'}`}>
                {details.status}
              </span>
            </div>

            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>
              {subscriberName}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span>OLT: <strong style={{ color: '#60a5fa' }}>{details.oltName}</strong> ({details.oltIp})</span>
              <span>•</span>
              <span>SN: <strong style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>{details.sn}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="b2b-btn b2b-btn-primary b2b-btn-sm"
              onClick={() => handleCopy(subscriberName, 'sub')}
            >
              {copiedKey === 'sub' ? <Check size={14} color="#ffffff" /> : <Copy size={14} />}
              <span>{copiedKey === 'sub' ? 'Copiado!' : 'Copiar Assinante'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. ESTRUTURA DE BLOCOS GPON SEPARADOS (PON ID, ONU NÚMERO, VLAN)
          =================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        
        {/* Box 1: Pon ID */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Pon ID (Chassi/Slot/PON)
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', margin: '4px 0' }}>
            {ponIdStr}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <span>Frame {details.frame} / Slot {details.slot} / Port {details.port}</span>
            <button
              className="b2b-btn b2b-btn-secondary b2b-btn-sm"
              onClick={() => handleCopy(ponIdStr, 'ponId')}
              style={{ padding: '2px 8px', height: '26px', fontSize: '11px' }}
            >
              {copiedKey === 'ponId' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
              <span>Copiar</span>
            </button>
          </div>
        </div>

        {/* Box 2: ONU número */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            ONU número (ID da ONU)
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>
            {onuNumberStr}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <span>ID na Porta GPON</span>
            <button
              className="b2b-btn b2b-btn-secondary b2b-btn-sm"
              onClick={() => handleCopy(onuNumberStr, 'onuId')}
              style={{ padding: '2px 8px', height: '26px', fontSize: '11px' }}
            >
              {copiedKey === 'onuId' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
              <span>Copiar</span>
            </button>
          </div>
        </div>

        {/* Box 3: VLAN Uplink */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            VLAN Uplink / Serviço
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', margin: '4px 0' }}>
            {primaryVlan}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <span>Tráfego PPPoE / Dados</span>
            <button
              className="b2b-btn b2b-btn-secondary b2b-btn-sm"
              onClick={() => handleCopy(primaryVlan, 'vlan')}
              style={{ padding: '2px 8px', height: '26px', fontSize: '11px' }}
            >
              {copiedKey === 'vlan' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
              <span>Copiar</span>
            </button>
          </div>
        </div>

        {/* Box 4: Posição Completa */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Posição GPON Completa
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#f3f4f6', margin: '4px 0' }}>
            {fullGponStr}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <span>String GPON Completa</span>
            <button
              className="b2b-btn b2b-btn-secondary b2b-btn-sm"
              onClick={() => handleCopy(fullGponStr, 'fullGpon')}
              style={{ padding: '2px 8px', height: '26px', fontSize: '11px' }}
            >
              {copiedKey === 'fullGpon' ? <Check size={12} color="#ffffff" /> : <Copy size={12} />}
              <span>Copiar</span>
            </button>
          </div>
        </div>

      </div>

      {/* Grid: Telemetry & Hardware Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Optical Telemetry Card */}
        <div className="b2b-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TELEMETRIA DE SINAL ÓPTICO
              </span>
              <span className="b2b-badge" style={{ backgroundColor: signalBadge.bg, color: signalBadge.color }}>
                {signalBadge.text}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: signalBadge.color }}>
                {rx}
              </span>
              <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>dBm</span>
            </div>

            <div style={{ height: '6px', background: '#0b1120', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(10, Math.min(100, ((rx - (-35)) / 20) * 100))}%`,
                  backgroundColor: signalBadge.color,
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Sinal Tx ONT:</span>
              <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{details.opticalSignal.txPower} dBm</div>
            </div>
            {details.opticalSignal.temperature && (
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Temperatura:</span>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{details.opticalSignal.temperature} °C</div>
              </div>
            )}
          </div>
        </div>

        {/* Hardware & OLT Info Card */}
        <div className="b2b-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ESPECIFICAÇÕES DO EQUIPAMENTO
              </span>
              <span className={`b2b-badge ${details.status === 'ONLINE' ? 'b2b-badge-online' : 'b2b-badge-offline'}`}>
                {details.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Modelo da ONT:</span>
                <div style={{ fontWeight: 600, color: '#f3f4f6', marginTop: '2px' }}>{details.model}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Distância:</span>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{details.distance} metros</div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Serial Number (SN):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '2px' }}>
                  <span>{details.sn}</span>
                  <button
                    onClick={() => handleCopy(details.sn, 'sn')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
                    title="Copiar SN"
                  >
                    {copiedKey === 'sn' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="b2b-btn b2b-btn-secondary b2b-btn-sm" onClick={onViewRawCli}>
              <Terminal size={14} />
              <span>Ver Log CLI Bruto da OLT</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
