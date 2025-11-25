import React from "react";
import { InternetStatusCard } from "@/components/dashboard/InternetStatusCard";
import { WifiStatusCard } from "@/components/dashboard/WifiStatusCard";
import { DevicesSummaryCard } from "@/components/dashboard/DevicesSummaryCard";
import { SystemHealthCard } from "@/components/dashboard/SystemHealthCard";
import { BandwidthMiniChart } from "@/components/dashboard/BandwidthMiniChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-400">
          Monitor your network status and performance at a glance
        </p>
      </div>

      <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
        Preview data only — connect telemetry to see live router status and actions.
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InternetStatusCard />
        <WifiStatusCard />
        <DevicesSummaryCard />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BandwidthMiniChart />
        <SystemHealthCard />
      </div>
    </div>
  );
}
