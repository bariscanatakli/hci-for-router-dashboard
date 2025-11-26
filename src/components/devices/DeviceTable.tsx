"use client";

import React from "react";
import { NetworkDevice } from "@/lib/types/devices";
import { DeviceRow } from "./DeviceRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/utils";

interface DeviceTableProps {
  devices: NetworkDevice[];
  onInspect: (device: NetworkDevice) => void;
  summary?: string;
}

export function DeviceTable({ devices, onInspect, summary }: DeviceTableProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/40" data-tour="devices-table">
      <CardHeader>
        <CardTitle className="text-base text-slate-50">Devices</CardTitle>
        {summary && <p className="text-xs text-slate-400">{summary}</p>}
      </CardHeader>

      <Separator className="bg-slate-800" />

      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr className="border-b border-slate-800/80">
                <th className="px-3 py-2 font-semibold">Device</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Usage</th>
                <th className="px-3 py-2 font-semibold">Last seen</th>
                <th className="px-3 py-2 font-semibold">Tags</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <DeviceRow key={device.id} device={device} onInspect={onInspect} />
              ))}
              {devices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-sm text-slate-400"
                  >
                    No devices match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
