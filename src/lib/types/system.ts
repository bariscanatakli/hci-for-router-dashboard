export interface SystemStatus {
  firmwareVersion: string;
  uptimeSeconds: number;
  health: "good" | "warning" | "critical";
  lastChecked?: string;
  autoUpdateEnabled?: boolean;
}
