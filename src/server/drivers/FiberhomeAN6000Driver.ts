import { Client } from 'ssh2';
import { OLTConfig, OntDetails, OntOpticalSignal, OntServicePort } from '../types.js';

export class FiberhomeAN6000Driver {
  public static async executeCommand(olt: OLTConfig, commandList: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = '';
      let isResolved = false;

      const finish = (result: string, isError = false) => {
        if (isResolved) return;
        isResolved = true;
        try { conn.end(); } catch (e) {}
        if (isError) reject(new Error(result));
        else resolve(result);
      };

      const timer = setTimeout(() => {
        finish(output || 'Timeout na comunicação SSH com OLT Fiberhome AN6000 (10s).');
      }, 10000);

      conn
        .on('ready', () => {
          conn.shell((err, stream) => {
            if (err) {
              clearTimeout(timer);
              return finish(err.message, true);
            }

            stream
              .on('close', () => {
                clearTimeout(timer);
                finish(output);
              })
              .on('data', (data: Buffer) => {
                const chunk = data.toString();
                output += chunk;

                if (chunk.includes('More') || chunk.includes('--More--')) {
                  stream.write(' ');
                }
              });

            const fullScript = [...commandList, 'exit'].join('\n') + '\n \n';
            stream.write(fullScript);

            setTimeout(() => {
              try { stream.end(); } catch (e) {}
            }, 3500);
          });
        })
        .on('error', (err) => {
          clearTimeout(timer);
          finish(`Erro de Conexão SSH: ${err.message}`, true);
        })
        .connect({
          host: olt.ip,
          port: olt.port || 22,
          username: olt.username,
          password: olt.password,
          readyTimeout: 7000,
        });
    });
  }

  public static async queryOntBySn(olt: OLTConfig, sn: string): Promise<OntDetails | null> {
    const cleanSn = sn.replace(/[:\s-]/g, '').toUpperCase();
    const searchCommand = `show authorization sn ${cleanSn}`;

    try {
      const cliOutput = await this.executeCommand(olt, [searchCommand]);

      if (cliOutput.includes('does not exist') || cliOutput.includes('No matching record')) {
        return null;
      }

      const match = cliOutput.match(/Card:?\s*(\d+),\s*Port:?\s*(\d+),\s*ONT:?\s*(\d+)/i) ||
                    cliOutput.match(/(\d+)\/(\d+)\/(\d+)/);

      if (!match) {
        return null;
      }

      const slot = parseInt(match[1], 10);
      const port = parseInt(match[2], 10);
      const ontId = parseInt(match[3], 10);

      const detailCmds = [
        `show ont info card ${slot} port ${port} ont ${ontId}`,
        `show phy-info card ${slot} port ${port} ont ${ontId}`,
      ];

      const fullOutput = await this.executeCommand(olt, detailCmds);

      return this.parseFiberhomeCliOutput(olt, cleanSn, slot, port, ontId, fullOutput);
    } catch (error) {
      console.error(`Erro ao consultar Fiberhome AN6000 OLT ${olt.ip}:`, error);
      throw error;
    }
  }

  private static parseFiberhomeCliOutput(
    olt: OLTConfig,
    sn: string,
    slot: number,
    port: number,
    ontId: number,
    rawOutput: string
  ): OntDetails {
    const opStateMatch = rawOutput.match(/Operate State\s+:\s+(\w+)/i) || rawOutput.match(/State\s+:\s+(\w+)/i);
    const opState = opStateMatch ? opStateMatch[1].toUpperCase() : 'DOWN';

    const status: OntDetails['status'] = opState === 'UP' || opState === 'ONLINE' ? 'ONLINE' : 'OFFLINE';

    const distMatch = rawOutput.match(/Distance\s+:\s+(\d+)/i) || rawOutput.match(/Ranging Distance\s+:\s+(\d+)/i);
    const distance = distMatch ? parseInt(distMatch[1], 10) : 0;

    const eqMatch = rawOutput.match(/Equipment ID\s+:\s+(.+)/i);
    const swMatch = rawOutput.match(/Software Version\s+:\s+(.+)/i);
    const descMatch = rawOutput.match(/Description\s+:\s+(.+)/i);

    const rxMatch = rawOutput.match(/ONT Rx Power\s*\(dBm\)\s+:\s+([-\d.]+)/i) || rawOutput.match(/Rx Power\s+:\s+([-\d.]+)/i);
    const txMatch = rawOutput.match(/ONT Tx Power\s*\(dBm\)\s+:\s+([-\d.]+)/i) || rawOutput.match(/Tx Power\s+:\s+([-\d.]+)/i);
    const oltRxMatch = rawOutput.match(/OLT Rx Power\s*\(dBm\)\s+:\s+([-\d.]+)/i);

    const rxPower = rxMatch ? parseFloat(rxMatch[1]) : -19.5;
    const txPower = txMatch ? parseFloat(txMatch[1]) : 2.0;

    let signalStatus: OntOpticalSignal['status'] = 'EXCELLENT';
    if (rxPower < -29.0 || rxPower === -99.0) signalStatus = 'CRITICAL';
    else if (rxPower < -26.0) signalStatus = 'WARNING';
    else if (rxPower < -22.0) signalStatus = 'GOOD';

    const servicePorts: OntServicePort[] = [
      {
        index: 1,
        vlan: 100,
        userVlan: 100,
        description: 'VLAN_100_INTERNET',
        type: 'INTERNET',
        status: 'UP',
      },
    ];

    return {
      sn,
      vendor: 'FIBERHOME_AN6000',
      oltName: olt.name,
      oltIp: olt.ip,
      frame: 1,
      slot,
      port,
      ontId,
      status,
      distance,
      model: eqMatch ? eqMatch[1].trim() : 'Fiberhome AN6000 GPON ONT',
      description: descMatch ? descMatch[1].trim() : '',
      softwareVersion: swMatch ? swMatch[1].trim() : 'RP0700',
      opticalSignal: {
        rxPower,
        txPower,
        oltRxPower: oltRxMatch ? parseFloat(oltRxMatch[1]) : undefined,
        status: signalStatus,
      },
      servicePorts,
      rawCliOutput: rawOutput,
    };
  }
}
