"use client";

import React, { useMemo, useState } from "react";
import { Activity, Gauge, Wifi } from "lucide-react";
import { BandwidthChart } from "@/components/performance/BandwidthChart";
import { LatencyChart } from "@/components/performance/LatencyChart";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PerformanceSample } from "@/lib/types/performance";
import { useSettingsState } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/components/ui/feedback";

const mockSamples: PerformanceSample[] = [
  { timestamp: Date.now() - 60000 * 11, downloadMbps: 85, uploadMbps: 18, latencyMs: 24 },
  { timestamp: Date.now() - 60000 * 10, downloadMbps: 92, uploadMbps: 22, latencyMs: 28 },
  { timestamp: Date.now() - 60000 * 9, downloadMbps: 88, uploadMbps: 20, latencyMs: 32 },
  { timestamp: Date.now() - 60000 * 8, downloadMbps: 105, uploadMbps: 25, latencyMs: 30 },
  { timestamp: Date.now() - 60000 * 7, downloadMbps: 96, uploadMbps: 21, latencyMs: 27 },
  { timestamp: Date.now() - 60000 * 6, downloadMbps: 110, uploadMbps: 26, latencyMs: 31 },
  { timestamp: Date.now() - 60000 * 5, downloadMbps: 120, uploadMbps: 28, latencyMs: 29 },
  { timestamp: Date.now() - 60000 * 4, downloadMbps: 98, uploadMbps: 22, latencyMs: 26 },
  { timestamp: Date.now() - 60000 * 3, downloadMbps: 90, uploadMbps: 21, latencyMs: 27 },
  { timestamp: Date.now() - 60000 * 2, downloadMbps: 112, uploadMbps: 29, latencyMs: 25 },
  { timestamp: Date.now() - 60000 * 1, downloadMbps: 130, uploadMbps: 31, latencyMs: 24 },
  { timestamp: Date.now(), downloadMbps: 118, uploadMbps: 30, latencyMs: 23 },
];

export default function PerformancePage() {
  const [samples] = useState<PerformanceSample[]>(mockSamples);
  const [timeRange] = useState("Last 15 minutes");
  const { mode } = useSettingsState();
  const { notify } = useFeedback();

  const kpis = useMemo(() => {
    const downloads = samples.map((s) => s.downloadMbps);
    const uploads = samples.map((s) => s.uploadMbps);
    const latency = samples.map((s) => s.latencyMs);
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const peak = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);
    return {
      avgDownload: avg(downloads),
      avgUpload: avg(uploads),
      avgLatency: avg(latency),
      peakDownload: peak(downloads),
      peakUpload: peak(uploads),
    };
  }, [samples]);

  return (
    <div className="space-y-8" data-tour="page-performance">
      <header className="space-y-2" data-tour="performance-header">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50" data-tour="performance-heading">Performance</h1>
        <p className="text-sm text-slate-400">
          Monitor throughput, latency, and reliability trends. Data is mocked until telemetry is connected.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Avg Download"
          value={`${kpis.avgDownload.toFixed(1)} Mbps`}
          icon={<DownloadIcon />}
        />
        <KpiCard
          title="Avg Upload"
          value={`${kpis.avgUpload.toFixed(1)} Mbps`}
          icon={<UploadIcon />}
        />
        <KpiCard title="Avg Latency" value={`${kpis.avgLatency.toFixed(0)} ms`} icon={<LatencyIcon />} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3" data-tour="performance-charts">
        <div className="lg:col-span-2 space-y-4">
          <BandwidthChart samples={samples} timeRangeLabel={timeRange} />
          <LatencyChart samples={samples} targetMs={30} timeRangeLabel={timeRange} />
        </div>
        <div className="space-y-4">
          <InsightCard
            title="Peak throughput"
            description="Highest observed download/upload in the selected window."
            value={`${kpis.peakDownload.toFixed(0)} / ${kpis.peakUpload.toFixed(0)} Mbps`}
            tone="indigo"
          />
          <InsightCard
            title="Reliability note"
            description="Keep latency under 30ms for smooth voice/video. High variability triggers alerts."
            value="Target: <30ms"
            tone="emerald"
          />
          <InsightCard
            title="Next actions"
            description="Set alerts for latency spikes; review QoS rules for top apps."
            value="Configure alerts"
            tone="blue"
          />
          {mode === "expert" && (
            <Card className="border-slate-800 bg-slate-900/60" data-tour="performance-expert">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200">QoS / Traffic shaping</p>
                    <p className="text-[11px] text-slate-500">
                      Prioritize realtime apps; limit background traffic.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-indigo-500 text-white hover:bg-indigo-600"
                    onClick={() =>
                      notify({
                        title: "QoS profile applied",
                        description: "Streaming + voice prioritized (mock)",
                        tone: "success",
                      })
                    }
                  >
                    Apply profile
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Current profile</span>
                  <span className="font-semibold text-slate-100">Balanced</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/40">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-semibold text-slate-50">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({
  title,
  description,
  value,
  tone = "slate",
}: {
  title: string;
  description: string;
  value: string;
  tone?: "slate" | "indigo" | "emerald" | "blue";
}) {
  const tones: Record<string, string> = {
    slate: "border-slate-800 bg-slate-900/40 text-slate-100",
    indigo: "border-indigo-800/40 bg-indigo-950/30 text-indigo-100",
    emerald: "border-emerald-800/40 bg-emerald-950/30 text-emerald-100",
    blue: "border-blue-800/40 bg-blue-950/30 text-blue-100",
  };
  return (
    <Card className={cn("border", tones[tone])}>
      <CardContent className="space-y-2 p-4">
        <p className="text-xs font-medium text-slate-300">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
        <p className="text-base font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DownloadIcon() {
  return <Wifi className="h-4 w-4" />;
}
function UploadIcon() {
  return <Activity className="h-4 w-4" />;
}
function LatencyIcon() {
  return <Gauge className="h-4 w-4" />;
}
