"use client";

import React from "react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BandwidthMiniChart() {
  const chartData = {
    download: [65, 72, 68, 85, 91, 78, 95, 88, 92, 87, 94, 90],
    upload: [12, 15, 14, 18, 22, 19, 24, 21, 23, 20, 25, 22],
  };

  const stats = {
    downloadPeak: 95.2,
    uploadPeak: 25.4,
    downloadAvg: 84.3,
    uploadAvg: 19.6,
  };

  const renderMiniChart = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="flex h-16 items-end gap-1">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 rounded-t"
              style={{
                height: `${height}%`,
                backgroundColor: color,
                opacity: 0.6 + (height / 100) * 0.4,
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
            Bandwidth Usage
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time network traffic
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="download">
          <TabsList className="w-full">
            <TabsTrigger value="download" className="flex-1">
              <TrendingDown className="mr-2 h-3.5 w-3.5" />
              Download
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              <TrendingUp className="mr-2 h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              {renderMiniChart(chartData.download, "#3b82f6")}
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
              {renderMiniChart(chartData.upload, "#a855f7")}
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
