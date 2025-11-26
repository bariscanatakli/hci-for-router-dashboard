"use client";

import React, { useEffect, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Info, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatRelativeTime } from "@/lib/utils";

interface FirewallLevelSliderProps {
  value: number;
  onChange: (value: number) => void;
  intrusionPreventionEnabled?: boolean;
  onToggleIps?: (enabled: boolean) => void;
}

export function FirewallLevelSlider({
  value,
  onChange,
  intrusionPreventionEnabled,
  onToggleIps,
}: FirewallLevelSliderProps) {
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const levels = [
    { label: "Low", value: 1, desc: "Basic NAT + SPI" },
    { label: "Medium", value: 2, desc: "Blocks risky ports" },
    { label: "High", value: 3, desc: "Strict, blocks new services" },
  ];

  useEffect(() => {
    // Simulate fetching last scan date
    const fetchLastScan = () => {
      const now = new Date();
      setLastScan(now);
    };

    fetchLastScan();
  }, []);

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          Firewall level
        </CardTitle>
        <CardDescription className="text-xs">
          Choose protection level; stricter rules may block some services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Slider
            min={1}
            max={3}
            step={1}
            value={[value]}
            onValueChange={(vals) => onChange(vals[0] ?? value)}
          />
          <div className="flex justify-between text-xs text-slate-400">
            {levels.map((level) => (
              <div key={level.value} className="flex flex-col items-center gap-1">
                <span className="font-semibold text-slate-200">{level.label}</span>
                <span className="text-[11px] text-slate-500">{level.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>
              After raising firewall level, re-check port forwards and smart devices.
            </span>
          </div>
        </div>

        {typeof intrusionPreventionEnabled !== "undefined" && onToggleIps && (
          <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
            <div className="flex flex-col text-sm text-slate-200">
              <span className="font-semibold">Intrusion prevention</span>
              <span className="text-xs text-slate-400">Block known threats automatically</span>
            </div>
            <Switch
              checked={intrusionPreventionEnabled}
              onCheckedChange={onToggleIps}
              aria-label="Toggle Intrusion Prevention"
            />
          </div>
        )}

        {/* Last Scan section - update the date display */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Last security scan</span>
          </div>
          <span className="font-medium text-slate-300">
            {lastScan ? formatRelativeTime(lastScan) : "Never"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
