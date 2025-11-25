"use client";

import React, { useEffect, useState } from "react";
import { Power, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface RebootCardProps {
  onReboot?: () => void;
  onRestartModem?: () => void;
}

export function RebootCard({ onReboot, onRestartModem }: RebootCardProps) {
  const [confirm, setConfirm] = useState<"router" | "modem" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rebooting, setRebooting] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  const handleAction = (type: "router" | "modem") => {
    setConfirm(null);
    setRebooting(true);
    setCountdown(60);
    setFeedback(type === "router" ? "Rebooting router..." : "Restarting modem...");
    
    // Simulate reboot process
    setTimeout(() => {
      if (type === "router") onReboot?.();
      if (type === "modem") onRestartModem?.();
      setRebooting(false);
      setCountdown(0);
      setFeedback(type === "router" ? "Router reboot completed!" : "Modem restart completed!");
    }, 10000); // 10 second simulation
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-base">Reboot & recovery</CardTitle>
        <CardDescription className="text-xs">
          Safe reboot options with quick recovery guidance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
          <span>Estimated downtime: &lt; 60 seconds.</span>
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
                style={{ width: `${((60 - countdown) / 60) * 100}%` }}
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
      </CardContent>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent className="bg-slate-950 text-slate-100">
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
              <span className="font-semibold text-slate-100">&lt; 60s</span>
            </div>
            <Separator className="bg-slate-800" />
            <p className="text-xs text-slate-400">
              We&apos;ll queue the action and show status when done.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
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
