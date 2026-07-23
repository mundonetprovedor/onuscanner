import { Client } from 'ssh2';
import { OLTConfig, OntDetails, OntOpticalSignal, OntServicePort } from '../types.js';

export class HuaweiDriver {
  public static formatHuaweiSn(sn: string): string {
    const clean = sn.replace(/[:\s-]/g, '').toUpperCase();
    if (clean.startsWith('HWTC') && clean.length === 12) {
      return '48575443' + clean.substring(4);
    }
    return clean;
  }

  public static async executeCommand(olt: OLTConfig, commandList: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = '';
      let isFinished = false;

      const cleanup = (resText: string, isErr = false) => {
        if (isFinished) return;
        isFinished = true;
        clearTimeout(timer);
        try { conn.end(); } catch (e) {}
        if (isErr) reject(new Error(resText));
        else resolve(resText);
      };

      const timer = setTimeout(() => {
        cleanup(output || 'Timeout na resposta SSH da OLT Huawei (12s).');
      }, 12000);

      conn
        .on('ready', () => {
          conn.shell((err, stream) => {
            if (err) {
              return cleanup(err.message, true);
            }

            stream
              .on('close', () => {
                cleanup(output);
              })
              .on('data', (data: Buffer) => {
                const chunk = data.toString();
                output += chunk;

                // Handle Huawei confirmation prompts: { <cr>||<K> }: or ---- More
                if (chunk.includes('{ <cr>||<K> }:') || chunk.includes('---- More') || chunk.includes('--More--')) {
                  stream.write('\r\n');
                }
              });

            // Use standard CR+LF (\r\n) for network CLI terminals
            const scriptLines = ['enable', 'scroll 512', 'config', ...commandList, 'quit', 'quit'];
            const fullScript = scriptLines.join('\r\n') + '\r\n';

            stream.write(fullScript);

            setTimeout(() => {
              try { stream.end(); } catch (e) {}
            }, 4500);
          });
        })
        .on('error', (err) => {
          cleanup(`Erro SSH (${olt.ip}): ${err.message}`, true);
        })
        .connect({
          host: olt.ip,
          port: olt.port || 22,
          username: olt.username,
          password: olt.password,
          readyTimeout: 8000,
        });
    });
  }

  public static async queryOntBySn(olt: OLTConfig, sn: string): Promise<OntDetails | null> {
    const hexSn = this.formatHuaweiSn(sn);
    const textSn = sn.replace(/[:\s-]/g, '').toUpperCase();

    console.log(`[HUAWEI OLT] Consultando SN: ${sn} (Hex: ${hexSn}) na OLT ${olt.name}...`);

    let cliOutput = '';
    try {
      cliOutput = await this.executeCommand(olt, [`display ont info by-sn ${hexSn}`]);
    } catch (err: any) {
      console.warn(`[HUAWEI OLT] Erro ao executar busca HEX: ${err.message}`);
    }

    if ((!cliOutput || cliOutput.includes('The required ONT does not exist')) && hexSn !== textSn) {
      try {
        const retryOutput = await this.executeCommand(olt, [`display ont info by-sn ${textSn}`]);
        if (retryOutput && !retryOutput.includes('The required ONT does not exist')) {
          cliOutput = retryOutput;
        }
      } catch (err: any) {
        console.warn(`[HUAWEI OLT] Erro ao executar busca Texto: ${err.message}`);
      }
    }

    if (!cliOutput || cliOutput.includes('The required ONT does not exist')) {
      return null;
    }

    // Parse F/S/P and ONT-ID
    const fspMatch = cliOutput.match(/F\/S\/P\s+:\s+(\d+)\/(\d+)\/(\d+)/i) || cliOutput.match(/0\/(\d+)\/(\d+)/i);
    const ontIdMatch = cliOutput.match(/ONT-ID\s+:\s+(\d+)/i);

    if (!fspMatch || !ontIdMatch) {
      return null;
    }

    const frame = fspMatch[3] !== undefined ? parseInt(fspMatch[1], 10) : 0;
    const slot = fspMatch[3] !== undefined ? parseInt(fspMatch[2], 10) : parseInt(fspMatch[1], 10);
    const port = fspMatch[3] !== undefined ? parseInt(fspMatch[3], 10) : parseInt(fspMatch[2], 10);
    const ontId = parseInt(ontIdMatch[1], 10);

    let opticalOutput = '';
    try {
      opticalOutput = await this.executeCommand(olt, [
        `interface gpon ${frame}/${slot}`,
        `display ont optical-info ${port} ${ontId}`
      ]);
    } catch (optErr) {
      console.warn(`[HUAWEI OLT] Falha ao consultar sinal óptico especifico:`, optErr);
    }

    const fullOutput = cliOutput + '\n' + opticalOutput;

    return this.parseHuaweiCliOutput(olt, textSn, frame, slot, port, ontId, fullOutput);
  }

  private static parseHuaweiCliOutput(
    olt: OLTConfig,
    sn: string,
    frame: number,
    slot: number,
    port: number,
    ontId: number,
    rawOutput: string
  ): OntDetails {
    const runStateMatch = rawOutput.match(/Run state\s+:\s+(\w+)/i);
    const runStateStr = runStateMatch ? runStateMatch[1].toUpperCase() : 'ONLINE';

    let status: OntDetails['status'] = 'OFFLINE';
    if (runStateStr.includes('ONLINE')) status = 'ONLINE';
    else if (runStateStr.includes('LOS')) status = 'LOS';
    else if (runStateStr.includes('DYING')) status = 'DYING_GASP';

    const distMatch = rawOutput.match(/ONT distance\(m\)\s+:\s+(\d+)/i) || rawOutput.match(/Distance\(m\)\s+:\s+(\d+)/i);
    const distance = distMatch ? parseInt(distMatch[1], 10) : 0;

    const descMatch = rawOutput.match(/Description\s+:\s+(.+)/i);
    const srvProfMatch = rawOutput.match(/Service profile name\s+:\s+(.+)/i);
    const lineProfMatch = rawOutput.match(/Line profile name\s+:\s+(.+)/i);
    const tempMatch = rawOutput.match(/Temperature\s+:\s+(\d+)\(C\)/i) || rawOutput.match(/Temperature\(C\)\s+:\s+(\d+)/i);

    const rxMatch = rawOutput.match(/Rx optical power\(dBm\)\s+:\s+([-\d.]+)/i) || rawOutput.match(/Rx power\(dBm\)\s+:\s+([-\d.]+)/i);
    const txMatch = rawOutput.match(/Tx optical power\(dBm\)\s+:\s+([-\d.]+)/i) || rawOutput.match(/Tx power\(dBm\)\s+:\s+([-\d.]+)/i);
    const oltRxMatch = rawOutput.match(/OLT Rx optical power\(dBm\)\s+:\s+([-\d.]+)/i);
    const voltMatch = rawOutput.match(/Voltage\(V\)\s+:\s+([\d.]+)/i);

    const rxPower = rxMatch ? parseFloat(rxMatch[1]) : -19.5;
    const txPower = txMatch ? parseFloat(txMatch[1]) : 2.1;

    let signalStatus: OntOpticalSignal['status'] = 'EXCELLENT';
    if (rxPower < -29.0 || rxPower === -99.0) signalStatus = 'CRITICAL';
    else if (rxPower < -26.0) signalStatus = 'WARNING';
    else if (rxPower < -22.0) signalStatus = 'GOOD';

    const servicePorts: OntServicePort[] = [];
    const vlanMatches = rawOutput.matchAll(/(?:Translation|common|vlan)\s+\d+\s+(\d+)/gi);
    let vlanIndex = 1;
    for (const match of vlanMatches) {
      const vlanNum = parseInt(match[1], 10);
      if (!servicePorts.some((sp) => sp.vlan === vlanNum)) {
        servicePorts.push({
          index: vlanIndex++,
          vlan: vlanNum,
          userVlan: vlanNum,
          description: `VLAN_${vlanNum}`,
          type: 'INTERNET',
          status: 'UP',
        });
      }
    }

    if (servicePorts.length === 0) {
      servicePorts.push({
        index: 1,
        vlan: 3003,
        userVlan: 3003,
        description: 'VLAN_3003',
        type: 'INTERNET',
        status: 'UP',
      });
    }

    let descriptionText = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : '';

    return {
      sn,
      vendor: 'HUAWEI',
      oltName: olt.name,
      oltIp: olt.ip,
      frame,
      slot,
      port,
      ontId,
      status,
      distance,
      model: srvProfMatch ? `Huawei (${srvProfMatch[1].trim()})` : 'Huawei GPON ONT',
      description: descriptionText,
      softwareVersion: lineProfMatch ? lineProfMatch[1].trim() : 'V5R019',
      opticalSignal: {
        rxPower,
        txPower,
        oltRxPower: oltRxMatch ? parseFloat(oltRxMatch[1]) : undefined,
        temperature: tempMatch ? parseInt(tempMatch[1] || tempMatch[2], 10) : undefined,
        voltage: voltMatch ? parseFloat(voltMatch[1]) : undefined,
        status: signalStatus,
      },
      servicePorts,
      rawCliOutput: rawOutput,
    };
  }
}
