"use client";

import React, { useEffect, useState } from "react";
import { Power, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatUptimeLong } from "@/lib/utils";

interface RebootCardProps {
  onReboot?: () => void;
  onRestartModem?: () => void;
}

const REBOOT_DURATION_SECONDS = 10;

export function RebootCard({ onReboot, onRestartModem }: RebootCardProps) {
  const [confirm, setConfirm] = useState<"router" | "modem" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rebooting, setRebooting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [uptimeSeconds, setUptimeSeconds] = useState(432000); // Mock: 5 days

  useEffect(() => {
    if (!feedback || rebooting) return;
    const t = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(t);
  }, [feedback, rebooting]);

  // Countdown timer during reboot
  useEffect(() => {
    if (!rebooting || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [rebooting, countdown]);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (type: "router" | "modem") => {
    setConfirm(null);
    setRebooting(true);
    setCountdown(REBOOT_DURATION_SECONDS);
    setFeedback(type === "router" ? "Rebooting router..." : "Restarting modem...");
    
    // Simulate reboot process
    setTimeout(() => {
      if (type === "router") onReboot?.();
      if (type === "modem") onRestartModem?.();
      setRebooting(false);
      setCountdown(0);
      setFeedback(type === "router" ? "Router reboot completed!" : "Modem restart completed!");
    }, REBOOT_DURATION_SECONDS * 1000);
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50" data-tour="reboot-card">
      <CardHeader>
        <CardTitle className="text-base">Reboot & recovery</CardTitle>
        <CardDescription className="text-xs">
          Safe reboot options with quick recovery guidance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
          <span>Estimated downtime: ~{REBOOT_DURATION_SECONDS} seconds.</span>
          <span className="text-xs text-slate-500">
            Runs a graceful shutdown; sessions may briefly disconnect.
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 bg-indigo-500 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-600"
            onClick={() => setConfirm("router")}
            disabled={rebooting}
          >
            <RefreshCcw className="h-4 w-4" />
            Reboot router
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-200 hover:bg-slate-900"
            onClick={() => setConfirm("modem")}
            disabled={rebooting}
          >
            <Power className="h-4 w-4" />
            Restart modem
          </Button>
        </div>
        {rebooting && (
          <div className="rounded-md border border-indigo-800 bg-indigo-950/30 px-3 py-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-200">Rebooting...</span>
              <span className="font-mono text-indigo-300">{countdown}s remaining</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${((REBOOT_DURATION_SECONDS - countdown) / REBOOT_DURATION_SECONDS) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Please wait. Do not refresh or navigate away.
            </p>
          </div>
        )}
        {feedback && !rebooting && (
          <div className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-200" role="status" aria-live="polite">
            {feedback}
          </div>
        )}
        <div className="mt-4 text-center">
          <span className="text-xs text-slate-500">Uptime:</span>
          <div className="text-lg">
            <span className="font-medium text-emerald-400">
              {formatUptimeLong(uptimeSeconds)}
            </span>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent className="bg-slate-950 text-slate-100" data-tour="reboot-confirm-dialog">
          <DialogHeader>
            <DialogTitle>
              {confirm === "router" ? "Reboot router?" : "Restart modem?"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              This interrupts connectivity briefly. Active sessions may drop; services will resume after boot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Estimated downtime</span>
              <span className="font-semibold text-slate-100">~{REBOOT_DURATION_SECONDS}s</span>
            </div>
            <Separator className="bg-slate-800" />
            <p className="text-xs text-slate-400">
              We&apos;ll queue the action and show status when done.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0" data-tour="reboot-dialog-actions">
            <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => confirm && handleAction(confirm)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
