"use client";

import React from "react";
import { Power, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RebootCardProps {
  onReboot?: () => void;
  onRestartModem?: () => void;
}

export function RebootCard({ onReboot, onRestartModem }: RebootCardProps) {
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
            onClick={onReboot}
          >
            <RefreshCcw className="h-4 w-4" />
            Reboot router
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-200 hover:bg-slate-900"
            onClick={onRestartModem}
          >
            <Power className="h-4 w-4" />
            Restart modem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
