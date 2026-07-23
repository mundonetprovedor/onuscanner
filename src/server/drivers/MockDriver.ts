import { OLTConfig, OntDetails, OntOpticalSignal, OntServicePort } from '../types.js';

export class MockDriver {
  public static async queryOntBySn(olt: OLTConfig, rawSn: string): Promise<OntDetails | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanSn = rawSn.replace(/[:\s-]/g, '').toUpperCase();

    // Check if the SN matches vendor prefix or randomly pick based on OLT vendor
    const isFiberhome = olt.vendor === 'FIBERHOME_AN6000' || cleanSn.startsWith('FHTT') || cleanSn.startsWith('FHO');
    const vendor = isFiberhome ? 'FIBERHOME_AN6000' : 'HUAWEI';

    // Seed data deterministically based on SN characters
    let seed = 0;
    for (let i = 0; i < cleanSn.length; i++) {
      seed += cleanSn.charCodeAt(i);
    }

    const frame = 0;
    const slot = (seed % 14) + 1;
    const port = seed % 16;
    const ontId = seed % 64;

    // Optical signal logic based on seed
    const rxValues = [-18.42, -21.15, -24.80, -27.35, -31.20];
    const rxPower = rxValues[seed % rxValues.length];
    const txPower = 2.15 + (seed % 5) * 0.2;

    let signalStatus: OntOpticalSignal['status'] = 'EXCELLENT';
    if (rxPower < -29.0) signalStatus = 'CRITICAL';
    else if (rxPower < -26.0) signalStatus = 'WARNING';
    else if (rxPower < -22.0) signalStatus = 'GOOD';

    const statusOptions: OntDetails['status'][] = ['ONLINE', 'ONLINE', 'ONLINE', 'OFFLINE', 'LOS'];
    const status = statusOptions[seed % statusOptions.length];

    const distance = 850 + (seed % 1200);

    const servicePorts: OntServicePort[] = [
      { index: 1, vlan: 100, userVlan: 100, description: 'INTERNET_PPPOE', type: 'INTERNET', status: 'UP' },
      { index: 2, vlan: 500, userVlan: 500, description: 'IPTV_MULTICAST', type: 'IPTV', status: 'UP' },
    ];

    if (vendor === 'HUAWEI') {
      const rawCliOutput = `
MA5800-X15(config-if-gpon-0/${slot})#display ont info 0 ${slot} ${port} ${ontId}
-----------------------------------------------------------------------------
F/S/P                   : 0/${slot}/${port}
ONT-ID                  : ${ontId}
Control flag            : active
Run state               : ${status.toLowerCase()}
Config state            : normal
Match state             : match
SN                      : ${cleanSn}
Device type             : EG8145V5
Description             : CLIENTE_MUNDONET_RESIDENCIAL
Software version        : V5R019C00S105
Distance(m)             : ${distance}
Last down cause         : dying-gasp
Last up time            : 2026-07-20 09:14:22
Last down time          : 2026-07-19 14:02:11
-----------------------------------------------------------------------------

MA5800-X15(config-if-gpon-0/${slot})#display ont optical-info 0 ${slot} ${port} ${ontId}
-----------------------------------------------------------------------------
Rx optical power(dBm)   : ${rxPower}
Tx optical power(dBm)   : ${txPower}
OLT Rx optical power(dBm): -22.14
Temperature(C)          : 42
Voltage(V)              : 3.28
Bias current(mA)        : 14
-----------------------------------------------------------------------------
`;

      return {
        sn: cleanSn,
        mac: `48:57:54:${cleanSn.substring(cleanSn.length - 6, cleanSn.length - 4)}:${cleanSn.substring(cleanSn.length - 4, cleanSn.length - 2)}:${cleanSn.substring(cleanSn.length - 2)}`,
        vendor: 'HUAWEI',
        oltName: olt.name,
        oltIp: olt.ip,
        frame,
        slot,
        port,
        ontId,
        status,
        distance,
        model: 'Huawei EG8145V5 Dual Band',
        description: 'MUNDONET_ASSINANTE_FIBRA',
        softwareVersion: 'V5R019C00S105',
        hardwareVersion: '120D.A',
        opticalSignal: {
          rxPower,
          txPower,
          oltRxPower: -22.14,
          temperature: 42,
          voltage: 3.28,
          biasCurrent: 14,
          status: signalStatus,
        },
        servicePorts,
        rawCliOutput,
      };
    } else {
      // Fiberhome AN6000 Output
      const rawCliOutput = `
AN6000-7# show ont info card ${slot} port ${port} ont ${ontId}
-----------------------------------------------------------------------------
Card/Port/ONT           : ${slot}/${port}/${ontId}
Admin State             : Enable
Operate State           : ${status === 'ONLINE' ? 'Up' : 'Down'}
Auth Mode               : SN
SN                      : ${cleanSn}
Equipment ID            : HG6145F
Description             : MUNDONET_FIBERHOME_USER
Software Version        : RP0700
Ranging Distance        : ${distance} m
-----------------------------------------------------------------------------

AN6000-7# show phy-info card ${slot} port ${port} ont ${ontId}
-----------------------------------------------------------------------------
ONT Rx Power (dBm)      : ${rxPower}
ONT Tx Power (dBm)      : ${txPower}
OLT Rx Power (dBm)      : -21.80
Work Temperature (C)    : 44
Supply Voltage (V)      : 3.30
-----------------------------------------------------------------------------
`;

      return {
        sn: cleanSn,
        mac: `F0:B4:79:${cleanSn.substring(cleanSn.length - 6, cleanSn.length - 4)}:${cleanSn.substring(cleanSn.length - 4, cleanSn.length - 2)}:${cleanSn.substring(cleanSn.length - 2)}`,
        vendor: 'FIBERHOME_AN6000',
        oltName: olt.name,
        oltIp: olt.ip,
        frame,
        slot,
        port,
        ontId,
        status,
        distance,
        model: 'Fiberhome HG6145F Wi-Fi 6',
        description: 'MUNDONET_ASSINANTE_AN6000',
        softwareVersion: 'RP0700',
        hardwareVersion: 'WIFI6_FH_V2',
        opticalSignal: {
          rxPower,
          txPower,
          oltRxPower: -21.80,
          temperature: 44,
          voltage: 3.30,
          status: signalStatus,
        },
        servicePorts,
        rawCliOutput,
      };
    }
  }
}
