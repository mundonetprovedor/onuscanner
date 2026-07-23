import React, { useState } from 'react';
import { Activity, Lock, User, Key, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: { username: string; name: string; role: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success && data.token && data.user) {
        onLoginSuccess(data.token, data.user);
      } else {
        setErrorMessage(data.message || 'Falha ao realizar login. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setErrorMessage('Erro de conexão com o servidor de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-canvas)',
      padding: '20px',
    }}>
      <div className="b2b-card" style={{ width: '100%', maxWidth: '420px', padding: '32px 28px' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-brand-primary)',
            padding: '12px',
            borderRadius: 'var(--radius-xl)',
            color: '#ffffff',
            marginBottom: '12px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
          }}>
            <Activity size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            MUNDONET <span style={{ color: '#60a5fa' }}>ONT SCANNER</span>
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Acesso Restrito a Usuários Autorizados
          </p>
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px',
            color: '#f87171',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="b2b-input"
                placeholder="Digite seu usuário..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="b2b-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="b2b-btn b2b-btn-primary" disabled={isLoading} style={{ marginTop: '8px' }}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <Key size={16} />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Info Box */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Credenciais Padrão do Sistema:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'mundonet2026')}
              style={{ background: '#0b1120', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', color: '#60a5fa', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              admin / mundonet2026
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('tecnico', 'mundonet123')}
              style={{ background: '#0b1120', border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: '4px', color: '#34d399', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              tecnico / mundonet123
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
