import { useEffect, useState } from "react";
import { fetchDevices } from "../lib/api/devices";
import { NetworkDevice } from "../lib/types/devices";

export function useDevices() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);

  useEffect(() => {
    fetchDevices().then(setDevices).catch(() => setDevices([]));
  }, []);

  return { devices };
}
