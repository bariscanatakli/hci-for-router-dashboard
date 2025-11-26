"use client";

import React from "react";
import { ArrowDownToLine, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SystemStatus } from "@/lib/types/system";
import { cn, formatRelativeTime, formatShortDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [confirmApply, setConfirmApply] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [updateInProgress, setUpdateInProgress] = React.useState(false);
  const [updateProgress, setUpdateProgress] = React.useState(0);

  React.useEffect(() => {
    if (!feedback || updateInProgress) return;
    const t = setTimeout(() => setFeedback(null), 2400);
    return () => clearTimeout(t);
  }, [feedback, updateInProgress]);

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
            <p className="text-sm text-slate-100">{status.lastChecked ? formatRelativeTime(status.lastChecked) : "Unknown"}</p>
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
              onClick={() => {
                onCheckUpdate?.();
                setFeedback("Checking for updates...");
              }}
              disabled={updateInProgress}
            >
              <RefreshCw className="h-4 w-4" />
              Check updates
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-indigo-500 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-600"
              disabled={!pendingVersion || updateInProgress}
              onClick={() => setConfirmApply(true)}
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
            onCheckedChange={(checked) => {
              onToggleAutoUpdate?.(checked);
              setFeedback(checked ? "Auto-updates enabled (mock)." : "Auto-updates paused (mock).");
            }}
            aria-label="Toggle auto-updates"
          />
        </div>
      </CardContent>

      {updateInProgress && (
        <div className="border-t border-slate-800 bg-indigo-950/20 px-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-200">Update in progress...</span>
              <span className="font-mono text-indigo-300">{updateProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Do not power off the router. This may take 2-3 minutes.
            </p>
          </div>
        </div>
      )}

      {feedback && !updateInProgress && (
        <div className="px-6 pb-4 text-xs text-slate-300" role="status" aria-live="polite">
          {feedback}
        </div>
      )}

      <Dialog open={confirmApply} onOpenChange={(open) => !open && setConfirmApply(false)}>
        <DialogContent className="bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Apply firmware update?</DialogTitle>
            <DialogDescription>
              Devices may restart and disconnect during the update. Ensure off-peak hours before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
            Pending version: {pendingVersion ?? "Unknown"}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setConfirmApply(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmApply(false);
                setUpdateInProgress(true);
                setFeedback("Starting update...");
                
                // Simulate update progress
                let progress = 0;
                const interval = setInterval(() => {
                  progress += Math.random() * 15 + 5;
                  if (progress >= 100) {
                    progress = 100;
                    setUpdateProgress(100);
                    clearInterval(interval);
                    setTimeout(() => {
                      onApplyUpdate?.();
                      setUpdateInProgress(false);
                      setUpdateProgress(0);
                      setFeedback("Update completed successfully!");
                    }, 1000);
                  } else {
                    setUpdateProgress(Math.floor(progress));
                  }
                }, 800);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
