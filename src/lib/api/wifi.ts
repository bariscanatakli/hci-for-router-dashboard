import { WifiConfig } from "../types/wifi";

export async function fetchWifiConfig(): Promise<WifiConfig | null> {
  return null;
}

export async function updateWifiConfig(config: WifiConfig): Promise<boolean> {
  void config;
  return false;
}
