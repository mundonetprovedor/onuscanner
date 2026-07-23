export type OLTVendor = 'HUAWEI' | 'FIBERHOME_AN6000';

export interface OLTConfig {
  id: string;
  name: string;
  vendor: OLTVendor;
  ip: string;
  port: number;
  username: string;
  password?: string;
  enablePassword?: string;
  protocol: 'SSH' | 'TELNET';
  isMock?: boolean;
  isDefault?: boolean; // Fixed system OLT (cannot be deleted)
}

export interface OntOpticalSignal {
  rxPower: number; // dBm
  txPower: number; // dBm
  oltRxPower?: number; // dBm
  temperature?: number; // °C
  voltage?: number; // V
  biasCurrent?: number; // mA
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' | 'NO_SIGNAL';
}

export interface OntServicePort {
  index: number;
  vlan: number;
  userVlan?: number;
  description: string;
  type: string;
  status: 'UP' | 'DOWN';
}

export interface OntDetails {
  sn: string;
  mac?: string;
  vendor: OLTVendor;
  oltName: string;
  oltIp: string;
  frame: number;
  slot: number;
  port: number;
  ontId: number;
  status: 'ONLINE' | 'OFFLINE' | 'LOS' | 'DYING_GASP' | 'INITIAL';
  lastOnlineTime?: string;
  lastOfflineTime?: string;
  lastOfflineReason?: string;
  distance: number; // meters
  model?: string;
  description?: string;
  softwareVersion?: string;
  hardwareVersion?: string;
  opticalSignal: OntOpticalSignal;
  servicePorts: OntServicePort[];
  rawCliOutput?: string;
}

export interface CommandTemplate {
  title: string;
  description: string;
  category: 'REBOOT' | 'RESET' | 'PROVISION' | 'DELETE' | 'VLAN' | 'DIAGNOSTIC';
  cliCommand: string;
  dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ScanRequest {
  snOrMac: string;
  oltId?: string;
  useMockIfOffline?: boolean;
}

export interface ScanResult {
  success: boolean;
  message?: string;
  data?: OntDetails;
  availableCommands?: CommandTemplate[];
  scannedOltsCount: number;
  executionTimeMs: number;
}
