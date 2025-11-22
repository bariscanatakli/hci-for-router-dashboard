// TODO: Build router dashboard topbar navigation with icons

"use client";

import Link from "next/link";
import { Activity, Bell, Menu, Search, Settings } from "lucide-react";
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
        <DropdownMenuContent align="start" className="w-44 bg-slate-950 text-slate-100">
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden w-full max-w-xl items-center gap-3 rounded-full border border-slate-900 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 shadow-md shadow-slate-950/40 sm:flex">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search devices, SSIDs, ports..."
          className={cn(
            "h-7 border-0 bg-transparent px-0 text-sm text-slate-100 placeholder:text-slate-500",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-slate-200 hover:bg-slate-900"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="hidden h-6 bg-slate-800 lg:block" />
        <Button
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 rounded-full border border-slate-900 bg-slate-900/70 text-xs font-medium text-emerald-200 hover:bg-slate-900 lg:flex"
        >
          <span className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-400" />
          Network stable
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 rounded-full bg-indigo-500 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-600"
        >
          <Activity className="h-4 w-4" />
          Live Monitor
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-9 w-9 rounded-full border border-slate-900 bg-slate-900/70 text-slate-200 hover:bg-slate-900 sm:inline-flex"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
