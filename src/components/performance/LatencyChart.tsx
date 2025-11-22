"use client";

import React from "react";
import { Signal, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceSample } from "@/lib/types/performance";

interface LatencyChartProps {
  samples: PerformanceSample[];
  targetMs?: number;
}

export function LatencyChart({ samples, targetMs = 30 }: LatencyChartProps) {
  const latencyPoints = samples.map((s) => s.latencyMs);
  const max = Math.max(...latencyPoints, targetMs, 1);

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Signal className="h-4 w-4 text-indigo-400" />
            Latency & jitter
          </CardTitle>
          <CardDescription className="text-xs">
            Recent latency samples with a target threshold.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-6">
          <div className="absolute left-4 right-4 z-0 border-t border-emerald-500/30" style={{ top: `${(1 - targetMs / max) * 100}%` }} />
          <div className="relative z-10 grid grid-cols-[repeat(12,minmax(0,1fr))] gap-2">
            {latencyPoints.map((value, idx) => {
              const height = Math.max((value / max) * 100, 6);
              const overTarget = value > targetMs;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-slate-700 to-indigo-500"
                    style={{ height: `${height}%`, opacity: overTarget ? 0.9 : 0.7, boxShadow: overTarget ? "0 0 0 1px rgba(248,113,113,0.3)" : undefined }}
                  />
                  <span className="text-[10px] text-slate-500">{value} ms</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          Target threshold: {targetMs} ms. Bars in red glow exceed the target.
        </div>
      </CardContent>
    </Card>
  );
}
