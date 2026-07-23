import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Cpu, Wifi, Radio } from 'lucide-react';

interface ScanProgressModalProps {
  sn: string;
  currentOltName?: string;
}

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({ sn, currentOltName }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { title: 'Conexão SSH', desc: 'Estabelecendo sessão SSH com a OLT Huawei', icon: Cpu },
    { title: 'Busca de Registro GPON', desc: `Consultando posição pelo SN: ${sn}`, icon: Radio },
    { title: 'Telemetria de Sinal', desc: 'Lendo potência RX/TX (dBm) e temperatura', icon: Wifi },
    { title: 'Processando Dados', desc: 'Sincronizando VLANs e gerando comandos CLI', icon: ShieldCheck },
  ];

  // Internal auto-advancing timer for smooth UI feedback during active SSH query
  useEffect(() => {
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [sn]);

  const progressPercentage = Math.min(95, (currentStep + 1) * 25);

  return (
    <div style={{ marginTop: '20px' }}>
      <div className="b2b-card" style={{ border: '1.5px solid var(--color-brand-primary)', backgroundColor: '#0b1120' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'inline-flex', animation: 'spin 1.2s linear infinite' }}>
              <Loader2 size={22} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Consultando OLT em Tempo Real...
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Aguarde a resposta dos comandos SSH
              </span>
            </div>
          </div>

          <span style={{ fontSize: '15px', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
            {progressPercentage}%
          </span>
        </div>

        {/* Animated Shimmer Progress Bar */}
        <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
          <div
            className="animate-pulse-shimmer"
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: '999px',
              transition: 'width 0.4s ease-out',
              boxShadow: '0 0 15px rgba(37, 99, 235, 0.6)',
            }}
          />
        </div>

        {/* Steps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

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
                <div style={{ marginTop: '2px', display: 'flex' }}>
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="#34d399" />
                  ) : isCurrent ? (
                    <div style={{ display: 'inline-flex', animation: 'spin 1.2s linear infinite' }}>
                      <Loader2 size={18} color="#60a5fa" />
                    </div>
                  ) : (
                    <Icon size={18} color="var(--color-text-muted)" />
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
