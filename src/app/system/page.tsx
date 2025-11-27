"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cpu, HardDrive, Shield, Timer, Settings, Activity, Thermometer, Clock, Wifi, Server } from "lucide-react";
import { FirmwareCard } from "@/components/system/FirmwareCard";
import { RebootCard } from "@/components/system/RebootCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/lib/types/system";
import { cn } from "@/lib/utils";
import { setAutoUpdateEnabled, useSettingsState } from "@/store/settingsStore";
import { fetchSystemInfo, rebootSystem, updateAutoUpdate } from "@/lib/api/system";
import { InfoBadge } from "@/components/ui/info-badge";

export default function SystemPage() {
  const { autoUpdateEnabled } = useSettingsState();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [cachedStatus, setCachedStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cachedStatusRef = useRef<SystemStatus | null>(null);
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);
  const [retryIn, setRetryIn] = useState<number | null>(null);

  // Fetch system info on mount and periodically
  const loadSystemInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryIn(null);
    setLastAttempt(Date.now());
    try {
      const data = await fetchSystemInfo();
      if (data) {
        setStatus(data);
        setCachedStatus(data);
        cachedStatusRef.current = data;
      } else {
        setError("Couldn't load system info. Check connection and retry.");
        if (cachedStatusRef.current) setStatus(cachedStatusRef.current);
      }
    } catch (err) {
      console.error("[System] Failed to load", err);
      setError("Couldn't load system info. Check connection and retry.");
      if (cachedStatusRef.current) setStatus(cachedStatusRef.current);
      setRetryIn(15);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSystemInfo();

    // Refresh every 30 seconds
    const interval = setInterval(loadSystemInfo, 30000);
    return () => clearInterval(interval);
  }, [loadSystemInfo]);

  useEffect(() => {
    if (retryIn === null) return;
    if (retryIn <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSystemInfo();
      return;
    }
    const t = setTimeout(() => setRetryIn((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [retryIn, loadSystemInfo]);

  // Sync auto-update with global settings
  useEffect(() => {
    if (!status) return;
    
    const syncAutoUpdate = async () => {
      const success = await updateAutoUpdate(autoUpdateEnabled);
      if (success) {
        setStatus((s) => s ? { ...s, autoUpdateEnabled } : null);
      }
    };
    
    if (status.autoUpdateEnabled !== autoUpdateEnabled) {
      syncAutoUpdate();
    }
  }, [autoUpdateEnabled, status]);

  const uptime = useMemo(() => {
    if (!status) return "Loading...";
    const days = Math.floor(status.uptimeSeconds / 86400);
    const hours = Math.floor((status.uptimeSeconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }, [status]);

  const handleReboot = async () => {
    const success = await rebootSystem();
    if (success) {
      setToast("Router is rebooting... This will take about 2 minutes.");
      setTimeout(() => setToast(null), 5000);
      // Refresh status after reboot simulation
      setTimeout(async () => {
        const data = await fetchSystemInfo();
        if (data) setStatus(data);
      }, 3000);
    } else {
      setToast("Failed to initiate reboot");
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">System</h1>
          <p className="text-sm text-slate-400">Loading system information...</p>
        </header>
        {error && (
          <Card className="border-amber-800/60 bg-amber-950/40">
            <CardContent className="space-y-3 p-4 text-sm text-amber-100">
              <p>{error}</p>
              <p className="text-xs text-amber-200">
                Last attempt: {lastAttempt ? new Date(lastAttempt).toLocaleTimeString() : "—"}
              </p>
              {retryIn !== null && retryIn > 0 && (
                <p className="text-xs text-amber-200">Auto-retrying in {retryIn}s…</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600" onClick={loadSystemInfo} disabled={loading}>
                  Retry now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">System</h1>
          <p className="text-sm text-slate-400">We couldn&apos;t load system data. Retry or use cached info.</p>
        </header>
        <Card className="border-amber-800/60 bg-amber-950/40">
          <CardContent className="space-y-3 p-4 text-sm text-amber-100">
            <p>{error ?? "Unknown error."}</p>
            <p className="text-xs text-amber-200">
              Last attempt: {lastAttempt ? new Date(lastAttempt).toLocaleTimeString() : "—"}
            </p>
            {retryIn !== null && retryIn > 0 && (
              <p className="text-xs text-amber-200">Auto-retrying in {retryIn}s…</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600" onClick={loadSystemInfo} disabled={loading}>
                Retry loading
              </Button>
              {cachedStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-800 text-slate-100 hover:bg-slate-900"
                  onClick={() => setStatus(cachedStatus)}
                >
                  Use last known info
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-tour="page-system">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
          <Settings className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-50" data-tour="system-heading">System</h1>
            <InfoBadge
              content="Firmware, uptime, and maintenance actions are mocked; connect API to enable real controls."
              aria-label="System info"
            >
              i
            </InfoBadge>
          </div>
          <p className="text-sm text-slate-400">
            Check firmware, uptime, and perform safe maintenance actions. Data is mocked until wired to API.
          </p>
        </div>
      </header>

      {/* KPI Cards - Full width grid */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6" data-tour="page-header">
        <KpiCard title="Uptime" value={uptime} icon={<Timer className="h-4 w-4" />} />
        <KpiCard title="Firmware" value={status.firmwareVersion} icon={<HardDrive className="h-4 w-4" />} />
        <KpiCard title="Health" value={status.health} icon={<Shield className="h-4 w-4" />} accent={status.health} />
        <KpiCard title="CPU Temp" value="42°C" icon={<Thermometer className="h-4 w-4" />} accent="good" />
      </section>

      {/* Firmware and Tips in 2-column layout */}
      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <div className="lg:col-span-2 h-full">
          <div data-tour="firmware-card" className="h-full">
            <FirmwareCard
              status={status}
              pendingVersion="v2.5.0"
              onCheckUpdate={() => {}}
              onApplyUpdate={() => {}}
              onToggleAutoUpdate={(enabled) => {
                setStatus((s) => s ? { ...s, autoUpdateEnabled: enabled } : null);
                setAutoUpdateEnabled(enabled);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {toast && (
            <div className="rounded-md border border-indigo-800 bg-indigo-950/30 px-3 py-2 text-sm text-indigo-100">
              {toast}
            </div>
          )}
          <Card className="border-slate-800 bg-slate-900/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" />
                Maintenance Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <ul className="space-y-2 list-disc pl-4">
                <li>Schedule firmware updates during low traffic hours (2-5 AM recommended).</li>
                <li>Reboot monthly to clear stale sessions and refresh memory.</li>
                <li>Back up configuration before major changes.</li>
                <li>Monitor CPU temperature during peak usage periods.</li>
                <li>Check logs weekly for unusual activity patterns.</li>
                <li>Keep at least 20% storage free for system operations.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reboot & Recovery - Full width for better visibility */}
      <div data-tour="reboot-card" className="mb-4">
        <RebootCard onReboot={handleReboot} onRestartModem={() => {}} />
      </div>

      {/* Additional System Info Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>CPU</span>
                <span>23%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: "23%" }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Memory</span>
                <span>48%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: "48%" }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Storage</span>
                <span>31%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: "31%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-400" />
              Network Interfaces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-300">WAN (eth0)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Connected</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-300">LAN (eth1-4)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-300">Wi-Fi 2.4GHz</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Broadcasting</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300">Wi-Fi 5GHz</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Broadcasting</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-amber-400" />
              System Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Model</span>
              <span className="text-slate-200">RT-AX86U Pro</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Serial</span>
              <span className="text-slate-200 font-mono text-xs">90D9•••4F2E</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">MAC</span>
              <span className="text-slate-200 font-mono text-xs">A4:5E:60:••:••:8C</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Boot</span>
              <span className="text-slate-200 text-xs">Nov 22, 14:32</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  accent = "good",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: "good" | "warning" | "critical" | string;
}) {
  const toneMap: Record<string, string> = {
    good: "border-emerald-800/40 bg-emerald-950/30 text-emerald-100",
    warning: "border-amber-800/40 bg-amber-950/30 text-amber-100",
    critical: "border-red-800/40 bg-red-950/30 text-red-100",
  };
  const tone = toneMap[accent] ?? "border-slate-800 bg-slate-900/40 text-slate-100";
  return (
    <Card className={cn("border", tone)}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <p className="text-xl font-semibold text-slate-50">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/60 text-slate-200">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
