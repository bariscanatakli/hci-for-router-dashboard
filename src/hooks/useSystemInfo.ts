import { useEffect, useState } from "react";
import { fetchSystemInfo } from "../lib/api/system";
import { SystemStatus } from "../lib/types/system";

export function useSystemInfo() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetchSystemInfo().then(setSystemStatus).catch(() => setSystemStatus(null));
  }, []);

  return { systemStatus };
}
