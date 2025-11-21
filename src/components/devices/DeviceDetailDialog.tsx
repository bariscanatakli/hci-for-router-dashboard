"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NetworkDevice } from "@/lib/types/devices";

interface DeviceDetailDialogProps {
  open: boolean;
  device: NetworkDevice | null;
  onOpenChange: (open: boolean) => void;
}

export function DeviceDetailDialog({ open, device, onOpenChange }: DeviceDetailDialogProps) {
  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 text-slate-100 sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold">
            {device.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Detailed device context for quick diagnostics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <DetailRow label="IP Address" value={device.ipAddress} mono />
          <DetailRow label="MAC Address" value={device.macAddress ?? "—"} mono />
          <DetailRow label="Vendor" value={device.vendor ?? "Unknown"} />
          <DetailRow
            label="Connection"
            value={device.connectionType === "wifi" ? "Wi-Fi" : "Ethernet"}
          />
          <DetailRow
            label="Status"
            value={
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                  device.online
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    device.online ? "bg-emerald-400" : "bg-red-400"
                  )}
                />
                {device.online ? "Online" : "Offline"}
              </span>
            }
          />
          <DetailRow label="Last Seen" value={device.lastSeen ?? "—"} />
          {typeof device.signalStrength === "number" && (
            <DetailRow label="Signal" value={`${device.signalStrength}%`} />
          )}
          {typeof device.usageMbps === "number" && (
            <DetailRow label="Current Usage" value={`${device.usageMbps} Mbps`} />
          )}
          {device.tags && device.tags.length > 0 && (
            <DetailRow
              label="Tags"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {device.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              }
            />
          )}
        </div>

        <Separator className="bg-slate-800" />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="sm:flex-1" size="sm">
            Pause access
          </Button>
          <Button variant="secondary" className="sm:flex-1" size="sm">
            View logs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span
        className={cn(
          "text-right text-sm text-slate-100",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </span>
    </div>
  );
}
