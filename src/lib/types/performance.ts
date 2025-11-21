export interface PerformanceSample {
  timestamp: number;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
}

export interface PerformanceKpis {
  avgDownload: number;
  avgUpload: number;
  avgLatency: number;
  peakDownload: number;
  peakUpload: number;
  jitterMs?: number;
  packetLoss?: number;
}
