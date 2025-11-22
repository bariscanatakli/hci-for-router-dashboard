// TODO: Build card UI using Shadcn Card + dummy data

"use client";

import React from "react";
import { Activity, ArrowDown, ArrowUp, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function InternetStatusCard() {
  const status = {
    connected: true,
    publicIp: "203.0.113.45",
    uptime: "12d 4h 23m",
    downloadSpeed: 847.2,
    uploadSpeed: 94.5,
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-indigo-400" />
              Internet Status
            </CardTitle>
            <CardDescription className="text-xs">
              WAN connection details
            </CardDescription>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              status.connected
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                status.connected ? "bg-emerald-400" : "bg-red-400"
              )}
            />
            {status.connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-400">Public IP</div>
          <div className="font-mono text-sm text-slate-100">
            {status.publicIp}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-400">Uptime</div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm text-slate-100">{status.uptime}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ArrowDown className="h-3 w-3 text-blue-400" />
              Download
            </div>
            <div className="text-lg font-semibold text-slate-50">
              {status.downloadSpeed}
              <span className="ml-1 text-xs font-normal text-slate-400">
                Mbps
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ArrowUp className="h-3 w-3 text-purple-400" />
              Upload
            </div>
            <div className="text-lg font-semibold text-slate-50">
              {status.uploadSpeed}
              <span className="ml-1 text-xs font-normal text-slate-400">
                Mbps
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
