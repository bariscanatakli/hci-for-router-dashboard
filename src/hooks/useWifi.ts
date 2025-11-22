import { useEffect, useState } from "react";
import { fetchWifiConfig } from "../lib/api/wifi";
import { WifiConfig } from "../lib/types/wifi";

export function useWifi() {
  const [config, setConfig] = useState<WifiConfig | null>(null);

  useEffect(() => {
    fetchWifiConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  return { config };
}
