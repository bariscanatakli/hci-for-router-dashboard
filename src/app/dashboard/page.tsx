"use client";

import React from "react";
import { InternetStatusCard } from "@/components/dashboard/InternetStatusCard";
import { WifiStatusCard } from "@/components/dashboard/WifiStatusCard";
import { DevicesSummaryCard } from "@/components/dashboard/DevicesSummaryCard";
import { SystemHealthCard } from "@/components/dashboard/SystemHealthCard";
import { BandwidthMiniChart } from "@/components/dashboard/BandwidthMiniChart";
import { LayoutDashboard, Activity, Shield, Wifi, Cpu, MonitorSmartphone } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6" data-tour="page-dashboard">
      <div data-tour="page-header" className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="h-8 w-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-400">Overview of your network status and health</p>
        </div>
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

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-slate-50">Quick access</h2>
          <p className="text-xs text-slate-500">Jump to any section</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/wifi", label: "Wi-Fi", icon: Wifi, desc: "Configure SSIDs, guest access, radio tuning" },
            { href: "/security", label: "Security", icon: Shield, desc: "Firewall, IPS, port forwards" },
            { href: "/performance", label: "Performance", icon: Activity, desc: "Charts, QoS, alerts" },
            { href: "/devices", label: "Devices", icon: MonitorSmartphone, desc: "Manage connected clients" },
            { href: "/system", label: "System", icon: Cpu, desc: "Firmware, uptime, maintenance" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-left text-slate-100 transition hover:border-indigo-500/60 hover:bg-slate-900/80"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
                  <Icon className="h-4 w-4 text-indigo-300" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
