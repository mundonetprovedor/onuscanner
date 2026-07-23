import fs from 'fs';
import path from 'path';
import { OLTConfig } from '../types.js';

const CONFIG_FILE = path.join(process.cwd(), 'olts_config.json');

const DEFAULT_SYSTEM_OLTS: OLTConfig[] = [
  {
    id: 'olt-huawei-vila-embratel',
    name: 'OLT VILA EMBRATEL',
    vendor: 'HUAWEI',
    ip: '172.16.1.22',
    port: 22,
    username: 'ixcixc',
    password: '1Mr0xn0w!',
    protocol: 'SSH',
    isMock: false,
    isDefault: true,
  },
  {
    id: 'olt-huawei-monte-castelo',
    name: 'OLT MONTE CASTELO',
    vendor: 'HUAWEI',
    ip: '172.16.1.50',
    port: 22,
    username: 'mundonet',
    password: '1Mr0xn0w!027',
    protocol: 'SSH',
    isMock: false,
    isDefault: true,
  },
  {
    id: 'olt-huawei-maracana',
    name: 'OLT MARACANÃ',
    vendor: 'HUAWEI',
    ip: '172.18.1.46',
    port: 22,
    username: 'root',
    password: 'Provedor02717922Core!',
    protocol: 'SSH',
    isMock: false,
    isDefault: true,
  },
];

export class OltManager {
  private olts: OLTConfig[] = [];

  constructor() {
    this.loadOlts();
  }

  private loadOlts() {
    try {
      // Force loading DEFAULT_SYSTEM_OLTS to ensure these 3 real OLTs are always present and active
      let customOlts: OLTConfig[] = [];
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        customOlts = parsed.filter((o: OLTConfig) => !o.isDefault);
      }

      // Combine fixed system OLTs + user added OLTs
      this.olts = [...DEFAULT_SYSTEM_OLTS, ...customOlts];
      this.saveOlts();
    } catch (err) {
      console.error('Erro ao carregar OLTs, redefinindo para padrão:', err);
      this.olts = DEFAULT_SYSTEM_OLTS;
      this.saveOlts();
    }
  }

  private saveOlts() {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.olts, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar OLTs:', err);
    }
  }

  public getOlts(): OLTConfig[] {
    return this.olts;
  }

  public getOltById(id: string): OLTConfig | undefined {
    return this.olts.find((o) => o.id === id);
  }

  public addOlt(olt: Omit<OLTConfig, 'id'>): OLTConfig {
    const newOlt: OLTConfig = {
      ...olt,
      id: `olt-${Date.now()}`,
      isDefault: false,
    };
    this.olts.push(newOlt);
    this.saveOlts();
    return newOlt;
  }

  public updateOlt(id: string, updated: Partial<OLTConfig>): OLTConfig | null {
    const index = this.olts.findIndex((o) => o.id === id);
    if (index === -1) return null;

    this.olts[index] = { ...this.olts[index], ...updated };
    this.saveOlts();
    return this.olts[index];
  }

  public deleteOlt(id: string): boolean {
    const target = this.getOltById(id);
    // Prevent deletion of fixed system default OLTs
    if (target?.isDefault) {
      console.warn(`Tentativa de excluir OLT padrão bloqueada (${target.name}).`);
      return false;
    }

    const initialLength = this.olts.length;
    this.olts = this.olts.filter((o) => o.id !== id);
    if (this.olts.length !== initialLength) {
      this.saveOlts();
      return true;
    }
    return false;
  }
}
