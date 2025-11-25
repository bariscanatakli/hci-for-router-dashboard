"use client";

import React from "react";
import { Signal, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceSample } from "@/lib/types/performance";

interface LatencyChartProps {
  samples: PerformanceSample[];
  targetMs?: number;
  timeRangeLabel?: string;
}

export function LatencyChart({ samples, targetMs = 30, timeRangeLabel }: LatencyChartProps) {
  const latencySeries = samples.map((s) => ({ value: s.latencyMs, timestamp: s.timestamp }));
  const max = Math.max(...latencySeries.map((s) => s.value), targetMs, 1);

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const avgIntervalMinutes = () => {
    if (latencySeries.length < 2) return null;
    const diffs = latencySeries.slice(1).map((s, i) => s.timestamp - latencySeries[i].timestamp);
    const avgMs = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return Math.max(1, Math.round(avgMs / 60000));
  };

  const firstTime = latencySeries[0] ? formatTime(latencySeries[0].timestamp) : "";
  const lastTime = latencySeries[latencySeries.length - 1] ? formatTime(latencySeries[latencySeries.length - 1].timestamp) : "";

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Signal className="h-4 w-4 text-indigo-400" />
            Latency & jitter
          </CardTitle>
          <CardDescription className="text-xs">
            Recent latency samples ({timeRangeLabel ?? "recent"}) with a target threshold ({targetMs}ms).
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-6">
          <div className="absolute left-4 right-4 z-0 border-t border-emerald-500/30" style={{ top: `${(1 - targetMs / max) * 100}%` }} />
          <div
            className="relative z-10 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.max(latencySeries.length, 1)}, minmax(0, 1fr))` }}
          >
            {latencySeries.map((sample, idx) => {
              const height = Math.max((sample.value / max) * 100, 6);
              const overTarget = sample.value > targetMs;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-slate-700 to-indigo-500"
                    style={{ height: `${height}%`, opacity: overTarget ? 0.9 : 0.7, boxShadow: overTarget ? "0 0 0 1px rgba(248,113,113,0.3)" : undefined }}
                    aria-label={`Latency sample ${idx + 1}: ${sample.value} ms at ${formatTime(sample.timestamp)}`}
                    title={`${formatTime(sample.timestamp)} · ${sample.value} ms`}
                  />
                  <span className="text-[10px] text-slate-500">{sample.value} ms</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500">
            <span>{firstTime}</span>
            <span>{lastTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          Target threshold: {targetMs} ms. Bars in red glow exceed the target.
          {(() => {
            const avg = avgIntervalMinutes();
            return avg ? ` Samples ~${avg} min apart.` : "";
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
