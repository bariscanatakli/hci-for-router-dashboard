"use client";

import React, { useMemo, useState } from "react";
import { Plus, RefreshCw, SlidersHorizontal } from "lucide-react";
import { DeviceTable } from "@/components/devices/DeviceTable";
import { DeviceDetailDialog } from "@/components/devices/DeviceDetailDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NetworkDevice } from "@/lib/types/devices";
import { cn } from "@/lib/utils";
import { useFeedback } from "@/components/ui/feedback";

const mockDevices: NetworkDevice[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    ipAddress: "192.168.1.12",
    macAddress: "02:1A:EF:65:90:AB",
    connectionType: "wifi",
    online: true,
    vendor: "Apple",
    signalStrength: 92,
    usageMbps: 8.3,
    lastSeen: "Just now",
    tags: ["Trusted"],
  },
  {
    id: "2",
    name: "Work Laptop",
    ipAddress: "192.168.1.33",
    macAddress: "0C:4D:E9:90:AA:11",
    connectionType: "ethernet",
    online: true,
    vendor: "Dell",
    usageMbps: 14.2,
    lastSeen: "2m ago",
    tags: ["Priority"],
  },
  {
    id: "3",
    name: "Smart TV",
    ipAddress: "192.168.1.44",
    macAddress: "18:3F:B7:CD:10:22",
    connectionType: "wifi",
    online: false,
    vendor: "Samsung",
    signalStrength: 64,
    usageMbps: 0.0,
    lastSeen: "3h ago",
  },
  {
    id: "4",
    name: "Thermostat",
    ipAddress: "192.168.1.58",
    macAddress: "BC:52:3E:AA:66:71",
    connectionType: "wifi",
    online: true,
    vendor: "Nest",
    signalStrength: 87,
    usageMbps: 0.2,
    lastSeen: "6m ago",
    tags: ["IoT"],
  },
];

type StatusFilter = "all" | "online" | "offline";

export default function DevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { notify } = useFeedback();

  const filteredDevices = useMemo(() => {
    return mockDevices.filter((device) => {
      const matchesQuery =
        device.name.toLowerCase().includes(query.toLowerCase()) ||
        device.ipAddress.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && device.online) ||
        (statusFilter === "offline" && !device.online);
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const onlineCount = mockDevices.filter((d) => d.online).length;
  const totalCount = mockDevices.length;
  const offlineCount = totalCount - onlineCount;

  const triggerFeedback = (message: string) => {
    notify({ title: message, tone: "info" });
  };

  return (
    <div className="space-y-8" data-tour="page-devices">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" data-tour="devices-header">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50" data-tour="devices-heading">
            Devices
          </h1>
          <p className="text-sm text-slate-400">
            Manage device access, prioritize critical hardware, and monitor usage.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 border border-slate-800 bg-slate-900/60 text-xs text-slate-100"
            onClick={() => triggerFeedback("Device list refreshed (mock).")}
            >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 bg-indigo-500 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-600"
            onClick={() => triggerFeedback("Add device flow coming soon.")}
          >
            <Plus className="h-4 w-4" />
            Add device
          </Button>
        </div>
      </header>

      <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-100" data-tour="devices-info">
        Preview data only. Device list and actions are simulated until API wiring is enabled.
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-tour="devices-stats">
        <StatCard label="Total devices" value={totalCount} />
        <StatCard label="Online" value={onlineCount} tone="positive" />
        <StatCard label="Offline" value={offlineCount} tone="warning" />
      </section>

      <Card className="border-slate-800 bg-slate-900/30">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:max-w-md">
            <label className="text-xs font-medium text-slate-400" htmlFor="device-search">
              Search
            </label>
            <Input
              id="device-search"
              placeholder="Search by name or IP"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-slate-950/70 text-sm text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="All"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <FilterChip
              label="Online"
              active={statusFilter === "online"}
              onClick={() => setStatusFilter("online")}
            />
            <FilterChip
              label="Offline"
              active={statusFilter === "offline"}
              onClick={() => setStatusFilter("offline")}
            />
            <Separator className="hidden h-8 bg-slate-800 sm:block" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-slate-200 hover:bg-slate-900"
              onClick={() => triggerFeedback("More filters coming soon.")}
            >
              <SlidersHorizontal className="h-4 w-4" />
              More filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeviceTable
        devices={filteredDevices}
        onInspect={(device) => setSelectedDevice(device)}
        summary="Status, usage, and quick actions for connected devices."
      />

      <DeviceDetailDialog
        device={selectedDevice}
        open={!!selectedDevice}
        onOpenChange={(open) => {
          if (!open) setSelectedDevice(null);
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "warning";
}) {
  const toneClasses =
    tone === "positive"
      ? "border-emerald-800/40 bg-emerald-950/30 text-emerald-200"
      : tone === "warning"
        ? "border-amber-800/40 bg-amber-950/20 text-amber-200"
        : "border-slate-800 bg-slate-900/40 text-slate-100";

  return (
    <Card className={cn("border", toneClasses)}>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "rounded-full border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 hover:bg-slate-900",
        active && "border-indigo-500/70 bg-indigo-500/15 text-indigo-100"
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
