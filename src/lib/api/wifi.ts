import { WifiConfig } from "../types/wifi";

// Mock in-memory state for WiFi configuration
let mockWifiState: WifiConfig = {
  ssid: "MyHomeNetwork",
  password: "SecurePass123!",
  hidden: false,
  guestEnabled: true,
  guestSsid: "Guest-Network",
  guestPassword: "GuestPass456",
  band: "5GHz",
  channel: 36,
  bandwidthMhz: 80,
  mode: "802.11ax",
  maxClients: 32,
  wpsEnabled: false,
};

const simulateDelay = () => 
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

export async function fetchWifiConfig(): Promise<WifiConfig | null> {
  await simulateDelay();
  console.log("[API] Fetching WiFi config", mockWifiState);
  return { ...mockWifiState };
}

export async function updateWifiConfig(config: WifiConfig): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Updating WiFi config", config);
  
  // Validate password length
  if (config.password.length < 8) {
    console.error("[API] Password too short");
    return false;
  }
  
  // Validate SSID
  if (!config.ssid || config.ssid.trim().length === 0) {
    console.error("[API] SSID cannot be empty");
    return false;
  }
  
  // Update mock state
  mockWifiState = { ...config };
  
  return true;
}

export async function toggleGuestWifi(enabled: boolean): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Toggling guest WiFi", enabled);
  
  mockWifiState.guestEnabled = enabled;
  return true;
}

export async function regenerateGuestCredentials(): Promise<{ ssid: string; password: string } | null> {
  await simulateDelay();
  console.log("[API] Regenerating guest credentials");
  
  const newGuestSsid = `Guest-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newGuestPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 4).toUpperCase();
  
  mockWifiState.guestSsid = newGuestSsid;
  mockWifiState.guestPassword = newGuestPassword;
  
  return {
    ssid: newGuestSsid,
    password: newGuestPassword,
  };
}

