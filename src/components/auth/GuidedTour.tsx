"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MousePointer2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

type TourStep = {
  title: string;
  body: string;
  selector?: string;
};

const fallbackSteps: TourStep[] = [
  {
    title: "Welcome",
    body: "Use the sidebar to navigate key areas.",
    selector: "[data-tour=sidebar-nav]",
  },
  {
    title: "Search",
    body: "Cmd/Ctrl+K to open global search.",
    selector: "[data-tour=topbar-search]",
  },
  {
    title: "Explore",
    body: "Open Dashboard, Devices, Wi-Fi, Security, Performance, System.",
    selector: "[data-tour=sidebar-nav]",
  },
  {
    title: "Modes (TODO)",
    body: "Easy vs Expert mode coming soon — hide advanced controls for basic users.",
    selector: "[title='TODO: Add easy/expert mode toggle']",
  },
];

const pageSteps: Record<string, TourStep[]> = {
  default: [
    {
      title: "Quick search",
      body: "Cmd/Ctrl+K opens search. Filter by device, Wi-Fi, security, or your shortcuts.",
      selector: "[data-tour=topbar-search]",
    },
    {
      title: "Sidebar navigation",
      body: "Access Dashboard, Devices, Wi-Fi, Security, Performance, System.",
      selector: "[data-tour=sidebar-nav]",
    },
    {
      title: "Modes (TODO)",
      body: "Easy vs Expert mode coming soon — hide advanced controls for basic users.",
      selector: "[title='TODO: Add easy/expert mode toggle']",
    },
  ],
  "/dashboard": [
    {
      title: "Dashboard overview",
      body: "At-a-glance internet, Wi-Fi, devices, and health status.",
      selector: "[data-tour=dashboard-header]",
    },
    {
      title: "Status cards",
      body: "Internet, Wi-Fi, devices. Click any card for deeper sections.",
      selector: "[data-tour=dashboard-status-cards]",
    },
    {
      title: "Health & bandwidth",
      body: "Trends for throughput and system health.",
      selector: "[data-tour=dashboard-health-cards]",
    },
  ],
  "/devices": [
    {
      title: "Device list",
      body: "Search, filter online/offline, inspect devices.",
      selector: "[data-tour=devices-header]",
    },
    {
      title: "Stats",
      body: "Total/online/offline counts help quick triage.",
      selector: "[data-tour=devices-stats]",
    },
    {
      title: "Device table",
      body: "Inspect details, pause/block, undo actions per device.",
      selector: "[data-tour=devices-table]",
    },
  ],
  "/wifi": [
    {
      title: "Wi-Fi settings",
      body: "SSID, password, band, and guest access live here.",
      selector: "[data-tour=wifi-header]",
    },
    {
      title: "Status",
      body: "Toggle Wi-Fi, guest network, and view signal/throughput.",
      selector: "[data-tour=wifi-status]",
    },
    {
      title: "Wi-Fi form",
      body: "Edit SSID, band, channel, bandwidth, mode, and limits.",
      selector: "[data-tour=wifi-form]",
    },
  ],
  "/security": [
    {
      title: "Firewall posture",
      body: "Adjust firewall/IPS levels and threat posture.",
      selector: "[data-tour=security-header]",
    },
    {
      title: "Port forwards",
      body: "Add/remove port forwards with validation and undo.",
      selector: "[data-tour=port-forward-wizard]",
    },
  ],
  "/performance": [
    {
      title: "Performance KPIs",
      body: "Throughput and latency KPIs updated regularly.",
      selector: "[data-tour=performance-header]",
    },
    {
      title: "Charts",
      body: "Bandwidth and latency charts show peaks and intervals.",
      selector: "[data-tour=performance-charts]",
    },
  ],
  "/system": [
    {
      title: "System status",
      body: "Firmware, uptime, auto-update toggle.",
      selector: "[data-tour=page-system]",
    },
    {
      title: "Reboot & recovery",
      body: "Safe reboot/modem restart with countdown.",
      selector: "[data-tour=reboot-card]",
    },
  ],
};

export function GuidedTour({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname();

  // Merge mantığı: önce page-specific varsa onu kullan, yoksa default, o da yoksa fallback.
  const steps = useMemo<TourStep[]>(() => {
    const specific = pageSteps[pathname];
    if (specific && specific.length > 0) return specific;
    if (pageSteps.default && pageSteps.default.length > 0)
      return pageSteps.default;
    return fallbackSteps;
  }, [pathname]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [pathname]);

  const step = steps[index] ?? steps[0];

  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  // Stabil element positioning with polling
  useEffect(() => {
    let frameId: number | null = null;
    let tries = 0;
    const maxTries = 10;

    const measure = () => {
      if (!step?.selector) {
        setPosition(null);
        return;
      }

      const target = document.querySelector(step.selector) as HTMLElement | null;

      if (target) {
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
      } else if (tries < maxTries) {
        tries++;
        frameId = requestAnimationFrame(measure);
      } else {
        setPosition(null);
      }
    };

    frameId = requestAnimationFrame(measure);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [step]);

  const isLast = index >= steps.length - 1;

  const next = () => {
    setIndex((c) => Math.min(c + 1, steps.length - 1));
  };

  return (
    <div
      className="fixed z-30 max-w-sm"
      style={
        position
          ? { top: position.top, left: position.left, transform: "translate(-50%,0)" }
          : { bottom: 24, right: 24 }
      }
    >
      <Card className="border-indigo-800 bg-slate-950/90 shadow-2xl shadow-indigo-900/40">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-200">
            <MousePointer2 className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-wide">
              Quick tour — Step {index + 1}/{steps.length}
            </span>
          </div>
          <CardTitle className="text-lg text-slate-50">{step.title}</CardTitle>
          <CardDescription className="text-sm text-slate-300">
            {step.body}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= index ? "bg-indigo-400" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-200"
              onClick={onComplete}
            >
              Skip
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={isLast ? onComplete : next}
            >
              {isLast ? "Done" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
