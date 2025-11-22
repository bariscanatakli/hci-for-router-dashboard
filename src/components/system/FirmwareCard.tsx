"use client";

import React from "react";
import { ArrowDownToLine, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SystemStatus } from "@/lib/types/system";
import { cn } from "@/lib/utils";

interface FirmwareCardProps {
  status: SystemStatus;
  onCheckUpdate?: () => void;
  onApplyUpdate?: () => void;
  onToggleAutoUpdate?: (enabled: boolean) => void;
  pendingVersion?: string;
}

export function FirmwareCard({
  status,
  onCheckUpdate,
  onApplyUpdate,
  onToggleAutoUpdate,
  pendingVersion,
}: FirmwareCardProps) {
  const healthTone =
    status.health === "good"
      ? "text-emerald-300 bg-emerald-500/10"
      : status.health === "warning"
        ? "text-amber-300 bg-amber-500/10"
        : "text-red-300 bg-red-500/10";

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base text-slate-100">Firmware</CardTitle>
          <CardDescription className="text-xs">
            Keep your router secure and stable with timely firmware updates.
          </CardDescription>
        </div>
        <div className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", healthTone)}>
          {status.health}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Current version</p>
            <p className="font-mono text-sm text-slate-100">{status.firmwareVersion}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Last checked</p>
            <p className="text-sm text-slate-100">{status.lastChecked ?? "Unknown"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            {pendingVersion ? (
              <span>
                Update available: <span className="font-semibold text-indigo-200">{pendingVersion}</span>
              </span>
            ) : (
              "No updates pending."
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs text-slate-200 hover:bg-slate-900"
              onClick={onCheckUpdate}
            >
              <RefreshCw className="h-4 w-4" />
              Check updates
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-indigo-500 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-600"
              disabled={!pendingVersion}
              onClick={onApplyUpdate}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Apply update
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">Auto-updates</span>
              <span className="text-xs text-slate-400">Apply critical fixes silently at night.</span>
            </div>
          </div>
          <Switch
            checked={!!status.autoUpdateEnabled}
            onCheckedChange={(checked) => onToggleAutoUpdate?.(checked)}
            aria-label="Toggle auto-updates"
          />
        </div>
      </CardContent>
    </Card>
  );
}
