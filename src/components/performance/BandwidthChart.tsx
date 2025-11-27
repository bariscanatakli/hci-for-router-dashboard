"use client";

import React from "react";
import { Activity, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceSample } from "@/lib/types/performance";
import { InfoBadge } from "@/components/ui/info-badge";

interface BandwidthChartProps {
  samples: PerformanceSample[];
  timeRangeLabel?: string;
}

export function BandwidthChart({ samples, timeRangeLabel }: BandwidthChartProps) {
  const [hovered, setHovered] = React.useState<{ value: number; idx: number; timestamp: number } | null>(null);
  const downloadSeries = samples.map((s) => ({ value: s.downloadMbps, timestamp: s.timestamp }));
  const uploadSeries = samples.map((s) => ({ value: s.uploadMbps, timestamp: s.timestamp }));

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const avgIntervalMinutes = (series: { timestamp: number }[]) => {
    if (series.length < 2) return null;
    const diffs = series.slice(1).map((s, i) => s.timestamp - series[i].timestamp);
    const avgMs = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return Math.max(1, Math.round(avgMs / 60000));
  };

  const renderBars = (
    series: { value: number; timestamp: number }[],
    color: string,
    label: string
  ) => {
    if (series.length === 0)
      return (
        <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-slate-800 bg-slate-950/40 text-sm text-slate-500">
          No samples available for this range.
        </div>
      );

    const max = Math.max(...series.map((s) => s.value)) || 1;
    const min = Math.min(...series.map((s) => s.value));
    const range = max - min || 1;
    const firstTime = formatTime(series[0].timestamp);
    const lastTime = formatTime(series[series.length - 1].timestamp);
    const handleKeyNav = (event: React.KeyboardEvent<HTMLDivElement>, idx: number) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const nextIdx = event.key === "ArrowRight" ? Math.min(series.length - 1, idx + 1) : Math.max(0, idx - 1);
      setHovered({ value: series[nextIdx].value, idx: nextIdx, timestamp: series[nextIdx].timestamp });
      const parent = event.currentTarget.parentElement;
      const nextEl = parent?.children[nextIdx] as HTMLElement | undefined;
      nextEl?.focus();
    };
    return (
      <div className="relative">
        <div className="absolute -left-2 top-0 text-[10px] text-slate-500">{Math.round(max)}</div>
        <div className="absolute -left-2 bottom-0 text-[10px] text-slate-500">{Math.round(min)}</div>
        <div className="flex h-36 items-end gap-1 px-2">
          {series.map((sample, idx) => {
            const height = ((sample.value - min) / range) * 100;
            const active = hovered?.idx === idx;
            return (
              <div
                key={idx}
                className="relative flex-1 cursor-pointer rounded-t-md"
                style={{
                  height: `${Math.max(height, 8)}%`,
                  background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
                  opacity: active ? 1 : 0.75,
                  boxShadow: active ? `0 0 0 1px ${color}55` : undefined,
                }}
                onMouseEnter={() => setHovered({ value: sample.value, idx, timestamp: sample.timestamp })}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered({ value: sample.value, idx, timestamp: sample.timestamp })}
                onBlur={() => setHovered(null)}
                onKeyDown={(e) => handleKeyNav(e, idx)}
                tabIndex={0}
                role="img"
                aria-label={`${label} sample ${idx + 1}: ${sample.value} Mbps at ${formatTime(sample.timestamp)}`}
                title={`${formatTime(sample.timestamp)} · ${sample.value} Mbps`}
              />
            );
          })}
        </div>
        <div className="mt-1 flex justify-between px-2 text-[11px] text-slate-500">
          <span>{firstTime}</span>
          <span>{lastTime}</span>
        </div>
        {hovered && (
          <div
            className="absolute -top-8 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 shadow-lg"
            style={{ left: `${((hovered.idx + 0.5) / series.length) * 100}%`, transform: "translateX(-50%)" }}
          >
            {hovered.value} Mbps · {formatTime(hovered.timestamp)}
          </div>
        )}
        <div className="sr-only" role="status" aria-live="polite">
          {hovered
            ? `${label} sample ${hovered.idx + 1}: ${hovered.value} Mbps at ${formatTime(hovered.timestamp)}`
            : `${label} chart with ${series.length} bars from ${firstTime} to ${lastTime}`}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-indigo-400" />
            Bandwidth history
            <InfoBadge
              content="Keyboard-accessible bars with live values on focus/hover. Mock data; wire telemetry for live charts."
              aria-label="Bandwidth chart info"
            >
              i
            </InfoBadge>
          </CardTitle>
          <CardDescription className="text-xs">
            Recent down/up throughput ({timeRangeLabel ?? "recent"}). Values in Mbps; mock data until API is wired.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="download">
          <TabsList className="w-full">
            <TabsTrigger value="download" className="flex-1">
              <ArrowDown className="mr-2 h-3.5 w-3.5" />
              Download
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              <ArrowUp className="mr-2 h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              {renderBars(downloadSeries, "#3b82f6", "Download")}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              {renderBars(uploadSeries, "#a855f7", "Upload")}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-slate-500">
          Values in Mbps; intervals derived from samples
          {(() => {
            const avg = avgIntervalMinutes(samples.map((s) => ({ timestamp: s.timestamp })));
            return avg ? ` (~${avg} min apart).` : ".";
          })()}
          Connect to performance telemetry to enable live trends.
        </div>
      </CardContent>
    </Card>
  );
}
