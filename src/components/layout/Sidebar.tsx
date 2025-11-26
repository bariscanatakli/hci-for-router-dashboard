// TODO: Build router dashboard sidebar navigation with icons

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Gauge,
  HardDrive,
  Router,
  Settings,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Devices", href: "/devices", icon: HardDrive },
  { label: "Wi-Fi", href: "/wifi", icon: Wifi },
  { label: "Security", href: "/security", icon: ShieldCheck },
  { label: "Performance", href: "/performance", icon: Activity },
  { label: "System", href: "/system", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      data-tour="sidebar-nav"
      className="hidden min-h-screen border-r border-slate-900 bg-slate-950/80 px-3 py-6 shadow-lg shadow-indigo-950/20 backdrop-blur md:flex md:w-64 md:flex-col"
    >
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-slate-900 bg-slate-900/60 px-3 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-base font-semibold text-white shadow-lg shadow-indigo-900/40">
          RT
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-100">
            Router Dashboard
          </span>
          <span className="text-xs text-slate-400">Secure • Stable • Aware</span>
        </div>
      </div>

      <nav className="space-y-1">
        <div data-tour="sidebar-links" className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-all",
                  "hover:border-slate-800 hover:bg-slate-900/70 hover:text-slate-50",
                  active
                    ? "border-indigo-500/60 bg-indigo-500/10 text-slate-50 shadow-inner shadow-indigo-900/30"
                    : "text-slate-300"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto rounded-lg border border-slate-900 bg-slate-900/70 px-3 py-3 text-xs text-slate-400">
        <div className="mb-2 flex items-center gap-2 text-slate-200">
          <Router className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">Live status: Online</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          Monitor at a glance. Critical actions stay within 2 clicks following
          HCI task flow guidelines.
        </p>
      </div>
    </aside>
  );
}
