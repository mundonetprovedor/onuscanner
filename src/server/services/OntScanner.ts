import { OLTConfig, OntDetails, ScanRequest, ScanResult } from '../types.js';
import { OltManager } from './OltManager.js';
import { MockDriver } from '../drivers/MockDriver.js';
import { HuaweiDriver } from '../drivers/HuaweiDriver.js';
import { FiberhomeAN6000Driver } from '../drivers/FiberhomeAN6000Driver.js';
import { CommandGenerator } from './CommandGenerator.js';

export class OntScanner {
  private oltManager: OltManager;

  constructor(oltManager: OltManager) {
    this.oltManager = oltManager;
  }

  public async scan(req: ScanRequest): Promise<ScanResult> {
    const startTime = Date.now();
    const cleanSn = req.snOrMac.trim().replace(/[:\s-]/g, '').toUpperCase();

    if (!cleanSn || cleanSn.length < 6) {
      return {
        success: false,
        message: 'Por favor, informe um SN ou MAC válido com pelo menos 6 caracteres.',
        scannedOltsCount: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    let oltsToScan: OLTConfig[] = [];
    if (req.oltId) {
      const selected = this.oltManager.getOltById(req.oltId);
      if (selected) oltsToScan.push(selected);
    }

    if (oltsToScan.length === 0) {
      oltsToScan = this.oltManager.getOlts();
    }

    if (oltsToScan.length === 0) {
      return {
        success: false,
        message: 'Nenhuma OLT cadastrada no sistema. Cadastre ao menos uma OLT.',
        scannedOltsCount: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Parallel search across all selected OLTs
    for (const olt of oltsToScan) {
      try {
        let details: OntDetails | null = null;

        if (olt.isMock) {
          details = await MockDriver.queryOntBySn(olt, cleanSn);
        } else {
          try {
            if (olt.vendor === 'HUAWEI') {
              details = await HuaweiDriver.queryOntBySn(olt, cleanSn);
            } else if (olt.vendor === 'FIBERHOME_AN6000') {
              details = await FiberhomeAN6000Driver.queryOntBySn(olt, cleanSn);
            }
          } catch (connErr) {
            console.warn(`Ocorreu falha ao conectar na OLT real (${olt.name} - ${olt.ip}):`, connErr);
            if (req.useMockIfOffline !== false) {
              console.log(`Usando modo simulador/mock para demonstração dos dados da ONT na OLT ${olt.name}...`);
              details = await MockDriver.queryOntBySn(olt, cleanSn);
            }
          }
        }

        if (details) {
          const availableCommands = CommandGenerator.generateCommands(details);
          return {
            success: true,
            data: details,
            availableCommands,
            scannedOltsCount: oltsToScan.length,
            executionTimeMs: Date.now() - startTime,
          };
        }
      } catch (err) {
        console.error(`Erro ao escanear OLT ${olt.name}:`, err);
      }
    }

    return {
      success: false,
      message: `Nenhuma ONT encontrada com o SN/MAC "${req.snOrMac}" nas ${oltsToScan.length} OLT(s) consultada(s).`,
      scannedOltsCount: oltsToScan.length,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
