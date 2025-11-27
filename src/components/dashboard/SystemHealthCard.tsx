"use client";

import React from "react";
import { Cpu, HardDrive, Server, Thermometer, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoBadge } from "@/components/ui/info-badge";
import { useNavigateAndScroll } from "@/hooks/useNavigateAndScroll";

export function SystemHealthCard() {
  const navigateAndScroll = useNavigateAndScroll();
  const systemHealth = {
    overall: "good" as const,
    firmwareVersion: "v2.4.1",
    uptimeSeconds: 1036800, // 12 days in seconds
    metrics: [
      { label: "CPU Usage", value: 32, unit: "%", icon: Cpu, color: "blue" },
      {
        label: "Memory",
        value: 58,
        unit: "%",
        icon: HardDrive,
        color: "purple",
      },
      {
        label: "Temperature",
        value: 45,
        unit: "°C",
        icon: Thermometer,
        color: "emerald",
      },
    ],
    alerts: ["Check firmware update available in System"],
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "good":
        return "text-emerald-400 bg-emerald-500/10";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10";
      case "critical":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-slate-400 bg-slate-500/10";
    }
  };

  const getMetricColor = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-500 to-blue-600";
      case "purple":
        return "from-purple-500 to-purple-600";
      case "emerald":
        return "from-emerald-500 to-emerald-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatUptimeLong = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;
  };

  const handleNavigate = () =>
    navigateAndScroll("/system", '[data-tour="system-heading"]', {
      block: "start",
      highlight: true,
    });

  return (
    <Card
      className="border-slate-800 bg-slate-900/50 cursor-pointer transition hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/20"
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-indigo-400" />
              System Health
              <InfoBadge
                content="CPU, memory, temperature, and uptime are preview-only; wire telemetry for live data."
                aria-label="System health info"
              >
                i
              </InfoBadge>
            </CardTitle>
            <CardDescription className="text-xs">
              Router performance metrics
            </CardDescription>
          </div>
          <div
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
              getHealthColor(systemHealth.overall)
            )}
          >
            {systemHealth.overall}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Firmware</div>
            <div className="font-mono text-sm font-medium text-slate-100">
              {systemHealth.firmwareVersion}
            </div>
            <p className="text-[11px] text-slate-500">Preview data — open System for live info.</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Uptime</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-slate-200 cursor-help">
                    {formatUptime(systemHealth.uptimeSeconds)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatUptimeLong(systemHealth.uptimeSeconds)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-3">
          {systemHealth.metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-400">
                      {metric.label}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-100">
                    {metric.value}
                    {metric.unit}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      getMetricColor(metric.color)
                    )}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* S3/S8: Show all alerts in a single consolidated line */}
        {systemHealth.alerts && systemHealth.alerts.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-200">
              {systemHealth.alerts.length === 1 
                ? systemHealth.alerts[0]
                : `${systemHealth.alerts.length} warnings: ${systemHealth.alerts.join(" • ")}`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
