export type WifiBand = "2.4GHz" | "5GHz" | "6GHz";

export interface WifiConfig {
  ssid: string;
  password: string;
  hidden?: boolean;
  guestEnabled: boolean;
  guestSsid?: string;
  guestPassword?: string;
  band: WifiBand;
  channel?: number;
  bandwidthMhz?: 20 | 40 | 80 | 160;
  mode?: "802.11n" | "802.11ac" | "802.11ax";
  maxClients?: number;
  wpsEnabled?: boolean;
}

export interface WifiStatus {
  enabled: boolean;
  guestEnabled: boolean;
  connectedDevices: number;
  signalStrength: number; // percentage
  currentThroughputMbps: number;
}
