"use client";

import React from "react";
import Link from "next/link";
import { HardDrive, Laptop, MonitorSmartphone, Smartphone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigateAndScroll } from "@/hooks/useNavigateAndScroll";

export function DevicesSummaryCard() {
  const navigateAndScroll = useNavigateAndScroll();

  const deviceStats = {
    total: 12,
    online: 8,
    offline: 4,
    breakdown: [
      { type: "Mobile", count: 5, icon: Smartphone },
      { type: "Laptop", count: 3, icon: Laptop },
      { type: "Smart Device", count: 4, icon: MonitorSmartphone },
    ],
  };

  const handleCardClick = () => {
    navigateAndScroll("/devices", '[data-tour="devices-table"]', {
      block: "start",
      highlight: true,
    });
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/20"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4 text-indigo-400" />
            Connected Devices
          </CardTitle>
          <CardDescription className="text-xs">
            Network device overview
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-3">
            <div className="text-xs font-medium text-emerald-400">Online</div>
            <div className="text-2xl font-bold text-emerald-300">
              {deviceStats.online}
            </div>
          </div>
          <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <div className="text-xs font-medium text-slate-400">Offline</div>
            <div className="text-2xl font-bold text-slate-300">
              {deviceStats.offline}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400">By Type</div>
          <div className="space-y-2">
            {deviceStats.breakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{item.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-100">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/devices">Manage All Devices</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
