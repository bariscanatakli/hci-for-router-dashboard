// TODO: Build router dashboard topbar navigation with icons

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Bell, BookmarkPlus, CheckCircle2, Info, Menu, MousePointer2, Search, Settings, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { startTour, useAuthState } from "@/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Devices", href: "/devices" },
  { label: "Wi-Fi", href: "/wifi" },
  { label: "Security", href: "/security" },
  { label: "Performance", href: "/performance" },
  { label: "System", href: "/system" },
];

type SearchItem = {
  id: string;
  label: string;
  href: string;
  tags?: string[];
  source: "nav" | "content" | "custom" | "action";
  action?: () => void;
};

const shortcutStorageKey = "router-dashboard:shortcuts";
const historyStorageKey = "router-dashboard:search-history";

export function Topbar() {
  const router = useRouter();
  const auth = useAuthState();
  const launchTour = useCallback(() => startTour(), []);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [toast, setToast] = useState<{ message: string; tone?: "success" | "info" | "warning" } | null>(null);
  const [customShortcuts, setCustomShortcuts] = useState<SearchItem[]>([]);
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ label: "", href: "/dashboard" });
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchItem[]>([]);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const quickActions: SearchItem[] = useMemo(
    () => [
      {
        id: "action-tour",
        label: "Start guided tour",
        href: "/dashboard",
        source: "action",
        tags: ["tour", "onboarding", "help"],
        action: launchTour,
      },
      {
        id: "action-live-monitor",
        label: "Open Live Monitor",
        href: "/performance",
        source: "action",
        tags: ["monitor", "live", "performance", "chart"],
        action: () => router.push("/performance"),
      },
      {
        id: "action-settings",
        label: "Open Settings",
        href: "/system",
        source: "action",
        tags: ["system", "settings", "firmware"],
        action: () => router.push("/system"),
      },
      {
        id: "action-dashboard",
        label: "Back to Dashboard",
        href: "/dashboard",
        source: "action",
        tags: ["home", "overview"],
        action: () => router.push("/dashboard"),
      },
      {
        id: "action-reboot",
        label: "Open reboot panel",
        href: "/system",
        source: "action",
        tags: ["reboot", "restart", "modem"],
        action: () => router.push("/system"),
      },
    ],
    [router, launchTour]
  );

  const staticShortcuts: SearchItem[] = useMemo(
    () => [
      ...navItems.map((item) => ({ id: `nav-${item.href}`, label: item.label, href: item.href, source: "nav" as const })),
      {
        id: "content-dashboard-overview",
        label: "Dashboard overview",
        href: "/dashboard",
        tags: ["summary", "status", "cards"],
        source: "content",
      },
      {
        id: "content-devices-table",
        label: "Devices • table & filters",
        href: "/devices",
        tags: ["clients", "mac", "ip", "block", "priority"],
        source: "content",
      },
      {
        id: "content-wifi-guest",
        label: "Wi-Fi • Guest network",
        href: "/wifi",
        tags: ["guest", "ssid", "password", "iot"],
        source: "content",
      },
      {
        id: "content-wifi-throughput",
        label: "Wi-Fi • Throughput & signal",
        href: "/wifi",
        tags: ["throughput", "signal", "strength", "quality"],
        source: "content",
      },
      {
        id: "content-security-firewall",
        label: "Security • Firewall posture",
        href: "/security",
        tags: ["firewall", "ips", "level", "threats"],
        source: "content",
      },
      {
        id: "content-security-port-forward",
        label: "Security • Port forwards",
        href: "/security",
        tags: ["ports", "forward", "nat", "service"],
        source: "content",
      },
      {
        id: "content-performance-bandwidth",
        label: "Performance • Bandwidth history",
        href: "/performance",
        tags: ["download", "upload", "chart", "trend"],
        source: "content",
      },
      {
        id: "content-performance-latency",
        label: "Performance • Latency & jitter",
        href: "/performance",
        tags: ["latency", "jitter", "target", "threshold"],
        source: "content",
      },
      {
        id: "content-system-firmware",
        label: "System • Firmware update",
        href: "/system",
        tags: ["firmware", "update", "version", "auto update"],
        source: "content",
      },
      {
        id: "content-system-reboot",
        label: "System • Reboot & recovery",
        href: "/system",
        tags: ["reboot", "restart", "modem"],
        source: "content",
      },
    ],
    []
  );

  useEffect(() => {
    // Load custom shortcuts + history from localStorage
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(shortcutStorageKey);
    const storedHistory = window.localStorage.getItem(historyStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { label: string; href: string }[];
        const mapped: SearchItem[] = parsed.map((item, idx) => ({
          id: `custom-${idx}-${item.href}-${item.label}`,
          label: item.label,
          href: item.href,
          source: "custom",
        }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCustomShortcuts(mapped);
      } catch (err) {
        console.error("Failed to parse shortcuts", err);
      }
    }
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory) as { label: string; href: string; source: SearchItem["source"] }[];
        setHistory(
          parsed
            .slice(0, 6)
            .map((item, idx) => ({
              id: `history-${idx}-${item.href}-${item.label}`,
              label: item.label,
              href: item.href,
              source: item.source,
            }))
        );
      } catch (err) {
        console.error("Failed to parse history", err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = customShortcuts.map(({ label, href }) => ({ label, href }));
    window.localStorage.setItem(shortcutStorageKey, JSON.stringify(payload));
  }, [customShortcuts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = history.slice(0, 6).map(({ label, href, source }) => ({ label, href, source }));
    window.localStorage.setItem(historyStorageKey, JSON.stringify(payload));
  }, [history]);

  const searchIndex = useMemo(() => {
    const merged = [...customShortcuts, ...staticShortcuts, ...quickActions];
    // De-dupe by href+label combination
    const seen = new Set<string>();
    return merged.filter((item) => {
      const key = `${item.href}-${item.label}-${item.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customShortcuts, staticShortcuts, quickActions]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const score = (item: SearchItem) => {
      if (!tokens.length) return 0;
      const haystack = `${item.label} ${(item.tags || []).join(" ")}`.toLowerCase();
      let points = 0;
      tokens.forEach((token) => {
        if (haystack.includes(token)) points += 3;
        if (item.label.toLowerCase().startsWith(token)) points += 2;
      });
      return points;
    };

    const filtered = tokens.length
      ? searchIndex.filter((item) => score(item) > 0)
      : history.length
        ? [...history, ...searchIndex].filter((item, idx, arr) => arr.findIndex((a) => a.href === item.href && a.label === item.label) === idx)
        : searchIndex;

    const sortRank = (item: SearchItem) =>
      item.source === "custom" ? 0 : item.source === "nav" ? 1 : item.source === "content" ? 2 : 3;

    const sorted = [...filtered].sort((a, b) => {
      const diff = sortRank(a) - sortRank(b);
      if (diff !== 0) return diff;
      return (score(b) || 0) - (score(a) || 0);
    });

    return sorted.slice(0, 8);
  }, [query, searchIndex, history]);

  useEffect(() => {
    // Keep highlighted index in range when suggestion list shrinks
    if (selectedIndex >= suggestions.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(suggestions.length ? suggestions.length - 1 : -1);
    }
  }, [selectedIndex, suggestions.length]);

  const selectSuggestion = (item: SearchItem) => {
    if (item.source === "action" && item.action) {
      item.action();
    } else {
      router.push(item.href);
    }
    setHistory((prev) => {
      const next = [item, ...prev].filter(
        (unique, idx, arr) => arr.findIndex((i) => i.href === unique.href && i.label === unique.label) === idx
      );
      return next.slice(0, 6);
    });
    setSearchFocused(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchFocused) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(suggestions[selectedIndex]);
      } else if (query.trim() && suggestions.length > 0) {
        // If no explicit selection but user typed something, go to first match
        selectSuggestion(suggestions[0]);
      } else {
        // Empty query: just close the panel
        setSearchFocused(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setSelectedIndex(-1);
      searchRef.current?.blur();
    }
  };

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

  const handleStartTour = () => {
    launchTour();
    triggerToast("Starting guided tour", "info");
  };

  const saveCustomShortcut = () => {
    const label = newShortcut.label.trim();
    const href = newShortcut.href.trim();
    if (!label || !href) {
      setShortcutError("Label and link are required.");
      return;
    }
    if (!href.startsWith("/")) {
      setShortcutError("Use an internal path starting with '/'.");
      return;
    }
    const exists = customShortcuts.some(
      (item) => item.label.toLowerCase() === label.toLowerCase() && item.href === href
    );
    if (exists) {
      setShortcutError("Shortcut already exists.");
      return;
    }
    const newItem: SearchItem = {
      id: `custom-${Date.now()}`,
      label,
      href,
      source: "custom",
    };
    setCustomShortcuts((prev) => [newItem, ...prev].slice(0, 24));
    setShortcutError(null);
    setShortcutDialogOpen(false);
    setNewShortcut({ label: "", href: "/dashboard" });
    triggerToast("Shortcut saved", "success");
  };

  const removeShortcut = (id: string) => {
    setCustomShortcuts((prev) => prev.filter((item) => item.id !== id));
    triggerToast("Shortcut removed", "warning");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-900 bg-slate-950/80 px-4 backdrop-blur md:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-200 hover:bg-slate-900 sm:hidden"
            aria-label="Open navigation menu"
            data-tour="sidebar-nav"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-slate-950 text-slate-100" data-tour="sidebar-nav">
          <DropdownMenuItem
            onSelect={launchTour}
            className="gap-2 text-sm font-semibold text-indigo-200"
            data-hci="tour-trigger-mobile"
          >
            <MousePointer2 className="h-4 w-4" />
            Start guided tour
          </DropdownMenuItem>
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

      <div
        className="relative hidden w-full max-w-xl items-center gap-3 rounded-full border border-slate-900 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 shadow-md shadow-slate-950/40 sm:flex"
        data-hci="topbar-search"
        data-tour="topbar-search"
      >
        <Search className="h-4 w-4 text-slate-500" />
        <div className="flex w-full flex-col gap-1">
          <Input
            placeholder="Quick search (devices, SSIDs, ports)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1); // Reset selection on typing
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => {
              setSearchFocused(false);
              setSelectedIndex(-1);
            }, 200)}
            onKeyDown={handleSearchKeyDown}
            ref={searchRef}
            className={cn(
              "h-8 border-0 bg-transparent px-0 text-sm text-slate-100 placeholder:text-slate-500",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            aria-label="Global search"
            aria-expanded={searchFocused && suggestions.length > 0}
            aria-controls="search-suggestions"
            role="combobox"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-200 hover:bg-slate-900"
          onClick={() => {
            setShortcutDialogOpen(true);
            setShortcutError(null);
          }}
          aria-label="Add custom shortcut"
        >
          <BookmarkPlus className="h-4 w-4" />
        </Button>
        {searchFocused && suggestions.length > 0 && (
          <div 
            id="search-suggestions"
            className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-lg shadow-slate-950/50 backdrop-blur"
            role="listbox"
          >
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
              Search results (↑↓ to navigate, Enter to select, Esc to close)
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((item, index) => (
                <Link
                  key={`${item.id}-${item.href}`}
                  href={item.href}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
                    index === selectedIndex
                      ? "border-indigo-500 bg-indigo-950/60 text-indigo-100 ring-2 ring-indigo-500/50"
                      : "border-slate-800 bg-slate-900 text-slate-100 hover:border-indigo-600 hover:bg-slate-900/80"
                  )}
                  role="option"
                  aria-selected={index === selectedIndex}
                  tabIndex={-1}
                  onClick={(e) => {
                    e.preventDefault();
                    selectSuggestion(item);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
                        item.source === "custom"
                          ? "border border-amber-700/70 bg-amber-950/60 text-amber-100"
                          : item.source === "nav"
                            ? "border border-emerald-700/60 bg-emerald-950/40 text-emerald-100"
                            : "border border-indigo-700/60 bg-indigo-950/40 text-indigo-100"
                      )}
                    >
                      {item.source === "custom" ? "Custom" : item.source === "nav" ? "Page" : "Section"}
                    </span>
                  </div>
                  {item.tags && (
                    <p className="text-[11px] text-slate-400">
                      {item.tags.slice(0, 4).join(" • ")}
                    </p>
                  )}
                  {item.source === "custom" && (
                    <button
                      className="self-start text-[11px] text-amber-200 underline underline-offset-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeShortcut(item.id);
                      }}
                    >
                      Remove
                    </button>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
        {searchFocused && suggestions.length === 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-slate-800 bg-slate-950/95 p-3 text-sm text-slate-200 shadow-lg shadow-slate-950/50 backdrop-blur">
            No matches yet. Try a page name (Wi-Fi, Security, Devices) or add a shortcut.
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
            data-tour="topbar-search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 bg-slate-950 text-slate-100 sm:hidden"
          data-hci="mobile-search"
          data-tour="topbar-search"
        >
          <div className="px-2 py-2">
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Global search mobile"
              className="h-9 bg-slate-900"
            />
          </div>
          <DropdownMenuItem
            className="gap-2 text-xs text-amber-200"
            onSelect={(e) => {
              e.preventDefault();
              setShortcutDialogOpen(true);
              setShortcutError(null);
            }}
          >
            <BookmarkPlus className="h-4 w-4" />
            Add custom shortcut
          </DropdownMenuItem>
          <div className="px-2 pb-2">
            <div className="space-y-2">
              {suggestions.map((item) => (
                <Link
                  key={`${item.id}-${item.href}`}
                  href={item.href}
                  className="block rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                  onClick={(e) => {
                    e.preventDefault();
                    selectSuggestion(item);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-[11px] uppercase text-slate-500">
                      {item.source === "custom" ? "Custom" : item.source === "nav" ? "Page" : "Section"}
                    </span>
                  </div>
                  {item.tags && <p className="text-[11px] text-slate-500">{item.tags.slice(0, 3).join(" • ")}</p>}
                </Link>
              ))}
              {suggestions.length === 0 && (
                <p className="text-xs text-slate-500">No matches. Try another term or add a shortcut.</p>
              )}
            </div>
          </div>
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
              data-hci="notif-button"
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
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-9 w-9 rounded-full text-slate-200 hover:bg-slate-900 lg:inline-flex"
          onClick={() => triggerToast("Tips: Cmd/Ctrl+K search, ↑↓ navigate, Enter open, Esc close.", "info")}
          aria-label="Usage tips"
          data-hci="info-button"
        >
          <Info className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden items-center gap-2 rounded-full border-slate-800 bg-slate-900/70 text-[11px] font-semibold text-indigo-200 hover:border-indigo-500 hover:bg-slate-900 md:flex"
          onClick={handleStartTour}
          data-tour="guided-tour-trigger"
          data-hci="tour-trigger"
          aria-pressed={auth.showTour}
        >
          <MousePointer2 className="h-4 w-4" />
          {auth.showTour ? "Tour running" : "Start tour"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 rounded-full border border-slate-900 bg-slate-900/70 text-[11px] font-semibold text-indigo-200 hover:bg-slate-900 lg:flex"
          disabled
          title="TODO: Add easy/expert mode toggle"
          data-tour="mode-toggle"
        >
          Modes (Easy/Expert) — TODO
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
            variant="ghost"
            size="sm"
            className="hidden items-center gap-2 rounded-full border border-slate-900 bg-slate-900/70 text-xs font-medium text-emerald-200 hover:bg-slate-900 lg:flex"
            onClick={() => triggerToast("Network status refreshed", "success")}
            aria-label="Network status details"
            data-hci="network-status"
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
          data-hci="live-monitor"
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
          data-hci="settings-button"
        >
          <Link href="/system">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Dialog open={shortcutDialogOpen} onOpenChange={(open) => setShortcutDialogOpen(open)}>
        <DialogContent className="bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Add a shortcut</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Save quick links to pages or sections. Internal paths only (e.g. /wifi).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Label</span>
              <Input
                value={newShortcut.label}
                onChange={(e) => setNewShortcut((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Wi-Fi guest controls"
                className="bg-slate-900/70"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Link</span>
              <Input
                value={newShortcut.href}
                onChange={(e) => setNewShortcut((prev) => ({ ...prev, href: e.target.value }))}
                placeholder="/wifi"
                className="bg-slate-900/70"
              />
            </label>
            {shortcutError && <p className="text-xs text-amber-200">{shortcutError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setShortcutDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600" onClick={saveCustomShortcut}>
              Save shortcut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
