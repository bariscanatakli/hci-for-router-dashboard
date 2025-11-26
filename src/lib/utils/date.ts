/**
 * S8: Reduce memory load - Human-readable date formatting
 * Converts dates to friendly, easy-to-understand formats
 */

export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Future dates
  if (diffMs < 0) {
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);

    if (absDiffMinutes < 1) return "in a few seconds";
    if (absDiffMinutes < 60) return `in ${absDiffMinutes} minute${absDiffMinutes === 1 ? "" : "s"}`;
    if (absDiffHours < 24) return `in ${absDiffHours} hour${absDiffHours === 1 ? "" : "s"}`;
    if (absDiffDays < 7) return `in ${absDiffDays} day${absDiffDays === 1 ? "" : "s"}`;
    return formatShortDate(target);
  }

  // Past dates
  if (diffSeconds < 30) return "just now";
  if (diffSeconds < 60) return "less than a minute ago";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "last week";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "last month";
  if (diffMonths < 12) return `${diffMonths} months ago`;

  // Older than a year - show formatted date
  return formatShortDate(target);
}

export function formatShortDate(date: Date | string | number): string {
  const target = new Date(date);
  const now = new Date();
  const isThisYear = target.getFullYear() === now.getFullYear();

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  };

  return target.toLocaleDateString("en-US", options);
}

export function formatDateTime(date: Date | string | number): string {
  const target = new Date(date);
  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeOnly(date: Date | string | number): string {
  const target = new Date(date);
  return target.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
}

export function formatUptimeLong(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);

  return parts.join(", ");
}
