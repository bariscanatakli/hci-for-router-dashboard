"use client";

import React, { useMemo, useState } from "react";
import { Wifi, Activity, ShieldCheck } from "lucide-react";
import { WifiForm } from "@/components/wifi/WifiForm";
import { GuestWifiToggle } from "@/components/wifi/GuestWifiToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { WifiConfig, WifiStatus } from "@/lib/types/wifi";

const mockConfig: WifiConfig = {
  ssid: "HomeNetwork",
  password: "secure-password",
  band: "5GHz",
  guestEnabled: true,
  guestSsid: "HomeGuest",
  guestPassword: "guest-pass",
  channel: 48,
  bandwidthMhz: 80,
  mode: "802.11ax",
  maxClients: 32,
  wpsEnabled: false,
  hidden: false,
};

const mockStatus: WifiStatus = {
  enabled: true,
  guestEnabled: true,
  connectedDevices: 8,
  signalStrength: 92,
  currentThroughputMbps: 238,
};

const mockConnectedDevices = [
  { name: "iPhone 15 Pro", type: "Mobile" },
  { name: "Work Laptop", type: "Laptop" },
  { name: "Smart TV", type: "Smart Device" },
  { name: "Thermostat", type: "IoT" },
];

export default function WifiPage() {
  const [config, setConfig] = useState<WifiConfig>(mockConfig);
  const [status, setStatus] = useState<WifiStatus>(mockStatus);
  const [showDevices, setShowDevices] = useState(false);

  const regenerateGuest = () => {
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    const newSsid = `Guest-${randomSuffix}`;
    const newPassword = `guest-${randomSuffix}`;
    setConfig((c) => ({ ...c, guestSsid: newSsid, guestPassword: newPassword, guestEnabled: true }));
    setStatus((s) => ({ ...s, guestEnabled: true }));
  };

  const signalTone = useMemo(() => {
    if (status.signalStrength >= 90) return "text-emerald-300";
    if (status.signalStrength >= 70) return "text-blue-300";
    if (status.signalStrength >= 50) return "text-amber-300";
    return "text-red-300";
  }, [status.signalStrength]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50">Wi-Fi</h1>
            <p className="text-sm text-slate-400">
              Configure wireless networks, guest access, and security posture.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Wi-Fi Enabled"
          description="Broadcast status and control"
          value={status.enabled ? "On" : "Off"}
          accent={status.enabled ? "emerald" : "red"}
          action={
            <Switch
              checked={status.enabled}
              onCheckedChange={(checked) => setStatus((s) => ({ ...s, enabled: checked }))}
              aria-label="Toggle Wi-Fi"
            />
          }
        />
        <StatusCard
          title="Signal Quality"
          description="Current strength to clients"
          value={`${status.signalStrength}%`}
          accent="indigo"
        />
        <StatusCard
          title="Connected Devices"
          description="Today’s active clients"
          value={`${status.connectedDevices} devices`}
          accent="blue"
          onClick={() => setShowDevices((v) => !v)}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <WifiForm config={config} onChange={setConfig} disabled={!status.enabled} />

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  Live Throughput
                </CardTitle>
                <CardDescription className="text-xs">
                  Near real-time Wi-Fi throughput from access point.
                </CardDescription>
              </div>
              <span className={cn("text-lg font-semibold", signalTone)}>
                {status.currentThroughputMbps} Mbps
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500"
                  style={{ width: `${Math.min((status.currentThroughputMbps / 500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                This bar uses mock data. Connect to real telemetry to reflect live traffic.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <GuestWifiToggle
            enabled={status.enabled && status.guestEnabled}
            guestSsid={config.guestSsid}
            guestPassword={config.guestPassword}
            onToggle={(enabled) => {
              setStatus((s) => ({ ...s, guestEnabled: enabled }));
              setConfig((c) => ({ ...c, guestEnabled: enabled }));
            }}
            onUpdateCredentials={(ssid, password) =>
              setConfig((c) => ({ ...c, guestSsid: ssid, guestPassword: password }))
            }
            onRegenerate={regenerateGuest}
          />

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Security posture
              </CardTitle>
              <CardDescription className="text-xs">
                Quick reminders to keep Wi-Fi secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <ChecklistItem text="Use strong, unique passwords for main and guest SSIDs." />
              <ChecklistItem text="Keep firmware up to date; schedule checks weekly." />
              <ChecklistItem text="Prefer WPA3; disable WPS when not needed." />
              <ChecklistItem text="Separate IoT devices on guest network when possible." />
            </CardContent>
          </Card>

          {showDevices && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base">Connected devices</CardTitle>
                <CardDescription className="text-xs">
                  Quick view from Wi-Fi status. Manage in Devices page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-200">
                {mockConnectedDevices.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <span>{d.name}</span>
                    <span className="text-xs text-slate-400">{d.type}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/devices">Open Devices</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function StatusCard({
  title,
  description,
  value,
  accent = "slate",
  action,
  onClick,
}: {
  title: string;
  description: string;
  value: string;
  accent?: "slate" | "emerald" | "red" | "indigo" | "blue";
  action?: React.ReactNode;
  onClick?: () => void;
}) {
  const accentMap: Record<string, string> = {
    slate: "border-slate-800 bg-slate-900/40 text-slate-100",
    emerald: "border-emerald-800/40 bg-emerald-950/30 text-emerald-100",
    red: "border-red-800/40 bg-red-950/30 text-red-100",
    indigo: "border-indigo-800/40 bg-indigo-950/30 text-indigo-100",
    blue: "border-blue-800/40 bg-blue-950/30 text-blue-100",
  };

  return (
    <Card
      className={cn(
        "border",
        accentMap[accent],
        onClick && "cursor-pointer transition hover:border-indigo-700 hover:bg-slate-900/70"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between gap-2 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-300">{title}</p>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{value}</div>
          {action && <div className="mt-2 flex justify-end">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>{text}</span>
    </div>
  );
}
