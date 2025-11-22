export type ConnectionType = "ethernet" | "wifi";

export interface NetworkDevice {
  id: string;
  name: string;
  ipAddress: string;
  connectionType: ConnectionType;
  online: boolean;
  macAddress?: string;
  vendor?: string;
  lastSeen?: string;
  signalStrength?: number; // percentage for Wi-Fi
  usageMbps?: number;
  tags?: string[];
}
