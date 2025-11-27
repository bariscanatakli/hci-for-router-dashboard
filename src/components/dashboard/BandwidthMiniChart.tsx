"use client";

import React from "react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoBadge } from "@/components/ui/info-badge";
import { useNavigateAndScroll } from "@/hooks/useNavigateAndScroll";

export function BandwidthMiniChart() {
  const navigateAndScroll = useNavigateAndScroll();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = React.useState<string | null>(null);
  const [baseTime, setBaseTime] = React.useState<number | null>(null);
  const [fallbackTime] = React.useState(() => Date.now());

  const chartData = {
    download: [65, 72, 68, 85, 91, 78, 95, 88, 92, 87, 94, 90],
    upload: [12, 15, 14, 18, 22, 19, 24, 21, 23, 20, 25, 22],
  };

  // Attach explicit timestamps (5-minute spacing) so axes/tooltips reflect real sample moments
  const intervalMs = 5 * 60 * 1000;
  React.useEffect(() => {
    // Seed once on client to avoid SSR/client mismatch
    setBaseTime(Date.now() - intervalMs * (chartData.download.length - 1));
  }, [intervalMs, chartData.download.length]);

  const toSeries = (values: number[]) =>
    baseTime === null
      ? []
      : values.map((value, idx) => ({
          value,
          timestamp: baseTime + idx * intervalMs,
        }));

  const downloadSeries = toSeries(chartData.download);
  const uploadSeries = toSeries(chartData.upload);

  const stats = {
    downloadPeak: 95.2,
    uploadPeak: 25.4,
    downloadAvg: 84.3,
    uploadAvg: 19.6,
  };

  const formatTime = (timestamp: number) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));

  const renderMiniChart = (
    series: { value: number; timestamp: number }[],
    color: string,
    label: string
  ) => {
    if (series.length === 0) {
      return (
        <div className="relative">
          <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950/50 text-[11px] text-slate-500">
            Loading chart...
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-500">
            <span>--:--</span>
            <span>--:--</span>
          </div>
        </div>
      );
    }

    const max = Math.max(...series.map((s) => s.value));
    const min = Math.min(...series.map((s) => s.value));
    const range = max - min || 1;
    const firstTime = formatTime(series[0]?.timestamp ?? fallbackTime);
    const lastTime = formatTime(series[series.length - 1]?.timestamp ?? fallbackTime);

    return (
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-2 top-0 text-[10px] text-slate-500">
          {Math.round(max)}
        </div>
        <div className="absolute -left-2 bottom-0 text-[10px] text-slate-500">
          {Math.round(min)}
        </div>
        
        {/* Chart bars */}
        <div className="flex h-16 items-end gap-1 px-2">
          {series.map((sample, index) => {
            const height = ((sample.value - min) / range) * 100;
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={index}
                className="relative flex-1 rounded-t transition-opacity cursor-pointer"
                style={{
                  height: `${height}%`,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.6 + (height / 100) * 0.4,
                }}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  setHoveredValue(sample.value);
                  setHoveredTime(formatTime(sample.timestamp));
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setHoveredValue(null);
                  setHoveredTime(null);
                }}
                role="img"
                aria-label={`${label} at ${formatTime(sample.timestamp)}: ${sample.value} Mbps`}
                title={`${formatTime(sample.timestamp)} · ${sample.value} Mbps`}
              />
            );
          })}
        </div>
        
        {/* X-axis hint */}
        <div className="flex justify-between mt-1 text-[10px] text-slate-500">
          <span>{firstTime}</span>
          <span>{lastTime}</span>
        </div>
        
        {/* Tooltip */}
        {hoveredValue !== null && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 shadow-lg">
            {hoveredValue} Mbps{hoveredTime ? ` · ${hoveredTime}` : ""}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className="border-slate-800 bg-slate-900/50 cursor-pointer transition hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/20"
      role="button"
      tabIndex={0}
      onClick={() =>
        navigateAndScroll("/performance", '[data-tour="performance-charts"]', {
          block: "start",
          highlight: true,
        })
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateAndScroll("/performance", '[data-tour="performance-charts"]', {
            block: "start",
            highlight: true,
          });
        }
      }}
    >
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-indigo-400" />
            Bandwidth Usage
            <InfoBadge
              content="Mini download/upload spark charts with hover/focus values. Mock data until telemetry is connected."
              aria-label="Bandwidth usage info"
            >
              i
            </InfoBadge>
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time network traffic
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="download">
          <TabsList className="w-full">
            <TabsTrigger value="download" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <TrendingDown className="mr-2 h-3.5 w-3.5" />
              Download
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <TrendingUp className="mr-2 h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              {renderMiniChart(downloadSeries, "#3b82f6", "Download")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Peak</div>
                <div className="text-lg font-semibold text-blue-400">
                  {stats.downloadPeak} Mbps
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Average</div>
                <div className="text-lg font-semibold text-slate-100">
                  {stats.downloadAvg} Mbps
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              {renderMiniChart(uploadSeries, "#a855f7", "Upload")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Peak</div>
                <div className="text-lg font-semibold text-purple-400">
                  {stats.uploadPeak} Mbps
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400">Average</div>
                <div className="text-lg font-semibold text-slate-100">
                  {stats.uploadAvg} Mbps
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
