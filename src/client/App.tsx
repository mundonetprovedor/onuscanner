import React, { useState, useEffect } from 'react';
import { OLTConfig, CommandTemplate, ScanResult } from '../server/types';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { OntDetailsCard } from './components/OntDetailsCard';
import { CommandPalette } from './components/CommandPalette';
import { OltManagerModal } from './components/OltManagerModal';
import { TerminalModal } from './components/TerminalModal';
import { LoginScreen } from './components/LoginScreen';
import { ScanProgressModal } from './components/ScanProgressModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('ont_scanner_token'));
  const [user, setUser] = useState<{ username: string; name: string; role: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [olts, setOlts] = useState<OLTConfig[]>([]);
  const [selectedOltId, setSelectedOltId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchingSn, setSearchingSn] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showOltModal, setShowOltModal] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<{ title: string; output: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('ont_scanner_token');
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAuthToken(token);
          setUser(data.user);
        } else {
          handleLogout();
        }
      })
      .catch(() => handleLogout())
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const fetchOlts = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/olts', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) return handleLogout();

      const data = await res.json();
      if (data.success) {
        setOlts(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar OLTs:', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOlts();
    }
  }, [authToken]);

  const handleLoginSuccess = (token: string, userData: { username: string; name: string; role: string }) => {
    localStorage.setItem('ont_scanner_token', token);
    setAuthToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }

    localStorage.removeItem('ont_scanner_token');
    setAuthToken(null);
    setUser(null);
    setScanResult(null);
  };

  const handleScan = async (snOrMac: string) => {
    if (!authToken) return;

    setIsLoading(true);
    setSearchingSn(snOrMac);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          snOrMac,
          oltId: selectedOltId || undefined,
          useMockIfOffline: true,
        }),
      });

      if (res.status === 401) return handleLogout();

      const data: ScanResult = await res.json();

      if (data.success && data.data) {
        setScanResult(data);
      } else {
        setErrorMessage(data.message || 'Nenhuma ONT localizada com este código.');
      }
    } catch (err: any) {
      setErrorMessage('Erro de conexão com o servidor backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCommand = async (cmd: CommandTemplate) => {
    if (!scanResult?.data || !authToken) return;

    const confirmExec = window.confirm(
      `Confirma a execução de "${cmd.title}" na OLT ${scanResult.data.oltName}?`
    );

    if (!confirmExec) return;

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          oltIp: scanResult.data.oltIp,
          cliCommand: cmd.cliCommand,
          vendor: scanResult.data.vendor,
        }),
      });

      if (res.status === 401) return handleLogout();

      const data = await res.json();
      setTerminalOutput({
        title: `Retorno CLI: ${cmd.title}`,
        output: data.cliOutput || data.message || 'Comando executado com sucesso.',
      });
    } catch (err: any) {
      setTerminalOutput({
        title: `Erro de Execução`,
        output: `Falha ao enviar comando para a OLT: ${err.message}`,
      });
    }
  };

  const handleAddOlt = async (newOlt: Omit<OLTConfig, 'id'>) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/olts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newOlt),
      });

      if (res.status === 401) return handleLogout();
      fetchOlts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOlt = async (id: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/olts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) return handleLogout();
      fetchOlts();
    } catch (err) {
      console.error(err);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-secondary)' }}>
        Verificando sessão...
      </div>
    );
  }

  if (!authToken || !user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedOltObj = olts.find(o => o.id === selectedOltId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-canvas)' }}>
      <Header
        oltsCount={olts.length}
        user={user}
        onOpenOltManager={() => setShowOltModal(true)}
        onLogout={handleLogout}
      />

      <main className="b2b-container" style={{ flex: 1, paddingBottom: '40px' }}>
        <SearchHero
          olts={olts}
          selectedOltId={selectedOltId}
          setSelectedOltId={setSelectedOltId}
          onSearch={handleScan}
          isLoading={isLoading}
        />

        {/* Real-time Scanning Progress Animation */}
        {isLoading && (
          <ScanProgressModal
            sn={searchingSn}
            currentOltName={selectedOltObj ? selectedOltObj.name : 'Todas as OLTs Huawei'}
          />
        )}

        {errorMessage && !isLoading && (
          <div
            className="b2b-card"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f87171',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {scanResult?.data && !isLoading && (
          <>
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span>
                Varredura concluída em <strong>{scanResult.executionTimeMs}ms</strong>
              </span>
              <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Localizada na OLT
              </span>
            </div>

            <OntDetailsCard
              details={scanResult.data}
              onViewRawCli={() =>
                setTerminalOutput({
                  title: `Log CLI Bruto - ${scanResult.data?.sn}`,
                  output: scanResult.data?.rawCliOutput || 'Sem log disponível.',
                })
              }
            />

            {scanResult.availableCommands && scanResult.availableCommands.length > 0 && (
              <CommandPalette
                commands={scanResult.availableCommands}
                ont={scanResult.data}
                onExecuteCommand={handleExecuteCommand}
              />
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '16px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
        MUNDONET Telecom • ONT Scanner Enterprise
      </footer>

      {showOltModal && (
        <OltManagerModal
          olts={olts}
          onClose={() => setShowOltModal(false)}
          onAddOlt={handleAddOlt}
          onDeleteOlt={handleDeleteOlt}
        />
      )}

      {terminalOutput && (
        <TerminalModal
          title={terminalOutput.title}
          output={terminalOutput.output}
          onClose={() => setTerminalOutput(null)}
        />
      )}
    </div>
  );
};

export default App;
