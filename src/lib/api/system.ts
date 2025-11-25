import { SystemStatus } from "../types/system";

// Mock in-memory state for system status
let mockSystemState: SystemStatus = {
  firmwareVersion: "v2.4.1",
  uptimeSeconds: 432000, // 5 days
  health: "good",
  lastChecked: new Date().toISOString(),
  autoUpdateEnabled: true,
};

const simulateDelay = () => 
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

export async function fetchSystemInfo(): Promise<SystemStatus | null> {
  await simulateDelay();
  
  // Increment uptime by a small random amount each time
  mockSystemState.uptimeSeconds += Math.floor(Math.random() * 10);
  mockSystemState.lastChecked = new Date().toISOString();
  
  console.log("[API] Fetching system info", mockSystemState);
  return { ...mockSystemState };
}

export async function rebootSystem(): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Rebooting system");
  
  // Simulate reboot by resetting uptime
  mockSystemState.uptimeSeconds = 0;
  mockSystemState.lastChecked = new Date().toISOString();
  
  return true;
}

export async function updateAutoUpdate(enabled: boolean): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Updating auto-update setting", enabled);
  
  mockSystemState.autoUpdateEnabled = enabled;
  return true;
}

export async function checkForUpdates(): Promise<{ available: boolean; version?: string } | null> {
  await simulateDelay();
  console.log("[API] Checking for updates");
  
  // Simulate 30% chance of update available
  const updateAvailable = Math.random() > 0.7;
  
  if (updateAvailable) {
    return {
      available: true,
      version: "v2.4.2",
    };
  }
  
  return {
    available: false,
  };
}

export async function installUpdate(): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Installing update");
  
  // Simulate successful update
  mockSystemState.firmwareVersion = "v2.4.2";
  mockSystemState.uptimeSeconds = 0; // Reset uptime after update
  
  return true;
}

