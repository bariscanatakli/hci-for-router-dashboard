"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  UserCog, 
  Target, 
  CheckCircle2,
  AlertTriangle,
  Home,
  Wifi,
  Shield,
  Activity,
  Settings,
  Quote,
  Heart,
  Brain,
  Eye,
  MousePointer,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ==================== PERSONAS ====================

const PERSONAS = {
  expert: {
    id: "expert",
    name: "Alex Chen",
    age: 34,
    occupation: "Network Engineer / System Administrator",
    location: "San Francisco",
    icon: UserCog,
    color: "cyan",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-400/50",
    textColor: "text-cyan-300",
    avatar: "👨‍💻",
    bio: "10 years of experience as a network engineer. Actively uses OpenWrt, pfSense, and MikroTik platforms. Manages network infrastructure at home and office.",
    quote: "OpenWrt is powerful but the interface looks like it's from 2005. I wish it explained what each setting does and had a modern UI.",
    goals: [
      "Quick access to advanced features like port forwarding, VLAN, QoS",
      "Real-time performance metrics and graphs",
      "Clear and understandable error messages",
      "Batch operations and keyboard shortcuts"
    ],
    frustrations: [
      "OpenWrt's complex and outdated interface",
      "Settings not explaining their purpose",
      "Unable to undo changes easily",
      "Difficulty using on mobile devices"
    ],
    techLevel: 5,
    routerUsage: "Daily, professional level"
  },
  casual: {
    id: "casual",
    name: "Sarah Miller",
    age: 28,
    occupation: "Graphic Designer",
    location: "Austin",
    icon: User,
    color: "lime",
    bgColor: "bg-lime-500/20",
    borderColor: "border-lime-400/50",
    textColor: "text-lime-300",
    avatar: "👩‍🎨",
    bio: "Freelance graphic designer. Works from home, internet connection is critical for work. Not tech-savvy but needs stable connectivity.",
    quote: "I don't want to mess with router settings, but sometimes I need to change the Wi-Fi password. Why is it so complicated?",
    goals: [
      "Easily change Wi-Fi password",
      "See connected devices",
      "Check internet speed",
      "Feel confident about security"
    ],
    frustrations: [
      "Not understanding technical terms",
      "Fear of breaking internet by clicking wrong thing",
      "Can't remember addresses like 192.168.1.1",
      "Interface too technical and intimidating"
    ],
    techLevel: 2,
    routerUsage: "Rarely, only when issues arise"
  }
};

// ==================== SCENARIOS ====================

const SCENARIOS = [
  {
    id: 1,
    title: "Changing Wi-Fi Password",
    description: "Updating network credentials securely",
    icon: Wifi,
    personas: {
      expert: {
        task: "Rotate guest network PSK after a security incident",
        painPoints: [
          "OpenWrt: Network → Wireless → radio0.network1 → Interface Configuration → Wireless Security",
          "No visual distinction between 2.4GHz and 5GHz SSIDs in the interface list",
          "hostapd restart required but no clear indication if clients will be disconnected",
          "WPA3-SAE transition mode requires manual cipher suite configuration"
        ],
        withDashboard: [
          "Direct 'Wi-Fi Settings' link in sidebar with network topology preview",
          "Guest network has distinct card with isolation status indicator",
          "Password strength meter with entropy calculation (bits)",
          "Live client count shown; 'Apply' warns about active session interruption"
        ]
      },
      casual: {
        task: "Change password because too many neighbors know it",
        painPoints: [
          "Bookmark lost; searching '192.168.1.1' sometimes fails (CGNAT issues)",
          "Login page looks like a phishing site with no branding",
          "WPA2-PSK vs WPA3 dropdown is intimidating",
          "No confirmation that new password actually works"
        ],
        withDashboard: [
          "Router dashboard accessible via mDNS (router.local)",
          "Clean login with router model branding and last-login info",
          "'Strong' / 'Weak' badge with simple suggestion tooltip",
          "Toast notification: 'Password updated. Reconnect your devices.'"
        ]
      }
    }
  },
  {
    id: 2,
    title: "Identifying Rogue Devices",
    description: "Network security and device audit",
    icon: User,
    personas: {
      expert: {
        task: "Detect unauthorized device and isolate it without disrupting LAN",
        painPoints: [
          "DHCP leases in Status → DHCP Leases shows IP/MAC but no vendor OUI resolution",
          "ARP table and DHCP leases are separate pages with no cross-reference",
          "Blocking requires adding firewall rule manually in /etc/config/firewall",
          "No audit log of when device first appeared or traffic volume"
        ],
        withDashboard: [
          "Unified device list with OUI vendor lookup (e.g., 'Apple Inc.')",
          "First-seen timestamp and cumulative bandwidth per device",
          "One-click 'Block' adds DROP rule; 'Quarantine' moves to isolated VLAN",
          "Device activity sparkline shows traffic pattern anomalies"
        ]
      },
      casual: {
        task: "Check if someone is stealing Wi-Fi and slowing down Netflix",
        painPoints: [
          "MAC address 'AA:BB:CC:DD:EE:FF' means nothing to non-technical user",
          "Can't distinguish between 'iPhone' and 'iPhone' (multiple Apple devices)",
          "No obvious 'Block' or 'Kick' button anywhere",
          "Paranoid about breaking own smart TV or printer connection"
        ],
        withDashboard: [
          "'12 devices online' card with familiar icons (phone, laptop, TV, IoT)",
          "Custom device nicknames persist: 'Kids iPad', 'Living Room TV'",
          "Red 'Block' button with confirmation: 'This will disconnect the device'",
          "'Your devices' section separated from 'Unknown devices'"
        ]
      }
    }
  },
  {
    id: 3,
    title: "Port Forwarding for Self-Hosted Services",
    description: "Exposing internal services to the internet",
    icon: Shield,
    personas: {
      expert: {
        task: "Expose Plex server (32400/TCP) with proper firewall hardening",
        painPoints: [
          "OpenWrt: Network → Firewall → Port Forwards → Add; then Traffic Rules for rate limiting",
          "Distinction between DNAT (port forward) and SNAT (masquerade) is unclear in UI",
          "No visual feedback if port is already in use by another rule or service",
          "Logs in System → Log don't filter by forwarded port traffic"
        ],
        withDashboard: [
          "Port Forward Wizard with protocol detection (knows 32400 = Plex)",
          "Conflict detection: 'Port 80 already used by LuCI web interface'",
          "Optional: auto-create input rule to rate-limit by source IP",
          "Undo stack: last 5 deleted rules can be restored with one click"
        ]
      },
      casual: {
        task: "Open port for Minecraft so friends can join the server",
        painPoints: [
          "Tutorial says 'forward port 25565' but doesn't explain where",
          "Internal IP vs External IP vs Gateway IP confusion",
          "'Protocol: TCP or UDP?' — no idea which one Minecraft uses",
          "Port opened but friends still can't connect; no diagnostic help"
        ],
        withDashboard: [
          "InfoBadge: 'Port forwarding lets external users reach your server'",
          "Device dropdown shows hostnames, not just IPs: 'gaming-pc (192.168.1.50)'",
          "Common ports preset: 'Minecraft', 'Plex', 'SSH' with auto TCP/UDP selection",
          "Built-in port check: 'Port 25565 is reachable from the internet ✓'"
        ]
      }
    }
  },
  {
    id: 4,
    title: "Diagnosing Network Performance Issues",
    description: "Troubleshooting latency and bandwidth problems",
    icon: Activity,
    personas: {
      expert: {
        task: "Identify if packet loss is on WAN uplink or local Wi-Fi segment",
        painPoints: [
          "Need to SSH in and run 'ping -c 100 8.8.8.8' manually for stats",
          "No per-interface bandwidth graphs (LAN vs WAN vs WLAN)",
          "SQM/QoS status not visible; have to check /etc/config/sqm",
          "Bufferbloat diagnosis requires external tools like waveform.com"
        ],
        withDashboard: [
          "Performance page with WAN latency graph (1h/24h/7d views)",
          "Per-interface throughput: 'WAN: 94 Mbps ↓ / 18 Mbps ↑'",
          "SQM status badge: 'Active — cake @ 100Mbit' with link to settings",
          "Built-in bufferbloat test with grade (A-F) and jitter histogram"
        ]
      },
      casual: {
        task: "Find out why Zoom calls keep freezing during work hours",
        painPoints: [
          "ISP says 'your connection is fine' but video stutters daily",
          "Speed test shows 100 Mbps but doesn't explain latency spikes",
          "No way to see if kids' gaming is hogging bandwidth",
          "Can't tell if problem is router, modem, or ISP"
        ],
        withDashboard: [
          "Dashboard: 'Internet: Good' / 'Internet: Degraded' status with reason",
          "Simple bandwidth chart: 'Peak usage at 3 PM — 85% capacity'",
          "Top bandwidth users: 'PS5 downloaded 12 GB today'",
          "One-click 'Run speed test' with latency + jitter results"
        ]
      }
    }
  }
];

// ==================== SLIDES ====================

type SlideType = 
  | { type: "title" }
  | { type: "agenda" }
  | { type: "persona"; personaId: "expert" | "casual" }
  | { type: "scenario"; scenarioId: number; step: "expert" | "casual" }
  | { type: "hci-intro" }
  | { type: "solution-overview" }
  | { type: "demo-intro" }
  | { type: "conclusion" };

const SLIDES: SlideType[] = [
  { type: "title" },
  { type: "agenda" },
  { type: "persona", personaId: "expert" },
  { type: "persona", personaId: "casual" },
  // Each scenario now has 2 sub-slides: expert view then casual view
  { type: "scenario", scenarioId: 1, step: "expert" },
  { type: "scenario", scenarioId: 1, step: "casual" },
  { type: "scenario", scenarioId: 2, step: "expert" },
  { type: "scenario", scenarioId: 2, step: "casual" },
  { type: "scenario", scenarioId: 3, step: "expert" },
  { type: "scenario", scenarioId: 3, step: "casual" },
  { type: "scenario", scenarioId: 4, step: "expert" },
  { type: "scenario", scenarioId: 4, step: "casual" },
  { type: "hci-intro" },
  { type: "solution-overview" },
  { type: "demo-intro" },
  { type: "conclusion" },
];

// ==================== SLIDE COMPONENTS ====================

function TitleSlide() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-2xl shadow-cyan-500/40">
          <Wifi className="h-12 w-12 text-white" />
        </div>
      </div>
      <h1 className="mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-6xl font-bold text-transparent drop-shadow-lg">
        Router Dashboard
      </h1>
      <p className="mb-2 text-3xl font-medium text-white">
        HCI-Focused Network Management Interface
      </p>
      <p className="mb-8 text-xl text-blue-200">
        Implementing Shneiderman&apos;s 8 Golden Rules
      </p>
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-lg text-cyan-200 backdrop-blur-sm">
        <Sparkles className="h-5 w-5 text-yellow-300" />
        Human-Computer Interaction Term Project
      </div>
    </div>
  );
}

function AgendaSlide() {
  const items = [
    { icon: User, title: "User Personas", desc: "Two distinct user profiles", color: "text-cyan-300" },
    { icon: Target, title: "User Scenarios", desc: "Real-world use cases", color: "text-lime-300" },
    { icon: Brain, title: "HCI Principles", desc: "Shneiderman's 8 Golden Rules", color: "text-purple-300" },
    { icon: Eye, title: "Solution Overview", desc: "Dashboard design approach", color: "text-pink-300" },
    { icon: MousePointer, title: "Live Demo", desc: "Interactive demo & HCI Tour", color: "text-yellow-300" },
  ];

  return (
    <div className="flex h-full flex-col justify-center">
      <h2 className="mb-10 text-center text-4xl font-bold text-white">
        Presentation Agenda
      </h2>
      <div className="mx-auto grid max-w-3xl gap-5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-5 rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl bg-white/10", item.color)}>
              <item.icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold text-white">{item.title}</div>
              <div className="text-lg text-blue-200">{item.desc}</div>
            </div>
            <div className="text-4xl font-bold text-white/30">{idx + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonaSlide({ personaId }: { personaId: "expert" | "casual" }) {
  const persona = PERSONAS[personaId];

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-8">
          <div className={cn(
            "flex h-28 w-28 items-center justify-center rounded-3xl text-6xl",
            persona.bgColor,
            "ring-4",
            persona.borderColor
          )}>
            {persona.avatar}
          </div>
          <div>
            <div className={cn("text-lg font-bold uppercase tracking-wider", persona.textColor)}>
              {personaId === "expert" ? "Expert User Persona" : "Casual User Persona"}
            </div>
            <h2 className="text-4xl font-bold text-white">{persona.name}</h2>
            <p className="text-xl text-blue-200">{persona.age} years old • {persona.occupation} • {persona.location}</p>
          </div>
        </div>

        {/* Quote */}
        <div className={cn("mb-8 rounded-2xl border-2 p-6", persona.bgColor, persona.borderColor)}>
          <Quote className={cn("mb-3 h-8 w-8", persona.textColor)} />
          <p className="text-xl italic text-white">&ldquo;{persona.quote}&rdquo;</p>
        </div>

        {/* Bio */}
        <p className="mb-8 text-xl text-blue-100">{persona.bio}</p>

        {/* Tech Level */}
        <div className="mb-8">
          <div className="mb-3 text-lg text-blue-200">Technical Proficiency</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-4 w-12 rounded-full transition-all",
                  level <= persona.techLevel 
                    ? persona.id === "expert" ? "bg-cyan-400" : "bg-lime-400"
                    : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Goals & Frustrations */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-emerald-400/50 bg-emerald-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-xl text-emerald-300">
                <Target className="h-6 w-6" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {persona.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg text-white">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                    {goal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-rose-400/50 bg-rose-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-xl text-rose-300">
                <AlertTriangle className="h-6 w-6" />
                Frustrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {persona.frustrations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg text-white">
                    <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-rose-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScenarioSlide({ scenarioId, activePersona }: { scenarioId: number; activePersona: "expert" | "casual" }) {
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;
  const personaData = scenario.personas[activePersona];
  const persona = PERSONAS[activePersona];
  const ScenarioIcon = scenario.icon;

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mx-auto max-w-5xl">
        {/* Scenario Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-3 rounded-full bg-amber-500/20 px-5 py-2 text-lg text-amber-300">
            <ScenarioIcon className="h-5 w-5" />
            Scenario {scenario.id}
          </div>
          <h2 className="text-4xl font-bold text-white">{scenario.title}</h2>
          <p className="text-xl text-blue-200">{scenario.description}</p>
        </div>

        {/* Active Persona Indicator */}
        <div className="mb-8 flex justify-center">
          <div className={cn(
            "flex items-center gap-4 rounded-2xl px-8 py-4 ring-2",
            persona.bgColor,
            persona.borderColor
          )}>
            <span className="text-4xl">{persona.avatar}</span>
            <div>
              <div className={cn("text-sm font-bold uppercase tracking-wider", persona.textColor)}>
                {activePersona === "expert" ? "Expert View" : "Casual View"}
              </div>
              <div className="text-xl font-semibold text-white">{persona.name}</div>
            </div>
          </div>
        </div>

        {/* Task */}
        <div className={cn("mb-8 rounded-2xl border-2 p-6", persona.bgColor, persona.borderColor)}>
          <div className="text-lg text-blue-200">Task:</div>
          <p className="text-2xl font-medium text-white">{personaData.task}</p>
        </div>

        {/* Before/After Comparison */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-rose-400/40 bg-rose-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-xl text-rose-300">
                <AlertTriangle className="h-6 w-6" />
                Traditional Router UI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {personaData.painPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg text-white">
                    <span className="mt-1 text-xl text-rose-400">✗</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-400/40 bg-emerald-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-xl text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
                HCI Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {personaData.withDashboard.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg text-white">
                    <span className="mt-1 text-xl text-emerald-400">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HCIIntroSlide() {
  const rules = [
    { num: 1, title: "Consistency", desc: "Same actions, same results", color: "from-blue-500 to-cyan-500" },
    { num: 2, title: "Shortcuts", desc: "For expert users", color: "from-cyan-500 to-teal-500" },
    { num: 3, title: "Feedback", desc: "Response to every action", color: "from-teal-500 to-green-500" },
    { num: 4, title: "Closure", desc: "Clear task completion", color: "from-green-500 to-lime-500" },
    { num: 5, title: "Error Prevention", desc: "Prevent mistakes upfront", color: "from-lime-500 to-yellow-500" },
    { num: 6, title: "Reversal", desc: "Undo always available", color: "from-yellow-500 to-orange-500" },
    { num: 7, title: "User Control", desc: "User initiates actions", color: "from-orange-500 to-red-500" },
    { num: 8, title: "Memory Load", desc: "Reduce recall burden", color: "from-red-500 to-pink-500" },
  ];

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-purple-500/20 px-5 py-2 text-lg text-purple-300">
          <Brain className="h-5 w-5" />
          Ben Shneiderman
        </div>
        <h2 className="mb-3 text-4xl font-bold text-white">
          8 Golden Rules of Interface Design
        </h2>
        <p className="mb-10 text-xl text-blue-200">
          Core HCI principles applied throughout the project
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rules.map((rule) => (
            <div
              key={rule.num}
              className="group rounded-2xl border border-white/20 bg-white/5 p-5 text-left backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
            >
              <div className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white",
                rule.color
              )}>
                S{rule.num}
              </div>
              <div className="text-lg font-semibold text-white">{rule.title}</div>
              <div className="text-base text-blue-200">{rule.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SolutionOverviewSlide() {
  const features = [
    { icon: Home, title: "Dashboard", desc: "Status at a glance", color: "from-blue-500 to-cyan-500" },
    { icon: Wifi, title: "Wi-Fi", desc: "Easy network settings", color: "from-cyan-500 to-teal-500" },
    { icon: Shield, title: "Security", desc: "Firewall & port mgmt", color: "from-teal-500 to-green-500" },
    { icon: Activity, title: "Performance", desc: "Real-time charts", color: "from-green-500 to-lime-500" },
    { icon: Settings, title: "System", desc: "Firmware & maintenance", color: "from-lime-500 to-yellow-500" },
  ];

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-3 text-4xl font-bold text-white">
          Solution: Modern Router Dashboard
        </h2>
        <p className="mb-10 text-xl text-blue-200">
          Next.js + TypeScript + Tailwind + Shadcn UI
        </p>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
            >
              <div className="mb-4 flex justify-center">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br",
                  feature.color
                )}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-lg font-semibold text-white">{feature.title}</div>
              <div className="text-base text-blue-200">{feature.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-sm">
          <h3 className="mb-6 text-2xl font-semibold text-white">Key HCI Approaches</h3>
          <div className="grid gap-4 text-left text-lg sm:grid-cols-2">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Low cognitive load
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Task-oriented UX flows
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Clear visual hierarchy
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Responsive design
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              InfoBadge help tooltips
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Undo/Redo support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoIntroSlide() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-2xl shadow-emerald-500/40">
        <MousePointer className="h-14 w-14 text-white" />
      </div>
      <h2 className="mb-4 text-4xl font-bold text-white">
        Live Demo Time!
      </h2>
      <p className="mb-10 max-w-lg text-xl text-blue-200">
        Let&apos;s explore the Router Dashboard and its HCI Tour feature together.
      </p>
      <div className="flex flex-col gap-4">
        <a
          href="/login"
          target="_blank"
          className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-8 py-4 text-xl font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/50"
        >
          <Sparkles className="h-6 w-6" />
          Open Dashboard
        </a>
        <p className="text-lg text-blue-300">
          Login: admin / admin
        </p>
        <p className="mt-4 text-base text-blue-400">
          Press <kbd className="rounded bg-white/20 px-2 py-1 font-mono">Enter</kbd> to open dashboard
        </p>
      </div>
    </div>
  );
}

function ConclusionSlide() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-400 via-rose-500 to-red-600 shadow-2xl shadow-pink-500/40">
        <Heart className="h-14 w-14 text-white" />
      </div>
      <h2 className="mb-4 text-4xl font-bold text-white">
        Thank You!
      </h2>
      <p className="mb-10 max-w-xl text-xl text-blue-200">
        By applying HCI principles, we created a router management interface
        that works for both expert and casual users.
      </p>
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-6">
          <div className="text-4xl font-bold text-cyan-300">8</div>
          <div className="text-lg text-blue-200">Golden Rules</div>
        </div>
        <div className="rounded-2xl border border-lime-400/40 bg-lime-500/10 p-6">
          <div className="text-4xl font-bold text-lime-300">2</div>
          <div className="text-lg text-blue-200">User Personas</div>
        </div>
        <div className="rounded-2xl border border-purple-400/40 bg-purple-500/10 p-6">
          <div className="text-4xl font-bold text-purple-300">31</div>
          <div className="text-lg text-blue-200">HCI Tour Slides</div>
        </div>
      </div>
      <div className="text-2xl font-medium text-yellow-300">
        Questions?
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const totalSlides = SLIDES.length;

  const goNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      setAnimationKey((prev) => prev + 1);
    }
  }, [currentSlide, totalSlides]);

  const goBack = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setAnimationKey((prev) => prev + 1);
    }
  }, [currentSlide]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
      setAnimationKey((prev) => prev + 1);
    }
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(totalSlides - 1);
      } else if (e.key === "Enter") {
        // On Demo Intro slide (index 14), open dashboard
        if (SLIDES[currentSlide].type === "demo-intro") {
          e.preventDefault();
          window.open("/login", "_blank");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goBack, goTo, totalSlides, currentSlide]);

  const renderSlide = () => {
    const slide = SLIDES[currentSlide];
    
    switch (slide.type) {
      case "title":
        return <TitleSlide />;
      case "agenda":
        return <AgendaSlide />;
      case "persona":
        return <PersonaSlide personaId={slide.personaId} />;
      case "scenario":
        return <ScenarioSlide scenarioId={slide.scenarioId} activePersona={slide.step} />;
      case "hci-intro":
        return <HCIIntroSlide />;
      case "solution-overview":
        return <SolutionOverviewSlide />;
      case "demo-intro":
        return <DemoIntroSlide />;
      case "conclusion":
        return <ConclusionSlide />;
      default:
        return null;
    }
  };

  const getSlideTitle = (slide: SlideType) => {
    switch (slide.type) {
      case "title":
        return "Title";
      case "agenda":
        return "Agenda";
      case "persona":
        return `Persona: ${PERSONAS[slide.personaId].name}`;
      case "scenario": {
        const scenario = SCENARIOS.find(s => s.id === slide.scenarioId)!;
        const personaName = PERSONAS[slide.step].name.split(" ")[0];
        return `S${slide.scenarioId}: ${scenario.title} (${personaName})`;
      }
      case "hci-intro":
        return "HCI Principles";
      case "solution-overview":
        return "Solution";
      case "demo-intro":
        return "Demo";
      case "conclusion":
        return "Conclusion";
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Main content */}
      <main className="flex-1 overflow-hidden p-8">
        <div className="mx-auto h-full max-w-6xl">
          <div
            key={animationKey}
            className="h-full animate-slide-in"
          >
            {renderSlide()}
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <footer className="border-t border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  idx === currentSlide
                    ? "w-8 bg-cyan-400"
                    : "w-2.5 bg-white/30 hover:bg-white/50"
                )}
                title={getSlideTitle(slide)}
              />
            ))}
          </div>

          {/* Slide counter */}
          <div className="text-lg text-blue-200">
            {currentSlide + 1} / {totalSlides}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={goBack}
              disabled={currentSlide === 0}
              className="gap-2 text-lg text-blue-200 hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={goNext}
              disabled={currentSlide === totalSlides - 1}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
