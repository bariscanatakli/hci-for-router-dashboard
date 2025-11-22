"use client";

import React, { useMemo, useState } from "react";
import { Shield, Activity, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirewallLevelSlider } from "@/components/security/FirewallLevelSlider";
import { PortForwardWizard } from "@/components/security/PortForwardWizard";
import { Switch } from "@/components/ui/switch";
import { SecurityProfile, PortForwardRule } from "@/lib/types/security";
import { cn } from "@/lib/utils";

const mockProfile: SecurityProfile = {
  firewallLevel: 2,
  intrusionPreventionEnabled: true,
  threatBlocks24h: 12,
  lastScan: "2h ago",
  portForwards: [
    { id: "1", name: "Home NAS", port: 445, targetIp: "192.168.1.50", protocol: "tcp" },
    { id: "2", name: "Game Server", port: 25565, targetIp: "192.168.1.60", protocol: "udp" },
  ],
};

export default function SecurityPage() {
  const [profile, setProfile] = useState<SecurityProfile>(mockProfile);
  const [autoUpdatesEnabled, setAutoUpdatesEnabled] = useState(true);

  const riskMessage = useMemo(() => {
    if (profile.firewallLevel >= 3) return "Strict: New services are blocked by default.";
    if (profile.firewallLevel === 2) return "Balanced: Most services allowed, risky ports blocked.";
    return "Relaxed: Only basic protections enabled. Consider raising level.";
  }, [profile.firewallLevel]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50">Security</h1>
            <p className="text-sm text-slate-400">
              Adjust firewall posture, manage port forwards, and oversee threat prevention.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Firewall posture"
          description={riskMessage}
          value={`Level ${profile.firewallLevel}`}
          accent="indigo"
        />
        <StatusCard
          title="Threats blocked"
          description="Last 24 hours"
          value={`${profile.threatBlocks24h ?? 0}`}
          accent="emerald"
        />
        <StatusCard
          title="Last scan"
          description="Automatic vulnerability scan"
          value={profile.lastScan ?? "Unknown"}
          accent="blue"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <FirewallLevelSlider
            value={profile.firewallLevel}
            onChange={(level) => setProfile((p) => ({ ...p, firewallLevel: level }))}
            intrusionPreventionEnabled={profile.intrusionPreventionEnabled}
            onToggleIps={(enabled) => setProfile((p) => ({ ...p, intrusionPreventionEnabled: enabled }))}
          />

          <PortForwardWizard
            rules={profile.portForwards}
            onChange={(rules: PortForwardRule[]) => setProfile((p) => ({ ...p, portForwards: rules }))}
          />
        </div>

        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-indigo-400" />
                Real-time alerts
              </CardTitle>
              <CardDescription className="text-xs">
                Mock feed for blocked threats and policy events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <AlertItem
                icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                title="IPS blocked 5 port scans"
                time="5m ago"
              />
              <AlertItem
                icon={<ShieldOff className="h-3.5 w-3.5 text-amber-400" />}
                title="New IoT device detected on guest network"
                time="12m ago"
              />
              <AlertItem
                icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                title="Firewall rules synced successfully"
                time="28m ago"
              />
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Auto-updates</CardTitle>
                <CardDescription className="text-xs">
                  Keep security signatures fresh.
                </CardDescription>
              </div>
              <Switch
                checked={autoUpdatesEnabled}
                onCheckedChange={setAutoUpdatesEnabled}
                aria-label="Auto updates"
              />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className={cn("font-semibold", autoUpdatesEnabled ? "text-emerald-300" : "text-amber-200")}>
                  {autoUpdatesEnabled ? "Enabled" : "Paused"}
                </span>
              </div>
              <p>Updates run nightly at 03:00. You can trigger manual update in System.</p>
              <p className="text-xs text-slate-500">
                This toggle is local until API wiring; persist changes via System settings when available.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  description,
  value,
  accent = "slate",
}: {
  title: string;
  description: string;
  value: string;
  accent?: "slate" | "emerald" | "indigo" | "blue";
}) {
  const accentMap: Record<string, string> = {
    slate: "border-slate-800 bg-slate-900/40 text-slate-100",
    emerald: "border-emerald-800/40 bg-emerald-950/30 text-emerald-100",
    indigo: "border-indigo-800/40 bg-indigo-950/30 text-indigo-100",
    blue: "border-blue-800/40 bg-blue-950/30 text-blue-100",
  };

  return (
    <Card className={cn("border", accentMap[accent])}>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-medium text-slate-300">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
        <p className="text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function AlertItem({
  icon,
  title,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        <div className="text-xs text-slate-400">{time}</div>
      </div>
    </div>
  );
}
