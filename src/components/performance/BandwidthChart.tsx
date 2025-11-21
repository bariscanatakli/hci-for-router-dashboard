"use client";

import React from "react";
import { Activity, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PerformanceSample } from "@/lib/types/performance";

interface BandwidthChartProps {
  samples: PerformanceSample[];
}

export function BandwidthChart({ samples }: BandwidthChartProps) {
  const downloadPoints = samples.map((s) => s.downloadMbps);
  const uploadPoints = samples.map((s) => s.uploadMbps);

  const renderBars = (data: number[], color: string) => {
    if (data.length === 0) return null;
    const max = Math.max(...data) || 1;
    return (
      <div className="flex h-36 items-end gap-1">
        {data.map((value, idx) => {
          const height = Math.max((value / max) * 100, 8);
          return (
            <div
              key={idx}
              className="flex-1 rounded-t-md"
              style={{
                height: `${height}%`,
                background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
                opacity: 0.75,
              }}
            />
          );
        })}
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
          </CardTitle>
          <CardDescription className="text-xs">
            Recent down/up throughput. Mock data until API is wired.
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
              {renderBars(downloadPoints, "#3b82f6")}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              {renderBars(uploadPoints, "#a855f7")}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-slate-500">
          Values are mock; connect to performance telemetry to enable live trends.
        </div>
      </CardContent>
    </Card>
  );
}
