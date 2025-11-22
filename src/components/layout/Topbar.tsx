// TODO: Build router dashboard topbar navigation with icons

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Bell, CheckCircle2, Info, Menu, Search, Settings, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Devices", href: "/devices" },
  { label: "Wi-Fi", href: "/wifi" },
  { label: "Security", href: "/security" },
  { label: "Performance", href: "/performance" },
  { label: "System", href: "/system" },
];

export function Topbar() {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone?: "success" | "info" | "warning" } | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const suggestions = useMemo(() => {
    const pool = [
      { label: "Go to Devices", href: "/devices" },
      { label: "Configure Wi-Fi", href: "/wifi" },
      { label: "Check Security", href: "/security" },
      { label: "View Performance", href: "/performance" },
      { label: "System updates", href: "/system" },
    ];
    if (!query) return pool.slice(0, 3);
    return pool.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  }, [query]);

  const notifications = [
    { id: "n1", icon: CheckCircle2, tone: "text-emerald-300", title: "Firmware check passed", time: "5m ago" },
    { id: "n2", icon: Info, tone: "text-indigo-300", title: "New device joined guest Wi-Fi", time: "12m ago" },
    { id: "n3", icon: WifiOff, tone: "text-amber-300", title: "Throughput dip detected", time: "18m ago" },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchFocused(true);
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const triggerToast = (message: string, tone: "success" | "info" | "warning" = "info") =>
    setToast({ message, tone });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-900 bg-slate-950/80 px-4 backdrop-blur md:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-200 hover:bg-slate-900 sm:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-slate-950 text-slate-100">
          <DropdownMenuItem asChild className="font-semibold text-indigo-200">
            <Link href="/dashboard">Go to Dashboard</Link>
          </DropdownMenuItem>
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative hidden w-full max-w-xl items-center gap-3 rounded-full border border-slate-900 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 shadow-md shadow-slate-950/40 sm:flex">
        <Search className="h-4 w-4 text-slate-500" />
        <div className="flex w-full flex-col gap-1">
          <Input
            placeholder="Quick search (devices, SSIDs, ports)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
            ref={searchRef}
            className={cn(
              "h-8 border-0 bg-transparent px-0 text-sm text-slate-100 placeholder:text-slate-500",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            aria-label="Global search"
          />
        </div>
        {searchFocused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-lg shadow-slate-950/50 backdrop-blur">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Shortcuts</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[12px] text-slate-100 hover:text-indigo-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-200 hover:bg-slate-900 sm:hidden"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 bg-slate-950 text-slate-100 sm:hidden">
          <div className="px-2 py-2">
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Global search mobile"
              className="h-9 bg-slate-900"
            />
          </div>
          {suggestions.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-slate-200 hover:bg-slate-900"
            onClick={() => triggerToast("Notifications loaded", "info")}
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-slate-950 text-slate-100">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-2">
                  <span className="flex items-center gap-2 text-sm">
                    <Icon className={cn("h-4 w-4", n.tone)} />
                    {n.title}
                  </span>
                  <span className="text-[11px] text-slate-500">{n.time}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="hidden h-6 bg-slate-800 lg:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden items-center gap-2 rounded-full border border-slate-900 bg-slate-900/70 text-xs font-medium text-emerald-200 hover:bg-slate-900 lg:flex"
              onClick={() => triggerToast("Network status refreshed", "success")}
              aria-label="Network status details"
            >
              <span className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-400" />
              Network stable
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-slate-950 text-slate-100">
            <DropdownMenuItem className="flex justify-between text-sm">
              <span>Latency</span>
              <span className="font-semibold text-emerald-300">24 ms</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between text-sm">
              <span>Uptime</span>
              <span className="text-slate-300">12d 4h</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between text-sm">
              <span>Packet loss</span>
              <span className="text-slate-300">&lt;0.1%</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 rounded-full bg-indigo-500 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-600"
          asChild
          onClick={() => triggerToast("Opening Live Monitor…", "info")}
        >
          <Link href="/performance">
            <Activity className="h-4 w-4" />
            Live Monitor
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-9 w-9 rounded-full border border-slate-900 bg-slate-900/70 text-slate-200 hover:bg-slate-900 sm:inline-flex"
          asChild
          onClick={() => triggerToast("Opening Settings…", "info")}
          aria-label="Open settings"
        >
          <Link href="/system">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {toast && (
        <div
          className={cn(
            "fixed right-4 top-20 z-30 rounded-lg border px-4 py-2 text-sm shadow-lg shadow-slate-950/50",
            toast.tone === "success"
              ? "border-emerald-700 bg-emerald-950/70 text-emerald-100"
              : toast.tone === "warning"
                ? "border-amber-700 bg-amber-950/70 text-amber-100"
                : "border-indigo-700 bg-slate-950/80 text-slate-100"
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </header>
  );
}
