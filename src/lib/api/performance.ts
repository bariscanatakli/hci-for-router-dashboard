import { PerformanceSample } from "../types/performance";

// Generate realistic performance samples
const generatePerformanceSample = (timestamp: number): PerformanceSample => {
  const baseDownload = 100;
  const baseUpload = 20;
  const baseLatency = 15;
  
  return {
    timestamp,
    downloadMbps: baseDownload + (Math.random() - 0.5) * 30,
    uploadMbps: baseUpload + (Math.random() - 0.5) * 8,
    latencyMs: baseLatency + (Math.random() - 0.5) * 10,
  };
};

const simulateDelay = () => 
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

export async function fetchPerformance(
  samples: number = 20,
  intervalMinutes: number = 5
): Promise<PerformanceSample[]> {
  await simulateDelay();
  console.log("[API] Fetching performance data", samples);
  
  const now = Date.now();
  const data: PerformanceSample[] = [];
  
  for (let i = samples - 1; i >= 0; i--) {
    const timestamp = now - (i * intervalMinutes * 60 * 1000);
    data.push(generatePerformanceSample(timestamp));
  }
  
  return data;
}

export async function fetchRealtimePerformance(): Promise<PerformanceSample> {
  await simulateDelay();
  const sample = generatePerformanceSample(Date.now());
  console.log("[API] Fetching realtime performance", sample);
  return sample;
}

