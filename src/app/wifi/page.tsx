"use client";

import React, { useMemo, useState } from "react";
import { Wifi, Activity, ShieldCheck } from "lucide-react";
import { WifiForm } from "@/components/wifi/WifiForm";
import { GuestWifiToggle } from "@/components/wifi/GuestWifiToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { WifiConfig, WifiStatus } from "@/lib/types/wifi";
import { useSettingsState } from "@/store/settingsStore";
import { useFeedback } from "@/components/ui/feedback";

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
  const [pendingStatus, setPendingStatus] = useState<WifiStatus | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showDevices, setShowDevices] = useState(false);
  const [showBasicPassword, setShowBasicPassword] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    transmitPower: 75,
    dfsChannels: true,
    macFiltering: false,
    bandSteering: true,
  });
  const { mode } = useSettingsState();
  const { notify } = useFeedback();

  const effectiveStatus = pendingStatus ?? status;

  const regenerateGuest = () => {
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    const newSsid = `Guest-${randomSuffix}`;
    const newPassword = `guest-${randomSuffix}`;
    setConfig((c) => ({ ...c, guestSsid: newSsid, guestPassword: newPassword, guestEnabled: true }));
    setPendingStatus((s) => ({ ...(s ?? effectiveStatus), guestEnabled: true }));
  };

  const signalTone = useMemo(() => {
    if (effectiveStatus.signalStrength >= 90) return "text-emerald-300";
    if (effectiveStatus.signalStrength >= 70) return "text-blue-300";
    if (effectiveStatus.signalStrength >= 50) return "text-amber-300";
    return "text-red-300";
  }, [effectiveStatus.signalStrength]);

  return (
    <div className="space-y-8" data-tour="page-wifi">
      <header className="flex flex-col gap-2" data-tour="wifi-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50" data-tour="wifi-heading">Wi-Fi</h1>
            <p className="text-sm text-slate-400">
              Configure wireless networks, guest access, and security posture. Preview mode — changes do not persist.
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-100" data-tour="wifi-banner">
        Preview data only. Apply buttons simulate changes locally; real updates will come once API wiring is enabled.
      </div>

      {pendingStatus && (
        <div className="flex flex-col gap-2 rounded-md border border-indigo-800 bg-indigo-950/30 px-3 py-3 text-sm text-indigo-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="font-semibold">Pending Wi-Fi changes</span>
            <span className="text-xs text-indigo-200">Apply to confirm or discard to revert.</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-indigo-100"
              onClick={() => {
                setPendingStatus(null);
                setNotice("Changes discarded.");
                setTimeout(() => setNotice(null), 2000);
              }}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={() => {
                if (!pendingStatus) return;
                setStatus(pendingStatus);
                setPendingStatus(null);
                setNotice("Wi-Fi changes applied (mock).");
                setTimeout(() => setNotice(null), 2000);
              }}
            >
              Apply changes
            </Button>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3" data-tour="wifi-status">
        <StatusCard
          title="Wi-Fi Enabled"
          description="Broadcast status and control"
          value={
            pendingStatus
              ? `${status.enabled ? "On" : "Off"} → ${pendingStatus.enabled ? "On" : "Off"}`
              : effectiveStatus.enabled
                ? "On"
                : "Off"
          }
          accent={effectiveStatus.enabled ? "emerald" : "red"}
          action={
            <Switch
              checked={effectiveStatus.enabled}
              onCheckedChange={(checked) =>
                setPendingStatus((s) => ({ ...(s ?? effectiveStatus), enabled: checked, guestEnabled: checked ? effectiveStatus.guestEnabled : false }))
              }
              aria-label="Toggle Wi-Fi"
            />
          }
        />
        <StatusCard
          title="Signal Quality"
          description="Current strength to clients"
          value={`${effectiveStatus.signalStrength}%`}
          accent="indigo"
        />
        <StatusCard
          title="Connected Devices"
          description="Today’s active clients"
          value={`${effectiveStatus.connectedDevices} devices`}
          accent="blue"
          onClick={() => setShowDevices((v) => !v)}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {mode === "basic" ? (
            <Card className="border-slate-800 bg-slate-900/50" data-hci="wifi-basic-form">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wifi className="h-4 w-4 text-indigo-400" />
                    Basic Wi-Fi setup
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update home network name and password. Advanced controls are available in Expert mode.
                  </CardDescription>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-indigo-200">Basic mode</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Network Name (SSID)</label>
                    <input
                      value={config.ssid}
                      onChange={(e) => setConfig((c) => ({ ...c, ssid: e.target.value }))}
                      placeholder="HomeNetwork"
                      className="w-full rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Password</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showBasicPassword ? "text" : "password"}
                        value={config.password}
                        onChange={(e) => setConfig((c) => ({ ...c, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[88px] border-slate-800 text-xs text-slate-200"
                        onClick={() => setShowBasicPassword((v) => !v)}
                      >
                        {showBasicPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-200"
                    onClick={() => {
                      setConfig(mockConfig);
                      setNotice("Reverted to mock defaults.");
                      setTimeout(() => setNotice(null), 1800);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-500 text-white hover:bg-indigo-600"
                    onClick={() => {
                      setSavingBasic(true);
                      setStatus((s) => ({ ...s, enabled: true }));
                      setNotice("Saving Wi-Fi settings…");
                      setTimeout(() => {
                        setSavingBasic(false);
                        setNotice("Wi-Fi settings saved (mock).");
                        setTimeout(() => setNotice(null), 2000);
                      }, 600);
                    }}
                    disabled={savingBasic}
                  >
                    {savingBasic ? "Saving…" : "Save basic settings"}
                  </Button>
                </div>
                {notice && (
                  <div
                    className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-200"
                    role="status"
                    aria-live="polite"
                  >
                    {notice}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <WifiForm config={config} onChange={setConfig} disabled={!effectiveStatus.enabled} />
          )}

          {mode === "expert" && (
            <Card className="border-slate-800 bg-slate-900/60" data-tour="wifi-advanced">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Advanced Wi-Fi controls
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Power, DFS, MAC filtering and band steering. Expert mode only.
                  </CardDescription>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-indigo-200">Expert</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Transmit power</span>
                      <span className="font-semibold text-slate-100">{advancedSettings.transmitPower}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={advancedSettings.transmitPower}
                      onChange={(e) =>
                        setAdvancedSettings((s) => ({ ...s, transmitPower: Number(e.target.value) }))
                      }
                      className="w-full accent-indigo-400"
                    />
                    <p className="text-[11px] text-slate-500">Lower power to reduce bleed into neighbor areas.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">DFS channels</div>
                      <Switch
                        checked={advancedSettings.dfsChannels}
                        onCheckedChange={(checked) =>
                          setAdvancedSettings((s) => ({ ...s, dfsChannels: checked }))
                        }
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Enable radar-avoid channels for less interference (may cause occasional channel shifts).
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-200">MAC filtering</div>
                      <div className="text-[11px] text-slate-500">Block/allow by MAC list (config pending)</div>
                    </div>
                    <Switch
                      checked={advancedSettings.macFiltering}
                      onCheckedChange={(checked) =>
                        setAdvancedSettings((s) => ({ ...s, macFiltering: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-200">Band steering</div>
                      <div className="text-[11px] text-slate-500">Auto-push clients to 5/6 GHz when possible</div>
                    </div>
                    <Switch
                      checked={advancedSettings.bandSteering}
                      onCheckedChange={(checked) =>
                        setAdvancedSettings((s) => ({ ...s, bandSteering: checked }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-indigo-500 text-white hover:bg-indigo-600"
                    onClick={() => notify({ title: "Advanced Wi-Fi saved", description: "Mock update applied", tone: "success" })}
                  >
                    Save advanced controls
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                {effectiveStatus.currentThroughputMbps} Mbps
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500"
                  style={{ width: `${Math.min((effectiveStatus.currentThroughputMbps / 500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                This bar uses mock data. Connect to real telemetry to reflect live traffic.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {mode === "expert" && (
            <GuestWifiToggle
              enabled={effectiveStatus.enabled && effectiveStatus.guestEnabled}
              guestSsid={config.guestSsid}
              guestPassword={config.guestPassword}
              onToggle={(enabled) => {
                setPendingStatus((s) => ({ ...(s ?? effectiveStatus), guestEnabled: enabled }));
                setConfig((c) => ({ ...c, guestEnabled: enabled }));
              }}
              onUpdateCredentials={(ssid, password) =>
                setConfig((c) => ({ ...c, guestSsid: ssid, guestPassword: password }))
              }
              onRegenerate={() => {
                regenerateGuest();
              }}
            />
          )}

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

      {notice && (
        <div
          className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      )}
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
