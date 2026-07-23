import React from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Cpu, Wifi, Radio } from 'lucide-react';

interface ScanProgressModalProps {
  sn: string;
  step: number; // 0, 1, 2, 3, 4
  currentOltName?: string;
}

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({ sn, step, currentOltName }) => {
  const steps = [
    { title: 'Conexão SSH', desc: 'Estabelecendo sessão SSH segura com as OLTs Huawei', icon: Cpu },
    { title: 'Busca por SN', desc: `Localizando registro GPON do SN: ${sn}`, icon: Radio },
    { title: 'Sinal Óptico', desc: 'Consultando potência RX/TX (dBm) e temperatura', icon: Wifi },
    { title: 'Finalização', desc: 'Sincronizando VLANs e gerando scripts CLI', icon: ShieldCheck },
  ];

  const progressPercentage = Math.min(100, Math.max(15, (step + 1) * 25));

  return (
    <div style={{ marginTop: '20px' }}>
      <div className="b2b-card" style={{ border: '1px solid var(--color-brand-primary)', backgroundColor: '#0b1120' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Loader2 size={20} className="animate-spin" color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Consultando OLT em Tempo Real...
            </h3>
          </div>

          <span style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
            {progressPercentage}%
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: '999px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.5)',
            }}
          />
        </div>

        {/* Steps List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = idx < step;
            const isCurrent = idx === step;

            let statusColor = 'var(--color-text-muted)';
            let borderColor = 'var(--color-border-subtle)';
            let bgColor = '#0f172a';

            if (isCompleted) {
              statusColor = '#34d399';
              borderColor = 'rgba(52, 211, 153, 0.3)';
              bgColor = 'rgba(5, 150, 105, 0.1)';
            } else if (isCurrent) {
              statusColor = '#60a5fa';
              borderColor = 'var(--color-brand-primary)';
              bgColor = 'rgba(37, 99, 235, 0.15)';
            }

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} color="#34d399" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="animate-spin" color="#60a5fa" />
                  ) : (
                    <Icon size={16} color="var(--color-text-muted)" />
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isCompleted || isCurrent ? 'white' : 'var(--color-text-muted)' }}>
                    {st.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                    {st.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentOltName && (
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            Alvo atual: <strong style={{ color: '#60a5fa' }}>{currentOltName}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
