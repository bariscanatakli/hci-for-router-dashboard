"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Cable, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { NetworkDevice } from "@/lib/types/devices";

interface DeviceRowProps {
  device: NetworkDevice;
  onInspect: (device: NetworkDevice) => void;
}

export function DeviceRow({ device, onInspect }: DeviceRowProps) {
  const [confirmAction, setConfirmAction] = useState<"pause" | "block" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"pause" | "block" | null>(null);
  const connectionIcon =
    device.connectionType === "wifi" ? (
      <Wifi className="h-4 w-4 text-indigo-400" />
    ) : (
      <Cable className="h-4 w-4 text-emerald-400" />
    );

  useEffect(() => {
    if (!feedback) return;
    // Keep undoable actions visible until resolved; only auto-clear informational toasts
    if (lastAction) return;
    const t = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(t);
  }, [feedback, lastAction]);

  const confirmLabel =
    confirmAction === "pause"
      ? "Pause access for this device?"
      : confirmAction === "block"
        ? "Block this device?"
        : "";

  const handleConfirm = () => {
    if (!confirmAction) return;
    setLastAction(confirmAction);
    setFeedback(confirmAction === "pause" ? "Access paused (mock)." : "Device blocked (mock). Undo available.");
    setConfirmAction(null);
  };

  const handleUndo = () => {
    if (!lastAction) return;
    setFeedback("Action undone (mock).");
    setLastAction(null);
  };

  return (
    <tr className="border-b border-slate-800/80 text-sm text-slate-100">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {connectionIcon}
          <div className="flex flex-col">
            <span className="font-medium">{device.name}</span>
            <span className="text-xs text-slate-400">{device.ipAddress}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
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
      </td>
      <td className="px-3 py-2 text-slate-200">
        {typeof device.usageMbps === "number" ? `${device.usageMbps} Mbps` : "—"}
      </td>
      <td className="px-3 py-2 text-slate-400">{device.lastSeen ?? "—"}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {device.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-indigo-300 hover:bg-indigo-500/10"
            onClick={() => onInspect(device)}
          >
            Inspect
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-950 text-slate-100">
              <DropdownMenuItem className="text-sm" onClick={() => setConfirmAction("pause")}>
                Pause access
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm" onClick={() => setFeedback("Priority set to High (mock).")}>
                Set priority
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm" onClick={() => setConfirmAction("block")}>
                Block device
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {feedback && (
          <p className="mt-1 text-right text-[11px] text-slate-400" role="status" aria-live="polite">
            {feedback}{" "}
            {lastAction && (
              <button className="underline underline-offset-2 text-indigo-200" onClick={handleUndo}>
                Undo
              </button>
            )}
          </p>
        )}
      </td>

      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>{confirmLabel}</DialogTitle>
            <DialogDescription className="text-sm">
              This may interrupt the device. You can undo immediately after applying.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
            {device.name} — {device.ipAddress}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </tr>
  );
}
