import React, { useState, useEffect } from 'react';
import { OLTConfig, CommandTemplate, ScanResult } from '../server/types';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { OntDetailsCard } from './components/OntDetailsCard';
import { CommandPalette } from './components/CommandPalette';
import { OltManagerModal } from './components/OltManagerModal';
import { TerminalModal } from './components/TerminalModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [olts, setOlts] = useState<OLTConfig[]>([]);
  const [selectedOltId, setSelectedOltId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showOltModal, setShowOltModal] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<{ title: string; output: string } | null>(null);

  const fetchOlts = async () => {
    try {
      const res = await fetch('/api/olts');
      const data = await res.json();
      if (data.success) {
        setOlts(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar OLTs:', err);
    }
  };

  useEffect(() => {
    fetchOlts();
  }, []);

  const handleScan = async (snOrMac: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snOrMac,
          oltId: selectedOltId || undefined,
          useMockIfOffline: true,
        }),
      });

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
    if (!scanResult?.data) return;

    const confirmExec = window.confirm(
      `Confirma a execução de "${cmd.title}" na OLT ${scanResult.data.oltName}?`
    );

    if (!confirmExec) return;

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oltIp: scanResult.data.oltIp,
          cliCommand: cmd.cliCommand,
          vendor: scanResult.data.vendor,
        }),
      });

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
    try {
      await fetch('/api/olts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOlt),
      });
      fetchOlts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOlt = async (id: string) => {
    try {
      await fetch(`/api/olts/${id}`, { method: 'DELETE' });
      fetchOlts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Header oltsCount={olts.length} onOpenOltManager={() => setShowOltModal(true)} />

      <main className="container" style={{ flex: 1, paddingBottom: '40px' }}>
        <SearchHero
          olts={olts}
          selectedOltId={selectedOltId}
          setSelectedOltId={setSelectedOltId}
          onSearch={handleScan}
          isLoading={isLoading}
        />

        {errorMessage && (
          <div
            className="card"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f87171',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {scanResult?.data && (
          <>
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>
                Varredura em <strong>{scanResult.executionTimeMs}ms</strong>
              </span>
              <span style={{ color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

      <footer style={{ borderTop: '1px solid var(--bg-surface-border)', padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        MUNDONET Telecom • ONT Scanner Web & Mobile
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
