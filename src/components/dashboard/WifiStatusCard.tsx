"use client";

import React from "react";
import Link from "next/link";
import { Lock, Signal, Wifi } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function WifiStatusCard() {
  const wifiStatus = {
    ssid: "HomeNetwork_5G",
    band: "5GHz",
    enabled: true,
    guestEnabled: false,
    connectedDevices: 8,
    signalStrength: 95,
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-indigo-400" />
              Wi-Fi Status
            </CardTitle>
            <CardDescription className="text-xs">
              Wireless network overview
            </CardDescription>
          </div>
          <Switch
            checked={wifiStatus.enabled}
            onCheckedChange={() => {}}
            aria-readonly
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-400">Network Name</div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium text-slate-100">
              {wifiStatus.ssid}
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {wifiStatus.band}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">Signal Strength</span>
            <span className="font-semibold text-slate-100">
              {wifiStatus.signalStrength}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${wifiStatus.signalStrength}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">Connected Devices</span>
          </div>
          <span className="text-lg font-semibold text-slate-50">
            {wifiStatus.connectedDevices}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Guest Network</span>
          <Switch
            checked={wifiStatus.guestEnabled}
            onCheckedChange={() => {}}
            aria-readonly
          />
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/wifi">Configure Wi-Fi Settings</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
