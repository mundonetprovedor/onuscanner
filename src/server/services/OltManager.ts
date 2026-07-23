import fs from 'fs';
import path from 'path';
import { OLTConfig } from '../types.js';

const CONFIG_FILE = path.join(process.cwd(), 'olts_config.json');

const EXCLUSIVE_HUAWEI_OLTS: OLTConfig[] = [
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
    username: 'suporte',
    password: 'Provedor02717922Core@',
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
    this.olts = EXCLUSIVE_HUAWEI_OLTS;
    this.saveOlts();
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
      vendor: 'HUAWEI',
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
    if (target?.isDefault) {
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
