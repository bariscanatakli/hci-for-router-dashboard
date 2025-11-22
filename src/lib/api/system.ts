import { SystemStatus } from "../types/system";

export async function fetchSystemInfo(): Promise<SystemStatus | null> {
  return null;
}

export async function rebootSystem(): Promise<boolean> {
  return false;
}
