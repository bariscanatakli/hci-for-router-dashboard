"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cpu, HardDrive, Shield, Timer } from "lucide-react";
import { FirmwareCard } from "@/components/system/FirmwareCard";
import { RebootCard } from "@/components/system/RebootCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/lib/types/system";
import { cn } from "@/lib/utils";
import { setAutoUpdateEnabled, useSettingsState } from "@/store/settingsStore";
import { fetchSystemInfo, rebootSystem, updateAutoUpdate } from "@/lib/api/system";

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
    loadSystemInfo();

    // Refresh every 30 seconds
    const interval = setInterval(loadSystemInfo, 30000);
    return () => clearInterval(interval);
  }, [loadSystemInfo]);

  useEffect(() => {
    if (retryIn === null) return;
    if (retryIn <= 0) {
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
          <p className="text-sm text-slate-400">We couldn't load system data. Retry or use cached info.</p>
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
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">System</h1>
        <p className="text-sm text-slate-400">
          Check firmware, uptime, and perform safe maintenance actions. Data is mocked until wired to API.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Uptime" value={uptime} icon={<Timer className="h-4 w-4" />} />
        <KpiCard title="Firmware" value={status.firmwareVersion} icon={<HardDrive className="h-4 w-4" />} />
        <KpiCard title="Health" value={status.health} icon={<Shield className="h-4 w-4" />} accent={status.health} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
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
          <RebootCard onReboot={handleReboot} onRestartModem={() => {}} />
        </div>
        <div className="space-y-3">
          {toast && (
            <div className="rounded-md border border-indigo-800 bg-indigo-950/30 px-3 py-2 text-sm text-indigo-100">
              {toast}
            </div>
          )}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="space-y-2 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Cpu className="h-4 w-4 text-indigo-400" /> Maintenance tips
              </div>
              <ul className="space-y-1 list-disc pl-4">
                <li>Schedule firmware updates during low traffic hours.</li>
                <li>Reboot monthly to clear stale sessions.</li>
                <li>Back up config before major changes.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
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
