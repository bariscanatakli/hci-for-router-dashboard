export interface PortForwardRule {
  id: string;
  name: string;
  port: number;
  targetIp: string;
  protocol: "tcp" | "udp";
}

export interface SecurityProfile {
  firewallLevel: number;
  portForwards: PortForwardRule[];
  intrusionPreventionEnabled?: boolean;
  threatBlocks24h?: number;
  lastScan?: string;
}
