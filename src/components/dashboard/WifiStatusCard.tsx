"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { InfoBadge } from "@/components/ui/info-badge";
import { useSettingsState } from "@/store/settingsStore";

export function WifiStatusCard() {
  const router = useRouter();
  const { mode } = useSettingsState();
  const [wifiStatus] = useState({
    ssid: "HomeNetwork_5G",
    band: "5GHz",
    enabled: true,
    guestEnabled: false,
    connectedDevices: 8,
    signalStrength: 95,
    issues: ["Guest network off"],
  });

  const effectiveSignal = useMemo(
    () => (wifiStatus.enabled ? wifiStatus.signalStrength : 0),
    [wifiStatus.enabled, wifiStatus.signalStrength]
  );
  const effectiveDevices = useMemo(
    () => (wifiStatus.enabled ? wifiStatus.connectedDevices : 0),
    [wifiStatus.enabled, wifiStatus.connectedDevices]
  );
  const hasWarning = !wifiStatus.enabled || effectiveSignal < 50;

  return (
    <Card
      className="border-slate-800 bg-slate-900/50 cursor-pointer transition hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/20"
      data-tour="status-card-wifi"
      onClick={() => router.push("/wifi")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push("/wifi");
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-indigo-400" />
              Wi-Fi Status
              <InfoBadge
                content="Preview only. Full edits (including guest network) are available in Expert mode on the Wi-Fi page."
                aria-label="Wi-Fi status info"
              >
                i
              </InfoBadge>
            </CardTitle>
            <CardDescription className="text-xs">
              Wireless network overview
            </CardDescription>
            <p className="text-[11px] text-amber-200">
              <strong>Preview only</strong> — Changes here don&apos;t persist.{" "}
              <Link href="/wifi" className="underline underline-offset-2 hover:text-amber-100">
                Go to Wi-Fi settings →
              </Link>
            </p>
          </div>
          <Switch
            checked={wifiStatus.enabled}
            disabled
            aria-label="Toggle Wi-Fi broadcast (preview only - disabled)"
            title="Preview only. Go to Wi-Fi page to enable/disable"
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
              {effectiveSignal}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${effectiveSignal}%` }}
            />
          </div>
          {hasWarning && (
            <p className="text-[11px] text-amber-200">
              Signal or radio is limited. <Link href="/wifi" className="underline underline-offset-2">Open Wi‑Fi settings</Link>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">Connected Devices</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/devices")}
            className="text-lg font-semibold text-indigo-200 underline-offset-4 hover:underline"
          >
            {effectiveDevices}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <span className="text-sm text-slate-300">Guest Network</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${wifiStatus.guestEnabled ? "text-emerald-300" : "text-slate-400"}`}>
              {wifiStatus.guestEnabled ? "Enabled" : "Disabled"}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/wifi")}
              className="h-7 text-xs"
              disabled={mode === "basic"}
              title={mode === "basic" ? "Switch to Expert mode to edit guest network" : "Configure guest network"}
            >
              {mode === "basic" ? "Expert only" : "Configure"}
            </Button>
          </div>
        </div>

        {!wifiStatus.enabled && (
          <p className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
            Wi-Fi is off in this preview. Enable it or open Wi-Fi settings to apply changes.
          </p>
        )}
        {wifiStatus.issues.length > 0 && (
          <ul className="rounded-md border border-amber-800/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
            {wifiStatus.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}

        <p className="text-xs text-slate-500">
          Preview only — configure real settings in the Wi-Fi page.
        </p>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/wifi">Configure Wi-Fi Settings</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
