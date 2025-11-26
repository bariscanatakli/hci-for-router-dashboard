"use client";

import React from "react";
import { InternetStatusCard } from "@/components/dashboard/InternetStatusCard";
import { WifiStatusCard } from "@/components/dashboard/WifiStatusCard";
import { DevicesSummaryCard } from "@/components/dashboard/DevicesSummaryCard";
import { SystemHealthCard } from "@/components/dashboard/SystemHealthCard";
import { BandwidthMiniChart } from "@/components/dashboard/BandwidthMiniChart";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6" data-tour="page-dashboard">
      <div data-tour="page-header" className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="h-8 w-8 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Overview of your network status and health
          </p>
        </div>
      </div>

      <div className="space-y-2" data-tour="dashboard-header">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50" data-tour="dashboard-heading">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-400">
          Monitor your network status and performance at a glance
        </p>
      </div>

      <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
        Preview data only — connect telemetry to see live router status and actions.
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-tour="dashboard-status-cards">
        <InternetStatusCard />
        <WifiStatusCard />
        <DevicesSummaryCard />
      </div>

      <div className="grid gap-6 md:grid-cols-2" data-tour="dashboard-health-cards">
        <BandwidthMiniChart />
        <SystemHealthCard />
      </div>
    </div>
  );
}