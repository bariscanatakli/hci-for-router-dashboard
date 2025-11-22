"use client";

import React, { useMemo, useState } from "react";
import { Cpu, HardDrive, Shield, Timer } from "lucide-react";
import { FirmwareCard } from "@/components/system/FirmwareCard";
import { RebootCard } from "@/components/system/RebootCard";
import { Card, CardContent } from "@/components/ui/card";
import { SystemStatus } from "@/lib/types/system";
import { cn } from "@/lib/utils";

const mockStatus: SystemStatus = {
  firmwareVersion: "v2.4.1",
  uptimeSeconds: 936234,
  health: "good",
  lastChecked: "2h ago",
  autoUpdateEnabled: true,
};

export default function SystemPage() {
  const [status, setStatus] = useState<SystemStatus>(mockStatus);
  const uptime = useMemo(() => {
    const days = Math.floor(status.uptimeSeconds / 86400);
    const hours = Math.floor((status.uptimeSeconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }, [status.uptimeSeconds]);

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
            onToggleAutoUpdate={(enabled) => setStatus((s) => ({ ...s, autoUpdateEnabled: enabled }))}
          />
          <RebootCard onReboot={() => {}} onRestartModem={() => {}} />
        </div>
        <div className="space-y-3">
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
