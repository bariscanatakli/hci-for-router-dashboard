"use client";

import React from "react";
import { WifiOff, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GuestWifiToggleProps {
  enabled: boolean;
  guestSsid?: string;
  guestPassword?: string;
  onToggle: (enabled: boolean) => void;
  onUpdateCredentials?: (ssid: string, password: string) => void;
  onRegenerate?: () => void;
}

export function GuestWifiToggle({
  enabled,
  guestSsid,
  guestPassword,
  onToggle,
  onUpdateCredentials,
  onRegenerate,
}: GuestWifiToggleProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-indigo-400" />
            Guest Network
          </CardTitle>
          <CardDescription className="text-xs">
            Create a temporary, isolated network for visitors.
          </CardDescription>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Guest SSID</label>
            <Input
              value={guestSsid}
              disabled={!enabled}
              onChange={(e) => onUpdateCredentials?.(e.target.value, guestPassword ?? "")}
              placeholder="GuestNetwork"
              className="bg-slate-950/70 text-sm"
              readOnly={!onUpdateCredentials}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Guest Password</label>
            <Input
              value={guestPassword}
              disabled={!enabled}
              onChange={(e) => onUpdateCredentials?.(guestSsid ?? "", e.target.value)}
              placeholder="••••••••"
              className="bg-slate-950/70 text-sm"
              readOnly={!onUpdateCredentials}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <WifiOff className="h-3.5 w-3.5" />
          Guests stay isolated from main devices to reduce risk.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={!enabled}
          onClick={onRegenerate}
        >
          Regenerate guest credentials
        </Button>
      </CardContent>
    </Card>
  );
}
