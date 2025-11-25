import { NetworkDevice } from "../types/devices";

// Mock in-memory state for network devices
const mockDevices: NetworkDevice[] = [
  {
    id: "dev1",
    name: "MacBook Pro",
    ipAddress: "192.168.1.10",
    connectionType: "wifi",
    online: true,
    macAddress: "A4:83:E7:12:34:56",
    vendor: "Apple Inc.",
    lastSeen: new Date().toISOString(),
    signalStrength: 92,
    usageMbps: 15.3,
    tags: ["trusted", "work"],
  },
  {
    id: "dev2",
    name: "iPhone 14",
    ipAddress: "192.168.1.15",
    connectionType: "wifi",
    online: true,
    macAddress: "B8:27:EB:AB:CD:EF",
    vendor: "Apple Inc.",
    lastSeen: new Date().toISOString(),
    signalStrength: 85,
    usageMbps: 3.7,
    tags: ["trusted"],
  },
  {
    id: "dev3",
    name: "Smart TV",
    ipAddress: "192.168.1.20",
    connectionType: "ethernet",
    online: true,
    macAddress: "00:1A:79:12:34:56",
    vendor: "Samsung",
    lastSeen: new Date().toISOString(),
    usageMbps: 8.5,
    tags: ["iot"],
  },
  {
    id: "dev4",
    name: "Gaming PC",
    ipAddress: "192.168.1.100",
    connectionType: "ethernet",
    online: false,
    macAddress: "D8:BB:C1:11:22:33",
    vendor: "ASRock Inc.",
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    usageMbps: 0,
    tags: ["gaming"],
  },
];

const simulateDelay = () => 
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

export async function fetchDevices(): Promise<NetworkDevice[]> {
  await simulateDelay();
  console.log("[API] Fetching devices", mockDevices.length);
  return [...mockDevices];
}

export async function fetchDeviceById(id: string): Promise<NetworkDevice | null> {
  await simulateDelay();
  console.log("[API] Fetching device by ID", id);
  
  const device = mockDevices.find(d => d.id === id);
  return device ? { ...device } : null;
}

export async function updateDeviceName(id: string, name: string): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Updating device name", id, name);
  
  const device = mockDevices.find(d => d.id === id);
  if (!device) return false;
  
  device.name = name;
  return true;
}

export async function updateDeviceTags(id: string, tags: string[]): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Updating device tags", id, tags);
  
  const device = mockDevices.find(d => d.id === id);
  if (!device) return false;
  
  device.tags = tags;
  return true;
}

export async function blockDevice(id: string): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Blocking device", id);
  
  const device = mockDevices.find(d => d.id === id);
  if (!device) return false;
  
  device.online = false;
  device.lastSeen = new Date().toISOString();
  return true;
}

