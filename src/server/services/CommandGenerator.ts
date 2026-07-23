import { CommandTemplate, OntDetails } from '../types.js';

export class CommandGenerator {
  public static generateCommands(ont: OntDetails): CommandTemplate[] {
    const isHuawei = ont.vendor === 'HUAWEI';
    const commands: CommandTemplate[] = [];

    if (isHuawei) {
      commands.push({
        title: 'Reiniciar ONT (Reboot)',
        description: 'Envia sinal via OMCI para reiniciar a ONT sem desligar da tomada.',
        category: 'REBOOT',
        dangerLevel: 'MEDIUM',
        cliCommand: `interface gpon ${ont.frame}/${ont.slot}\nont reboot ${ont.port} ${ont.ontId}`,
      });

      commands.push({
        title: 'Restaurar Padrão de Fábrica (Reset)',
        description: 'Reseta as configurações de Wi-Fi e usuário para o padrão original.',
        category: 'RESET',
        dangerLevel: 'HIGH',
        cliCommand: `interface gpon ${ont.frame}/${ont.slot}\nont reset ${ont.port} ${ont.ontId}`,
      });

      commands.push({
        title: 'Atualizar Sinal Óptico (Sinal em Tempo Real)',
        description: 'Força uma leitura instantânea do sinal TX/RX e temperatura do transceiver.',
        category: 'DIAGNOSTIC',
        dangerLevel: 'LOW',
        cliCommand: `interface gpon ${ont.frame}/${ont.slot}\ndisplay ont optical-info ${ont.port} ${ont.ontId}`,
      });

      commands.push({
        title: 'Deletar Cadastro na OLT (Unbind/Delete)',
        description: 'Remove o registro da ONT da porta GPON. Útil em trocas de equipamento.',
        category: 'DELETE',
        dangerLevel: 'HIGH',
        cliCommand: `interface gpon ${ont.frame}/${ont.slot}\nont delete ${ont.port} ${ont.ontId}`,
      });

      commands.push({
        title: 'Script de Reprovisionamento Rápido',
        description: 'Adiciona a ONT na porta GPON com perfil padrão MUNDONET.',
        category: 'PROVISION',
        dangerLevel: 'MEDIUM',
        cliCommand: `interface gpon ${ont.frame}/${ont.slot}\nont add ${ont.port} ${ont.ontId} sn-auth ${ont.sn} omci ont-lineprofile-name DEFAULT ont-srvprofile-name DEFAULT desc "${ont.description || 'CLIENTE'}"\nquit\nservice-port vlan 3003 gpon ${ont.frame}/${ont.slot}/${ont.port} ont ${ont.ontId} rx-cttr 6 tx-cttr 6`,
      });

      commands.push({
        title: 'Verificar Portas de Serviço (Service-Ports)',
        description: 'Lista todas as VLANs e portas ativas configuradas para esta ONT.',
        category: 'VLAN',
        dangerLevel: 'LOW',
        cliCommand: `display service-port port ${ont.frame}/${ont.slot}/${ont.port} ont ${ont.ontId}`,
      });
    } else {
      // Fiberhome AN6000 Series Commands
      commands.push({
        title: 'Reiniciar ONT (Reboot AN6000)',
        description: 'Comando de reboot via CLI para linha AN6000.',
        category: 'REBOOT',
        dangerLevel: 'MEDIUM',
        cliCommand: `reboot ont card ${ont.slot} port ${ont.port} ont ${ont.ontId}`,
      });

      commands.push({
        title: 'Restaurar Configuração (Reset AN6000)',
        description: 'Reseta as configurações da ONT Fiberhome para as definições de fábrica.',
        category: 'RESET',
        dangerLevel: 'HIGH',
        cliCommand: `reset ont-config card ${ont.slot} port ${ont.port} ont ${ont.ontId}`,
      });

      commands.push({
        title: 'Atualizar Leitura de Potência Óptica',
        description: 'Consulta em tempo real a física do sinal no AN6000.',
        category: 'DIAGNOSTIC',
        dangerLevel: 'LOW',
        cliCommand: `show phy-info card ${ont.slot} port ${ont.port} ont ${ont.ontId}`,
      });

      commands.push({
        title: 'Desautorizar / Remover ONT (Uncfg)',
        description: 'Remove a autorização da ONT no cartão do AN6000.',
        category: 'DELETE',
        dangerLevel: 'HIGH',
        cliCommand: `uncfg ont card ${ont.slot} port ${ont.port} ont ${ont.ontId}`,
      });

      commands.push({
        title: 'Script de Autorização (Provisionar AN6000)',
        description: 'Vincula o SN da ONT à porta especificada no AN6000.',
        category: 'PROVISION',
        dangerLevel: 'MEDIUM',
        cliCommand: `set authorization phy-id ${ont.sn} card ${ont.slot} port ${ont.port} ont ${ont.ontId}\nset service-port card ${ont.slot} port ${ont.port} ont ${ont.ontId} user-vlan 3003 vlan 3003`,
      });
    }

    return commands;
  }
}
