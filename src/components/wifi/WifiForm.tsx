"use client";

import React, { useState } from "react";
import { ChevronDown, Lock, Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { WifiBand, WifiConfig } from "@/lib/types/wifi";
import { cn } from "@/lib/utils";

interface WifiFormProps {
  config: WifiConfig;
  onChange: (config: WifiConfig) => void;
  disabled?: boolean;
}

const bands: WifiBand[] = ["2.4GHz", "5GHz", "6GHz"];
const bandwidthOptions: WifiConfig["bandwidthMhz"][] = [20, 40, 80, 160];
const modeOptions: WifiConfig["mode"][] = ["802.11n", "802.11ac", "802.11ax"];

export function WifiForm({ config, onChange, disabled = false }: WifiFormProps) {
  const [status, setStatus] = useState<{ message: string; tone: "success" | "warning" | "info" } | null>(null);
  const [lastSaved, setLastSaved] = useState<WifiConfig>(config);
  const updateField = <K extends keyof WifiConfig>(key: K, value: WifiConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const ssidError = !config.ssid.trim() ? "Network name is required." : "";
  const passwordError = config.password.trim().length < 8 ? "Password must be at least 8 characters." : "";
  const bandwidthAllowed = [20, 40, 80, 160];
  const bandwidthError =
    config.bandwidthMhz && !bandwidthAllowed.includes(config.bandwidthMhz) ? "Bandwidth must be 20/40/80/160 MHz." : "";

  const handleSave = () => {
    if (ssidError || passwordError || bandwidthError) {
      setStatus({ message: "Please fix highlighted fields before saving.", tone: "warning" });
      return;
    }
    setLastSaved(config);
    setStatus({ message: "Wi-Fi settings saved (mock).", tone: "success" });
  };

  const handleCancel = () => {
    onChange(lastSaved);
    setStatus({ message: "Changes reverted.", tone: "info" });
  };

  return (
    <Card className={cn("border-slate-800 bg-slate-900/50", disabled && "opacity-60")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="h-4 w-4 text-indigo-400" />
            Wi-Fi Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Update SSID, security, and radio parameters. Changes apply instantly.
          </CardDescription>
        </div>
        <Switch
          checked={!config.hidden}
          onCheckedChange={(checked) => updateField("hidden", !checked)}
          aria-label="Broadcast SSID"
        />
      </CardHeader>
      <CardContent className={cn("space-y-4", disabled && "pointer-events-none")}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Network Name (SSID)">
            <Input
              value={config.ssid}
              onChange={(e) => updateField("ssid", e.target.value)}
              placeholder="HomeNetwork"
              className="bg-slate-950/70 text-sm"
              aria-invalid={Boolean(ssidError)}
              data-hci="wifi-ssid"
              title="Main SSID name (2-32 chars)."
              disabled={disabled}
            />
            {ssidError && <p className="text-xs text-red-300">{ssidError}</p>}
          </Field>
          <Field label="Password">
            <Input
          type="password"
          value={config.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="••••••••"
              className="bg-slate-950/70 text-sm"
              aria-invalid={Boolean(passwordError)}
              data-hci="wifi-password"
              title="At least 8 characters; keep guests on guest network."
              disabled={disabled}
            />
            {passwordError && <p className="text-xs text-red-300">{passwordError}</p>}
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Band">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={disabled}>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  {config.band}
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 text-slate-100">
                {bands.map((band) => (
                  <DropdownMenuItem key={band} onClick={() => updateField("band", band)}>
                    {band}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>

          <Field label="Channel">
            <Input
              type="number"
              min={1}
              max={165}
              value={config.channel ?? ""}
              onChange={(e) => updateField("channel", Number(e.target.value) || undefined)}
              placeholder="Auto"
              className="bg-slate-950/70 text-sm"
              disabled={disabled}
            />
          </Field>

          <Field label="Bandwidth (MHz)">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={disabled}>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  {config.bandwidthMhz ?? "Select"}
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 text-slate-100">
                {bandwidthOptions.map((bw) => (
                  <DropdownMenuItem key={bw} onClick={() => updateField("bandwidthMhz", bw)}>
                    {bw} MHz
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {bandwidthError && <p className="text-xs text-red-300">{bandwidthError}</p>}
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Mode">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={disabled}>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  {config.mode ?? "Select mode"}
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 text-slate-100">
                {modeOptions.map((mode) => (
                  <DropdownMenuItem key={mode} onClick={() => updateField("mode", mode)}>
                    {mode}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
          <Field label="Max Clients">
            <Input
              type="number"
              min={1}
              max={256}
              value={config.maxClients ?? ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateField("maxClients", val > 0 && val <= 256 ? val : undefined);
              }}
              placeholder="1 - 256"
              className="bg-slate-950/70 text-sm"
              disabled={disabled}
            />
          </Field>
          <Field label="WPS">
            <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2">
              <Switch
                checked={!!config.wpsEnabled}
                onCheckedChange={(checked) => updateField("wpsEnabled", checked)}
                disabled={disabled}
              />
              <span className="text-sm text-slate-200">Push-button WPS</span>
            </div>
          </Field>
        </div>

        <div className="rounded-lg border border-amber-800/40 bg-amber-950/10 p-4 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="h-4 w-4" />
            Security reminder
          </div>
          <p className="mt-1 text-amber-100/80">
            Keep strong passwords and avoid sharing guest credentials outside the Guest network.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="sm" className="text-slate-200" onClick={handleCancel} data-hci="wifi-cancel">
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-indigo-500 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-600 disabled:opacity-50"
            onClick={handleSave}
            data-hci="wifi-save"
          >
            Save changes
          </Button>
        </div>

        {status && (
          <div
            className={`rounded-md px-3 py-2 text-xs ${
              status.tone === "success"
                ? "border-emerald-800 bg-emerald-950/40 text-emerald-100"
                : status.tone === "warning"
                  ? "border-amber-800 bg-amber-950/40 text-amber-100"
                  : "border-slate-800 bg-slate-950/60 text-slate-200"
            }`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}
