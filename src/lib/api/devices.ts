import { NetworkDevice } from "../types/devices";

export async function fetchDevices(): Promise<NetworkDevice[]> {
  return [];
}

export async function fetchDeviceById(id: string): Promise<NetworkDevice | null> {
  void id;
  return null;
}
