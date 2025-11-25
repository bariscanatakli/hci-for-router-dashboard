import { SecurityProfile, PortForwardRule } from "../types/security";

// Mock in-memory state for security profile
let mockSecurityState: SecurityProfile = {
  firewallLevel: 2,
  portForwards: [
    {
      id: "pf1",
      name: "Web Server",
      port: 80,
      targetIp: "192.168.1.100",
      protocol: "tcp",
    },
    {
      id: "pf2",
      name: "Game Server",
      port: 25565,
      targetIp: "192.168.1.105",
      protocol: "tcp",
    },
  ],
  intrusionPreventionEnabled: true,
  threatBlocks24h: 47,
  lastScan: new Date().toISOString(),
};

const simulateDelay = () => 
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

export async function fetchSecurityProfile(): Promise<SecurityProfile | null> {
  await simulateDelay();
  console.log("[API] Fetching security profile", mockSecurityState);
  return { ...mockSecurityState };
}

export async function updateSecurityProfile(profile: SecurityProfile): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Updating security profile", profile);
  
  // Validate before applying
  if (profile.firewallLevel < 0 || profile.firewallLevel > 3) {
    console.error("[API] Invalid firewall level");
    return false;
  }
  
  // Update mock state
  mockSecurityState = { ...profile };
  
  return true;
}

export async function addPortForwardRule(rule: PortForwardRule): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Adding port forward rule", rule);
  
  // Check for duplicate ports
  const exists = mockSecurityState.portForwards.some(r => r.port === rule.port);
  if (exists) {
    console.error("[API] Port already in use");
    return false;
  }
  
  mockSecurityState.portForwards.push(rule);
  return true;
}

export async function removePortForwardRule(ruleId: string): Promise<boolean> {
  await simulateDelay();
  console.log("[API] Removing port forward rule", ruleId);
  
  const initialLength = mockSecurityState.portForwards.length;
  mockSecurityState.portForwards = mockSecurityState.portForwards.filter(
    r => r.id !== ruleId
  );
  
  return mockSecurityState.portForwards.length < initialLength;
}

