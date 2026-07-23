import React, { useState } from 'react';
import { OLTConfig, OLTVendor } from '../../server/types';
import { X, Plus, Trash2, Server, Check, Lock } from 'lucide-react';

interface OltManagerModalProps {
  olts: OLTConfig[];
  onClose: () => void;
  onAddOlt: (olt: Omit<OLTConfig, 'id'>) => void;
  onDeleteOlt: (id: string) => void;
}

export const OltManagerModal: React.FC<OltManagerModalProps> = ({
  olts,
  onClose,
  onAddOlt,
  onDeleteOlt,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState<OLTVendor>('HUAWEI');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ip || !username) return;

    onAddOlt({
      name,
      vendor,
      ip,
      port,
      username,
      password,
      protocol: 'SSH',
      isMock: false,
    });

    setName('');
    setIp('');
    setPassword('');
    setShowAddForm(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="b2b-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={18} color="var(--color-brand-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              OLTs Cadastradas no Sistema
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {!showAddForm ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {olts.length} OLT(s) ativas
              </span>
              <button className="b2b-btn b2b-btn-primary b2b-btn-sm" onClick={() => setShowAddForm(true)}>
                <Plus size={14} />
                <span>Adicionar OLT</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {olts.map((olt) => (
                <div
                  key={olt.id}
                  style={{
                    backgroundColor: '#0b1120',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{olt.name}</strong>
                      <span className="b2b-badge" style={{ backgroundColor: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                        {olt.vendor}
                      </span>
                      {olt.isDefault && (
                        <span className="b2b-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '11px' }}>
                          <Lock size={10} /> Padrão Fixo
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      IP: {olt.ip}:{olt.port} | User: {olt.username}
                    </div>
                  </div>

                  {!olt.isDefault ? (
                    <button
                      onClick={() => onDeleteOlt(olt.id)}
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: 'none', color: '#f87171', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Excluir OLT"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Protegida
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Nome da OLT / POP</label>
                <input type="text" className="b2b-input" placeholder="Ex: OLT CENTRO" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Fabricante</label>
                <select className="b2b-select" value={vendor} onChange={(e) => setVendor(e.target.value as OLTVendor)}>
                  <option value="HUAWEI">HUAWEI</option>
                  <option value="FIBERHOME_AN6000">FIBERHOME AN6000</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Endereço IP</label>
                <input type="text" className="b2b-input" placeholder="Ex: 172.16.1.10" value={ip} onChange={(e) => setIp(e.target.value)} required style={{ fontFamily: 'var(--font-mono)' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Porta SSH</label>
                <input type="number" className="b2b-input" value={port} onChange={(e) => setPort(Number(e.target.value))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Usuário SSH</label>
                <input type="text" className="b2b-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Senha SSH</label>
                <input type="password" className="b2b-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="b2b-btn b2b-btn-secondary b2b-btn-sm" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="b2b-btn b2b-btn-primary b2b-btn-sm">
                <Check size={14} />
                <span>Salvar OLT</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
