// TODO: Build router dashboard topbar navigation with icons

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BookmarkPlus, BookOpen, CheckCircle2, Info, LogOut, Menu, MousePointer2, Search, Settings, User, WifiOff } from "lucide-react";
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
import { logout, startTour, startHCITour, useAuthState } from "@/store/authStore";
import { toggleMode, useSettingsState } from "@/store/settingsStore";
import { useFeedback } from "@/components/ui/feedback";
import { InfoBadge } from "@/components/ui/info-badge";

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
  level?: "basic" | "expert";
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
  const [customShortcuts, setCustomShortcuts] = useState<SearchItem[]>([]);
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ label: "", href: "/dashboard" });
  const [shortcutError, setShortcutError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchItem[]>([]);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { mode } = useSettingsState();
  const { notify } = useFeedback();
  const openPasswordModal = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("router-dashboard:open-password-modal"));
  }, []);

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
        level: "expert",
      },
    ],
    [router, launchTour]
  );

  const staticShortcuts: SearchItem[] = useMemo(
    () => [
      ...navItems.map((item) => ({ id: `nav-${item.href}`, label: item.label, href: item.href, source: "nav" as const })),
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
        level: "expert",
      },
      {
        id: "content-security-port-forward",
        label: "Security • Port forwards",
        href: "/security",
        tags: ["ports", "forward", "nat", "service"],
        source: "content",
        level: "expert",
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
    const merged = [...customShortcuts, ...staticShortcuts, ...quickActions].filter((item) => {
      if (!item.level) return true;
      if (item.level === "expert" && mode !== "expert") return false;
      return true;
    });
    // De-dupe by href+label combination
    const seen = new Set<string>();
    return merged.filter((item) => {
      const key = `${item.href}-${item.label}-${item.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customShortcuts, staticShortcuts, quickActions, mode]);

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

  const triggerToast = (message: string, tone: "success" | "info" | "warning" = "info") =>
    notify({ title: message, tone });

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
    const removed = customShortcuts.find((item) => item.id === id);
    setCustomShortcuts((prev) => prev.filter((item) => item.id !== id));
    // S3: keep suggestions clean by dropping from history too
    if (removed) {
      setHistory((prev) => prev.filter((h) => !(h.href === removed.href && h.label === removed.label)));
    }
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
          <DropdownMenuItem
            onSelect={() => {
              startHCITour();
              triggerToast("Starting HCI Golden Rules presentation", "info");
            }}
            className="gap-2 text-sm font-semibold text-amber-200"
            data-hci="hci-tour-trigger-mobile"
          >
            <BookOpen className="h-4 w-4" />
            HCI Presentation
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
            placeholder={`Quick search (${mode === "expert" ? "advanced" : "guided"} mode)`}
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
            data-tour="search-suggestions"
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
        <InfoBadge
          content="Tips: Cmd/Ctrl+K to search, ↑↓ navigate, Enter open, Esc close. Add shortcuts with the bookmark icon."
          aria-label="Usage tips"
          data-hci="info-button"
          onClick={() => triggerToast("Tips: Cmd/Ctrl+K search, ↑↓ navigate, Enter open, Esc close.", "info")}
          className="hidden lg:inline-flex"
        />
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
          variant="outline"
          size="sm"
          className="hidden items-center gap-2 rounded-full border-amber-700/60 bg-amber-950/30 text-[11px] font-semibold text-amber-200 hover:border-amber-500 hover:bg-amber-950/50 md:flex"
          onClick={() => {
            startHCITour();
            triggerToast("Starting HCI Golden Rules presentation", "info");
          }}
          data-tour="hci-tour-trigger"
          data-hci="hci-presentation"
          aria-pressed={auth.showHCITour}
        >
          <BookOpen className="h-4 w-4" />
          {auth.showHCITour ? "HCI Tour running" : "HCI Presentation"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 rounded-full border border-slate-900 bg-slate-900/70 text-[11px] font-semibold text-indigo-200 hover:bg-slate-900 lg:flex"
          data-tour="mode-toggle"
          onClick={() => {
            const next = mode === "basic" ? "expert" : "basic";
            toggleMode();
            triggerToast(`Switched to ${next} mode`, "info");
          }}
          aria-pressed={mode === "expert"}
          aria-label={`Toggle mode, currently ${mode}`}
        >
          Mode: {mode === "expert" ? "Expert" : "Basic"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border-slate-800 bg-slate-900/70 text-xs font-semibold text-slate-100 hover:border-indigo-500 hover:bg-slate-900"
              aria-label="Account menu"
              data-hci="account-menu"
            >
              <User className="h-4 w-4" />
              {auth.userName ?? "admin"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-950 text-slate-100">
            <DropdownMenuItem className="text-xs text-slate-400" disabled>
              Signed in as {auth.userName ?? "admin"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-sm"
              onSelect={(e) => {
                e.preventDefault();
                openPasswordModal();
              }}
            >
              <Settings className="h-4 w-4" />
              Change password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-sm text-red-200 focus:text-red-100"
              onSelect={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Network Status Badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/30 text-[11px] font-semibold text-emerald-200 hover:border-emerald-500 hover:bg-emerald-950/50 lg:flex"
              data-tour="network-status"
              data-hci="network-badge"
              aria-label="Network status"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Network stable
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-slate-950 text-slate-100">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">Connection Health</div>
            <DropdownMenuItem className="flex justify-between text-sm" disabled>
              <span>Status</span>
              <span className="text-emerald-400">Connected</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between text-sm" disabled>
              <span>Latency</span>
              <span className="text-slate-300">12ms</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between text-sm" disabled>
              <span>Packet Loss</span>
              <span className="text-slate-300">0.0%</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between text-sm" disabled>
              <span>Uptime</span>
              <span className="text-slate-300">3d 14h 22m</span>
            </DropdownMenuItem>
            <Separator className="my-1 bg-slate-800" />
            <DropdownMenuItem 
              className="text-sm text-indigo-300"
              onSelect={() => router.push("/performance")}
            >
              View detailed stats →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
        <DialogContent className="bg-slate-950 text-slate-100" data-tour="shortcut-dialog">
          <DialogHeader>
            <DialogTitle>Add a shortcut</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Save quick links to pages or sections. Internal paths only (e.g. /wifi).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 rounded-md border border-slate-800 bg-slate-950/60 p-3">
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
              <DialogFooter className="gap-2 sm:gap-0 px-0">
                <Button variant="ghost" size="sm" onClick={() => setShortcutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600" onClick={saveCustomShortcut}>
                  Save shortcut
                </Button>
              </DialogFooter>
            </div>

            <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-100">
                <span>Saved shortcuts</span>
                <span className="text-[11px] text-slate-500">{customShortcuts.length || "0"}</span>
              </div>
              {customShortcuts.length === 0 && (
                <p className="text-xs text-slate-500">No custom shortcuts yet. Add one to jump faster.</p>
              )}
              {customShortcuts.length > 0 && (
                <div className="space-y-2">
                  {customShortcuts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-slate-500">{item.href}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-200 hover:text-amber-100"
                        onClick={() => removeShortcut(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </header>
  );
}
