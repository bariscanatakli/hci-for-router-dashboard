"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Code,
  X,
  Sparkles,
  BookOpen,
  Zap,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Undo2,
  Hand,
  Brain,
  List,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Golden Rule definitions with icons and colors
const GOLDEN_RULES = {
  S1: {
    number: 1,
    title: "Strive for Consistency",
    description: "Consistent sequences of actions, terminology, and visual design across the interface.",
    icon: BookOpen,
    color: "emerald",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/40",
  },
  S2: {
    number: 2,
    title: "Cater to Universal Usability",
    description: "Provide shortcuts for frequent users while maintaining accessibility for beginners.",
    icon: Zap,
    color: "amber",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/40",
  },
  S3: {
    number: 3,
    title: "Offer Informative Feedback",
    description: "For every user action, provide clear and immediate system feedback.",
    icon: MessageSquare,
    color: "blue",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/40",
  },
  S4: {
    number: 4,
    title: "Design for Closure",
    description: "Sequences of actions should have clear beginning, middle, and end states.",
    icon: CheckCircle2,
    color: "purple",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
  },
  S5: {
    number: 5,
    title: "Prevent Errors",
    description: "Design the system to prevent errors; offer simple, constructive error handling.",
    icon: AlertTriangle,
    color: "rose",
    bgColor: "bg-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/40",
  },
  S6: {
    number: 6,
    title: "Permit Easy Reversal",
    description: "Allow users to undo actions, reducing anxiety and encouraging exploration.",
    icon: Undo2,
    color: "cyan",
    bgColor: "bg-cyan-500/20",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/40",
  },
  S7: {
    number: 7,
    title: "Support Internal Locus of Control",
    description: "Users should feel in control of the interface, not the other way around.",
    icon: Hand,
    color: "orange",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/40",
  },
  S8: {
    number: 8,
    title: "Reduce Short-term Memory Load",
    description: "Keep displays simple, provide visual cues, and minimize information users must remember.",
    icon: Brain,
    color: "indigo",
    bgColor: "bg-indigo-500/20",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/40",
  },
} as const;

type RuleKey = keyof typeof GOLDEN_RULES;

// HCI Tour step structure
type HCITourStep = {
  ruleKey: RuleKey;
  title: string;
  description: string;
  implementation: string;
  selector?: string;
  modalSelector?: string; // Alternative selector to use when modal is open
  secondarySelector?: string; // Secondary element to highlight with green pulse (e.g., close button)
  page: string;
  demoAction?: string;
  codeExample?: string;
  interactionRequired?: boolean;
};

// Complete HCI Tour covering all 8 Golden Rules
const HCI_TOUR_STEPS: HCITourStep[] = [
  // ===== INTRODUCTION =====
  {
    ruleKey: "S1",
    title: "Welcome to HCI Golden Rules Tour",
    description: "This presentation demonstrates how Shneiderman's 8 Golden Rules of Interface Design are implemented throughout the Router Dashboard.",
    implementation: "Each rule is showcased with real, interactive examples from the application. Use Next/Back to navigate, or select any slide from the dropdown.",
    selector: '[data-tour="dashboard-header"]',
    page: "/dashboard",
    demoAction: "Press Next to begin exploring each Golden Rule",
  },

  // ===== RULE 1: CONSISTENCY =====
  {
    ruleKey: "S1",
    title: "S1: Consistent Navigation",
    description: "The sidebar provides consistent navigation labels that match throughout the application.",
    implementation: "Both Sidebar.tsx and Topbar.tsx use the same navItems array. Labels like 'Dashboard', 'Devices', 'Wi-Fi' appear identically everywhere.",
    selector: '[data-tour="sidebar-links"]',
    page: "/dashboard",
    demoAction: "Notice how all navigation items use consistent naming",
  },
  {
    ruleKey: "S1",
    title: "S1: Consistent Card Design (1/3)",
    description: "Internet Status card shows connection details with a consistent layout.",
    implementation: "Card structure: Header (icon + title + status badge), Description, Content section with stats, and implicit navigation action.",
    selector: '[data-tour="status-card-internet"]',
    page: "/dashboard",
    demoAction: "Notice the card structure: icon, title, status badge, and organized content",
  },
  {
    ruleKey: "S1",
    title: "S1: Consistent Card Design (2/3)",
    description: "Wi-Fi Status card follows the exact same pattern - proving consistency.",
    implementation: "Same layout applied: Header with icon and toggle, network info in body, action button at bottom. Visual hierarchy is identical.",
    selector: '[data-tour="status-card-wifi"]',
    page: "/dashboard",
    demoAction: "Compare with Internet card - same structure, different content",
  },
  {
    ruleKey: "S1",
    title: "S1: Consistent Card Design (3/3)",
    description: "Connected Devices card completes the trio with the same consistent design.",
    implementation: "Identical pattern: status indicators (online/offline), categorized breakdown, and navigation CTA. Users learn the pattern once.",
    selector: '[data-tour="status-card-devices"]',
    page: "/dashboard",
    demoAction: "All three cards share the same DNA - consistency reduces cognitive load",
  },
  {
    ruleKey: "S1",
    title: "S1: Consistent Page Headers",
    description: "Every page follows the same header pattern: icon, title, description, and optional info badge.",
    implementation: "All page.tsx files use identical header structure with flex layout, consistent icon sizing (h-10 w-10), and typography (text-3xl font-bold).",
    selector: '[data-tour="performance-header"]',
    page: "/performance",
    demoAction: "Navigate between pages to see identical header patterns",
  },

  // ===== RULE 2: SHORTCUTS =====
  {
    ruleKey: "S2",
    title: "S2: Global Keyboard Shortcut",
    description: "Power users can press Cmd/Ctrl+K from anywhere to instantly open the search panel with smart suggestions.",
    implementation: "Topbar.tsx listens for keydown events globally. The shortcut bypasses navigation and opens search immediately. Suggestions appear as you type.",
    selector: '[data-tour="topbar-search"]',
    modalSelector: '[data-tour="search-suggestions"]',
    page: "/dashboard",
    demoAction: "Try pressing Cmd/Ctrl+K and start typing to see suggestions!",
    interactionRequired: true,
    codeExample: `useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  };
  window.addEventListener("keydown", handler);
}, []);`,
  },
  {
    ruleKey: "S2",
    title: "S2: Custom Shortcuts",
    description: "Users can save custom shortcuts for frequently accessed pages or sections.",
    implementation: "Click the bookmark icon next to search to add custom shortcuts. These persist in localStorage and appear in search results.",
    selector: '[data-tour="topbar-search"]',
    modalSelector: '[data-tour="shortcut-dialog"]',
    page: "/dashboard",
    demoAction: "Click the bookmark icon (📑) to add a custom shortcut",
    interactionRequired: true,
  },
  {
    ruleKey: "S2",
    title: "S2: Mode Toggle (Basic/Expert)",
    description: "Expert users can unlock advanced features with a single toggle, while beginners see a simplified interface.",
    implementation: "settingsStore persists mode preference. Pages conditionally render expert-only sections based on mode state.",
    selector: '[data-tour="mode-toggle"]',
    page: "/dashboard",
    demoAction: "Click the Mode button to toggle between Basic and Expert",
    interactionRequired: true,
  },

  // ===== RULE 3: FEEDBACK =====
  {
    ruleKey: "S3",
    title: "S3: Toast Notifications",
    description: "Every significant action triggers an immediate toast notification with clear status.",
    implementation: "FeedbackProvider wraps the app, exposing notify() function. Toasts auto-dismiss and support success/warning/error tones.",
    selector: '[data-tour="mode-toggle"]',
    page: "/dashboard",
    demoAction: "Click the Mode toggle to see instant feedback toast",
    interactionRequired: true,
  },
  {
    ruleKey: "S3",
    title: "S3: Network Status Badge",
    description: "Real-time network health is always visible in the topbar with expandable details.",
    implementation: "NetworkBadge shows 'Stable' with green dot. Clicking reveals dropdown with latency, packet loss, and uptime.",
    selector: '[data-tour="network-status"]',
    page: "/dashboard",
    demoAction: "Click the 'Network stable' badge to see detailed connection health",
    interactionRequired: true,
  },
  {
    ruleKey: "S3",
    title: "S3: Save Status Indicators",
    description: "Forms show saving state, last saved time, and clear success/error feedback.",
    implementation: "StatusChip component displays 'Saving...' during save, then 'Saved' with timestamp on success.",
    selector: '[data-tour="wifi-form"]',
    page: "/wifi",
    demoAction: "Change any Wi-Fi setting to see the save indicator",
    interactionRequired: true,
  },
  {
    ruleKey: "S3",
    title: "S3: Chart Tooltips",
    description: "Hovering chart elements shows exact values, reducing guesswork.",
    implementation: "BandwidthMiniChart tracks hoveredIndex and displays tooltip with precise Mbps value and timestamp.",
    selector: '[data-tour="dashboard-health-cards"]',
    page: "/dashboard",
    demoAction: "Hover over any bar in the bandwidth chart to see exact values",
    interactionRequired: true,
  },

  // ===== RULE 4: CLOSURE =====
  {
    ruleKey: "S4",
    title: "S4: Firmware Update Progress",
    description: "Long-running operations show clear progress with percentage and estimated time.",
    implementation: "FirmwareCard tracks updateProgress (0-100%) with animated progress bar. Buttons disabled during update.",
    selector: '[data-tour="system-firmware"]',
    modalSelector: '[data-tour="firmware-confirm-dialog"]',
    page: "/system",
    demoAction: "Click 'Check updates' to see the progress flow (simulated)",
    interactionRequired: true,
  },
  {
    ruleKey: "S4",
    title: "S4: Reboot Countdown",
    description: "Router reboot shows real-time countdown so users know exactly when service returns.",
    implementation: "RebootCard displays countdown from 60s to 0s with progress bar. Completion triggers success toast.",
    selector: '[data-tour="reboot-card"]',
    modalSelector: '[data-tour="reboot-confirm-dialog"]',
    page: "/system",
    demoAction: "The reboot button shows a confirmation dialog, then countdown",
    interactionRequired: true,
  },
  {
    ruleKey: "S4",
    title: "S4: Dialog Action Confirmation",
    description: "Device actions (block, prioritize) show brief confirmation before closing dialog.",
    implementation: "DeviceDetailDialog displays 'Blocked' or 'Priority set' message for 1.5s before auto-closing.",
    selector: '[data-tour="devices-table"]',
    modalSelector: '[data-tour="device-dialog"]',
    page: "/devices",
    demoAction: "Click a device row, then try Block or Prioritize",
    interactionRequired: true,
  },

  // ===== RULE 5: ERROR PREVENTION =====
  {
    ruleKey: "S5",
    title: "S5: Form Validation",
    description: "Input errors are caught before submission with inline error messages.",
    implementation: "Wi-Fi form validates SSID (required) and password (min 8 chars). Errors appear inline in red.",
    selector: '[data-tour="wifi-form"]',
    page: "/wifi",
    demoAction: "Try entering a password shorter than 8 characters",
    interactionRequired: true,
  },
  {
    ruleKey: "S5",
    title: "S5: Port Forward Validation",
    description: "Port forwarding rules validate IP format and port range before allowing add.",
    implementation: "PortForwardWizard checks port 1-65535, valid IP pattern, and non-empty name. Add button disabled until valid.",
    selector: '[data-tour="port-forward-wizard"]',
    modalSelector: '[data-tour="port-forward-confirm-dialog"]',
    page: "/security",
    demoAction: "Try adding a rule with invalid port (0 or 70000)",
    interactionRequired: true,
  },
  {
    ruleKey: "S5",
    title: "S5: Confirmation Dialogs",
    description: "Destructive actions require explicit confirmation to prevent accidental data loss.",
    implementation: "AlertDialog components with clear 'Cancel' and 'Confirm' options appear before dangerous operations.",
    selector: '[data-tour="reboot-card"]',
    modalSelector: '[data-tour="reboot-dialog-actions"]',
    page: "/system",
    demoAction: "Click Reboot to see the confirmation dialog - Cancel to abort",
    interactionRequired: true,
  },

  // ===== RULE 6: REVERSAL =====
  {
    ruleKey: "S6",
    title: "S6: Undo Port Forward Deletion",
    description: "Accidentally deleted a port forward rule? Click Undo to restore it instantly.",
    implementation: "setLastRemoved stores the deleted rule. Undo button appears for 5 seconds after deletion.",
    selector: '[data-tour="port-forward-wizard"]',
    modalSelector: '[data-tour="port-forward-undo"]',
    page: "/security",
    demoAction: "Add a rule, then delete it - you'll see an Undo option",
    interactionRequired: true,
  },
  {
    ruleKey: "S6",
    title: "S6: Cancel & Back Navigation",
    description: "All dialogs and wizards offer clear escape routes - users are never trapped.",
    implementation: "All modals have X button and Escape key support. Forms have Cancel buttons.",
    selector: '[data-tour="devices-table"]',
    modalSelector: '[data-tour="device-dialog"]',
    secondarySelector: '[data-tour="dialog-close-button"]',
    page: "/devices",
    demoAction: "Open a device dialog, then press Escape or click X to exit",
    interactionRequired: true,
  },
  {
    ruleKey: "S6",
    title: "S6: Tour Navigation",
    description: "This tour itself supports reversal - go back anytime, jump to any slide, or exit.",
    implementation: "HCITour tracks globalIndex, saves to session, and allows jumping to any step via dropdown.",
    selector: '[data-tour="sidebar-nav"]',
    page: "/dashboard",
    demoAction: "Use Back button, dropdown, or ← arrow key to revisit slides",
  },

  // ===== RULE 7: USER CONTROL =====
  {
    ruleKey: "S7",
    title: "S7: User-Driven Navigation",
    description: "Users navigate freely via sidebar, search, or direct links - the system never forces a path.",
    implementation: "Sidebar provides constant access. Search offers instant jumps. Cards link directly to details.",
    selector: '[data-tour="sidebar-nav"]',
    page: "/dashboard",
    demoAction: "Click any sidebar item to navigate directly",
    interactionRequired: true,
  },
  {
    ruleKey: "S7",
    title: "S7: Quick Access Cards",
    description: "Dashboard provides direct links to all major sections - users navigate freely.",
    implementation: "Quick access grid with clear labels and icons. Each card is a direct route to its section.",
    selector: '[data-tour="dashboard-status-cards"]',
    page: "/dashboard",
    demoAction: "Click any status card to navigate directly to that section",
    interactionRequired: true,
  },
  {
    ruleKey: "S7",
    title: "S7: Skip/Exit Options",
    description: "Tours, modals, and wizards always provide escape routes - users are never trapped.",
    implementation: "All modals have X button and Escape key support. Tour has Skip button visible at all times.",
    selector: '[data-tour="guided-tour-trigger"]',
    page: "/dashboard",
    demoAction: "Notice the Skip and X buttons always available in this tour",
  },

  // ===== RULE 8: MEMORY LOAD =====
  {
    ruleKey: "S8",
    title: "S8: Visual Status Indicators",
    description: "Device status uses color coding (green=online, red=offline) instead of text labels.",
    implementation: "Status dots with consistent colors reduce cognitive load. Users learn the pattern once.",
    selector: '[data-tour="devices-table"]',
    page: "/devices",
    demoAction: "Scan the device list - status is instantly recognizable by color",
  },
  {
    ruleKey: "S8",
    title: "S8: Chart Axis Labels",
    description: "Charts show min/max values and time range labels so users don't need to remember scale.",
    implementation: "Y-axis shows 0 and max Mbps. X-axis shows '12 hrs ago' to 'now'. No mental math required.",
    selector: '[data-tour="dashboard-health-cards"]',
    page: "/dashboard",
    demoAction: "Look at the bandwidth chart - time and value ranges are clearly labeled",
  },
  {
    ruleKey: "S8",
    title: "S8: Grouped Navigation",
    description: "Related items are grouped logically - network (WiFi, Security), monitoring (Performance, Devices).",
    implementation: "Sidebar uses visual spacing and consistent iconography to create mental groups.",
    selector: '[data-tour="sidebar-nav"]',
    page: "/dashboard",
    demoAction: "Notice how sidebar items are logically organized by function",
  },
  {
    ruleKey: "S8",
    title: "S8: Info Badges",
    description: "Complex features have 'i' badges with hover tooltips explaining functionality.",
    implementation: "InfoBadge component provides contextual help without cluttering the interface.",
    selector: '[data-tour="performance-header"]',
    page: "/performance",
    demoAction: "Hover over any 'i' badge to see explanatory tooltip",
    interactionRequired: true,
  },

  // ===== CONCLUSION =====
  {
    ruleKey: "S1",
    title: "HCI Tour Complete!",
    description: "You've seen all 8 Golden Rules implemented across the Router Dashboard. Each rule contributes to a more usable, efficient, and satisfying user experience.",
    implementation: "This project demonstrates that HCI principles can be systematically applied to technical interfaces. The result is a dashboard that experts can use efficiently while remaining accessible to beginners.",
    selector: '[data-tour="dashboard-header"]',
    page: "/dashboard",
    demoAction: "Thank you for exploring! Press Finish to close the tour.",
  },
];

// Group steps by rule for progress display
const STEPS_BY_RULE = HCI_TOUR_STEPS.reduce((acc, step, index) => {
  if (!acc[step.ruleKey]) {
    acc[step.ruleKey] = [];
  }
  acc[step.ruleKey].push(index);
  return acc;
}, {} as Record<RuleKey, number[]>);

const STORAGE_KEY = "hci-tour-step";

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface BubbleStyle {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  transform?: string;
  maxWidth?: number | string;
}

type ArrowDirection = "top" | "bottom" | "left" | "right" | "none";

interface ArrowPosition {
  direction: ArrowDirection;
  offsetX: number; // horizontal offset from bubble edge
  offsetY: number; // vertical offset from bubble edge
}

export function HCITour({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Load saved step from session storage
  const [globalIndex, setGlobalIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [secondaryHighlight, setSecondaryHighlight] = useState<HighlightRect | null>(null);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({ bottom: 24, right: 24 });
  const [arrowPosition, setArrowPosition] = useState<ArrowPosition>({ direction: "none", offsetX: 0, offsetY: 0 });
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const measureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const steps = HCI_TOUR_STEPS;
  const step = steps[globalIndex];
  const rule = step ? GOLDEN_RULES[step.ruleKey] : null;

  // Calculate progress within current rule
  const currentRuleSteps = step ? STEPS_BY_RULE[step.ruleKey] : [];
  const currentRuleIndex = currentRuleSteps.findIndex((i) => i === globalIndex);

  // Save step to session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, String(globalIndex));
    }
  }, [globalIndex]);

  // Navigate to correct page when step changes
  useEffect(() => {
    if (!step) return;
    if (step.page !== pathname && !isNavigating) {
      setIsNavigating(true);
      setIsReady(false);
      setIsVisible(false);
      router.push(step.page);
    }
  }, [globalIndex, step, pathname, router, isNavigating]);

  // Reset navigation flag when pathname matches
  useEffect(() => {
    if (step && step.page === pathname) {
      setIsNavigating(false);
    }
  }, [pathname, step]);

  // Calculate optimal bubble style and arrow position
  const calculateBubbleAndArrow = useCallback((highlight: HighlightRect | null): { style: BubbleStyle; arrow: ArrowPosition } => {
    const padding = 24;
    const gap = 16; // gap between highlight and bubble
    const bubbleWidth = 380;
    const bubbleHeight = 360; // Base height - code examples are collapsible
    const sidebarWidth = 256;
    const topbarHeight = 64;
    
    // Default position (no highlight)
    if (!highlight) {
      return {
        style: { bottom: padding, right: padding },
        arrow: { direction: "none", offsetX: 0, offsetY: 0 },
      };
    }
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate highlight center
    const highlightCenterX = highlight.left + highlight.width / 2;
    const highlightCenterY = highlight.top + highlight.height / 2;
    
    // Calculate available space in each direction (actual usable space)
    // Right: from highlight right edge to viewport right edge
    const spaceRight = viewportWidth - (highlight.left + highlight.width) - gap - padding;
    // Left: from sidebar right edge to highlight left edge
    const spaceLeft = highlight.left - sidebarWidth - gap - padding;
    // Bottom: from highlight bottom to viewport bottom
    const spaceBottom = viewportHeight - (highlight.top + highlight.height) - gap - padding;
    // Top: from topbar bottom to highlight top
    const spaceTop = highlight.top - topbarHeight - gap - padding;
    
    // Check if highlight is tall (takes significant vertical space)
    const isHighlightTall = highlight.height > viewportHeight * 0.4;
    
    // Helper to calculate vertical positioning for side placement
    const calcSidePosition = () => {
      const idealTop = isHighlightTall 
        ? Math.max(highlight.top, topbarHeight + padding)
        : highlightCenterY - bubbleHeight / 2;
      const clampedTop = Math.max(topbarHeight + padding, Math.min(idealTop, viewportHeight - bubbleHeight - padding));
      const arrowY = Math.min(highlightCenterY, highlight.top + 100) - clampedTop;
      return { clampedTop, arrowY: Math.max(40, Math.min(arrowY, bubbleHeight - 40)) };
    };
    
    // Check if sides have enough space for the bubble
    const canFitRight = spaceRight >= bubbleWidth;
    const canFitLeft = spaceLeft >= bubbleWidth;
    
    // Check if highlight is wide (spans most of content area)
    const contentWidth = viewportWidth - sidebarWidth;
    const isHighlightWide = highlight.width > contentWidth * 0.6;
    
    // If both can fit, choose the one with more space
    // If only one can fit, use that one
    if (canFitRight || canFitLeft) {
      // For wide highlights that span most of the content, prefer left side (more natural reading flow)
      // Otherwise, prefer the side with more space
      const preferLeft = canFitLeft && (
        !canFitRight || 
        spaceLeft > spaceRight || 
        (isHighlightWide && spaceLeft >= bubbleWidth + 20)
      );
      
      if (preferLeft) {
        // Position to the LEFT
        const bubbleRight = viewportWidth - highlight.left + gap;
        const { clampedTop, arrowY } = calcSidePosition();
        
        return {
          style: { top: clampedTop, right: bubbleRight, maxWidth: bubbleWidth },
          arrow: { direction: "right", offsetX: 0, offsetY: arrowY },
        };
      } else {
        // Position to the RIGHT
        const bubbleLeft = highlight.left + highlight.width + gap;
        const { clampedTop, arrowY } = calcSidePosition();
        
        return {
          style: { top: clampedTop, left: bubbleLeft, maxWidth: bubbleWidth },
          arrow: { direction: "left", offsetX: 0, offsetY: arrowY },
        };
      }
    }
    
    // Priority 2: If neither side fits, place over the sidebar (left side)
    // This is useful for wide highlights that span most of the content area
    if (isHighlightWide || (!canFitRight && !canFitLeft)) {
      // Position bubble on the left, overlapping the sidebar
      const bubbleLeft = padding; // Start from left edge with padding
      // Position at top of content area, just below topbar
      const clampedTop = topbarHeight + padding;
      
      // Arrow points right toward the highlight
      const arrowY = Math.min(highlightCenterY, highlight.top + 100) - clampedTop;
      
      return {
        style: { top: clampedTop, left: bubbleLeft, maxWidth: bubbleWidth },
        arrow: { direction: "right", offsetX: 0, offsetY: Math.max(40, Math.min(arrowY, bubbleHeight - 40)) },
      };
    }
    
    // Priority 3: Position BELOW highlight (only if not too tall and space available)
    if (!isHighlightTall && spaceBottom >= bubbleHeight) {
      const bubbleTop = highlight.top + highlight.height + gap;
      const idealLeft = highlightCenterX - bubbleWidth / 2;
      const clampedLeft = Math.max(sidebarWidth + padding, Math.min(idealLeft, viewportWidth - bubbleWidth - padding));
      
      // Arrow points up, positioned at highlight center
      const arrowX = highlightCenterX - clampedLeft;
      
      return {
        style: { top: bubbleTop, left: clampedLeft, maxWidth: bubbleWidth },
        arrow: { direction: "top", offsetX: Math.max(40, Math.min(arrowX, bubbleWidth - 40)), offsetY: 0 },
      };
    }
    
    // Priority 4: Position ABOVE highlight
    if (spaceTop >= bubbleHeight) {
      const bubbleBottom = viewportHeight - highlight.top + gap;
      const idealLeft = highlightCenterX - bubbleWidth / 2;
      const clampedLeft = Math.max(sidebarWidth + padding, Math.min(idealLeft, viewportWidth - bubbleWidth - padding));
      
      const arrowX = highlightCenterX - clampedLeft;
      
      return {
        style: { bottom: bubbleBottom, left: clampedLeft, maxWidth: bubbleWidth },
        arrow: { direction: "bottom", offsetX: Math.max(40, Math.min(arrowX, bubbleWidth - 40)), offsetY: 0 },
      };
    }
    
    // Fallback: Position to the right with reduced width, overlapping if necessary
    const fallbackWidth = Math.min(bubbleWidth, spaceRight);
    if (fallbackWidth > 280) {
      const bubbleLeft = highlight.left + highlight.width + gap;
      const clampedTop = Math.max(topbarHeight + padding, Math.min(highlight.top, viewportHeight - bubbleHeight - padding));
      
      return {
        style: { top: clampedTop, left: bubbleLeft, maxWidth: fallbackWidth },
        arrow: { direction: "left", offsetX: 0, offsetY: 60 },
      };
    }
    
    // Ultimate fallback: Bottom-right corner
    return {
      style: { bottom: padding, right: padding, maxWidth: Math.min(bubbleWidth, viewportWidth - sidebarWidth - padding * 2) },
      arrow: { direction: "none", offsetX: 0, offsetY: 0 },
    };
  }, []);

  // Track if we already scrolled for this step to avoid loops
  const hasScrolledRef = useRef(false);

  // Measure and position highlight
  const measure = useCallback(() => {
    if (!step?.selector) {
      setHighlightRect(null);
      setBubbleStyle({ bottom: 24, right: 24 });
      setArrowPosition({ direction: "none", offsetX: 0, offsetY: 0 });
      return true;
    }

    // Try modalSelector first if it exists (for when modal is open)
    let target: HTMLElement | null = null;
    if (step.modalSelector) {
      target = document.querySelector(step.modalSelector) as HTMLElement | null;
    }
    // Fall back to regular selector
    if (!target) {
      target = document.querySelector(step.selector) as HTMLElement | null;
    }
    
    if (!target) {
      setHighlightRect(null);
      setBubbleStyle({ bottom: 24, right: 24 });
      setArrowPosition({ direction: "none", offsetX: 0, offsetY: 0 });
      return false;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setHighlightRect(null);
      setBubbleStyle({ bottom: 24, right: 24 });
      setArrowPosition({ direction: "none", offsetX: 0, offsetY: 0 });
      return false;
    }

    const viewportHeight = window.innerHeight;
    const topbarHeight = 80;
    const bubbleHeight = 380;
    
    // Calculate ideal visible zone - element should be in the middle portion of viewport
    const idealZoneTop = topbarHeight + 60;
    const idealZoneBottom = viewportHeight - bubbleHeight - 40;
    
    // Check if element needs scrolling
    const elementTooHigh = rect.top < idealZoneTop;
    const elementTooLow = rect.bottom > idealZoneBottom;
    const needsScroll = elementTooHigh || elementTooLow;
    
    if (needsScroll && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      
      // Calculate scroll to center element in the ideal zone
      const elementTop = rect.top + window.scrollY;
      const idealPosition = idealZoneTop + 20; // Position element near top of ideal zone
      const targetScrollY = elementTop - idealPosition;
      
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: "smooth"
      });
      
      // Re-measure after scroll completes
      setTimeout(() => measure(), 500);
      return true;
    }

    const padding = 8;
    
    // Create highlight rect
    const newHighlight: HighlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    setHighlightRect(newHighlight);
    const { style, arrow } = calculateBubbleAndArrow(newHighlight);
    setBubbleStyle(style);
    setArrowPosition(arrow);

    // Check for secondary selector (e.g., close button) when modal is open
    if (step.modalSelector && step.secondarySelector && target === document.querySelector(step.modalSelector)) {
      const secondaryEl = document.querySelector(step.secondarySelector) as HTMLElement | null;
      if (secondaryEl) {
        const secondaryRect = secondaryEl.getBoundingClientRect();
        const secondaryPadding = 6;
        setSecondaryHighlight({
          top: secondaryRect.top - secondaryPadding,
          left: secondaryRect.left - secondaryPadding,
          width: secondaryRect.width + secondaryPadding * 2,
          height: secondaryRect.height + secondaryPadding * 2,
        });
      }
    } else {
      // Clear secondary highlight when modal is not open
      setSecondaryHighlight(null);
    }

    return true;
  }, [step, calculateBubbleAndArrow]);

  // Reset scroll flag and collapse code when step changes
  useEffect(() => {
    hasScrolledRef.current = false;
    setIsCodeExpanded(false);
    // Clear highlight immediately to prevent stale highlight showing
    setHighlightRect(null);
  }, [globalIndex]);

  // Initialize on step change
  useEffect(() => {
    if (isNavigating) return;
    
    setIsReady(false);
    setIsVisible(false);
    setHighlightRect(null); // Clear old highlight before measuring new one
    hasScrolledRef.current = false;

    const timer = setTimeout(() => {
      setIsReady(true);
      measure();
      requestAnimationFrame(() => {
        setTimeout(() => setIsVisible(true), 50);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [globalIndex, pathname, isNavigating, measure]);

  // Measure on ready and watch for changes
  useEffect(() => {
    if (!isReady || isNavigating) return;

    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
    }

    measureTimeoutRef.current = setTimeout(measure, 100);

    // Poll for element appearance
    let attempts = 0;
    const pollInterval = setInterval(() => {
      const found = measure();
      attempts++;
      if (found || attempts >= 15) {
        clearInterval(pollInterval);
      }
    }, 200);

    // Debounced scroll/resize handler
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleUpdate = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        measure();
      }, 50);
    };
    
    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);

    // MutationObserver to detect modal/dialog opens and closes
    // When a modal opens or closes, re-measure to update highlight
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check for notification items being added
          const notificationAdded = Array.from(mutation.addedNodes).some(
            (node) => node instanceof HTMLElement && (
              node.getAttribute("data-tour") === "notification-item" ||
              node.querySelector("[data-tour='notification-item']")
            )
          );
          
          if (notificationAdded) {
            // Show secondary highlight on notification
            const notificationEl = document.querySelector("[data-tour='notification-item']") as HTMLElement;
            if (notificationEl) {
              const rect = notificationEl.getBoundingClientRect();
              const padding = 6;
              setSecondaryHighlight({
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
              });
              // Auto-hide secondary highlight after 2s
              setTimeout(() => setSecondaryHighlight(null), 2000);
            }
          }
          
          // Check if a dialog/modal/popup was added
          const hasPopupAdded = Array.from(mutation.addedNodes).some(
            (node) => node instanceof HTMLElement && (
              node.getAttribute("role") === "dialog" ||
              node.getAttribute("role") === "listbox" ||
              node.querySelector("[role='dialog']") ||
              node.querySelector("[role='listbox']") ||
              (node.hasAttribute("data-tour") && node.getAttribute("data-tour") !== "notification-item") ||
              (node.querySelector("[data-tour]") && !node.querySelector("[data-tour='notification-item']"))
            )
          );
          // Check if a dialog/modal/popup was removed
          const hasPopupRemoved = Array.from(mutation.removedNodes).some(
            (node) => node instanceof HTMLElement && (
              node.getAttribute("role") === "dialog" ||
              node.getAttribute("role") === "listbox" ||
              node.querySelector("[role='dialog']") ||
              node.querySelector("[role='listbox']") ||
              (node.hasAttribute("data-tour") && node.getAttribute("data-tour") !== "notification-item") ||
              (node.querySelector("[data-tour]") && !node.querySelector("[data-tour='notification-item']"))
            )
          );
          if (hasPopupAdded) {
            // Re-measure after a short delay to let popup render
            setTimeout(() => {
              hasScrolledRef.current = false;
              measure();
            }, 150);
          }
          if (hasPopupRemoved) {
            // When popup closes, clear highlight briefly then re-measure
            // This prevents the "grey area" issue
            setHighlightRect(null);
            setTimeout(() => {
              hasScrolledRef.current = false;
              measure();
            }, 100);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (measureTimeoutRef.current) clearTimeout(measureTimeoutRef.current);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      clearInterval(pollInterval);
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      observer.disconnect();
    };
  }, [measure, isReady, isNavigating]);

  // Navigation handlers
  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= steps.length) return;
    setIsVisible(false);
    setTimeout(() => setGlobalIndex(index), 150);
  }, [steps.length]);

  const goBack = useCallback(() => {
    if (globalIndex <= 0) return;
    goTo(globalIndex - 1);
  }, [globalIndex, goTo]);

  const goNext = useCallback(() => {
    if (globalIndex >= steps.length - 1) {
      setIsVisible(false);
      sessionStorage.removeItem(STORAGE_KEY);
      setTimeout(onComplete, 200);
      return;
    }
    goTo(globalIndex + 1);
  }, [globalIndex, steps.length, onComplete, goTo]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    sessionStorage.removeItem(STORAGE_KEY);
    setTimeout(onComplete, 200);
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        // Don't intercept if user is in an interactive element
        const isInteractiveElement = 
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLButtonElement ||
          e.target instanceof HTMLSelectElement ||
          (e.target instanceof HTMLElement && e.target.closest('[role="button"]')) ||
          (e.target instanceof HTMLElement && e.target.closest('[role="tab"]')) ||
          (e.target instanceof HTMLElement && e.target.closest('[role="menuitem"]')) ||
          (e.target instanceof HTMLElement && e.target.closest('[role="option"]')) ||
          (e.target instanceof HTMLElement && e.target.closest('a'));
        
        if (!isInteractiveElement) {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === "ArrowLeft") {
        const isInteractiveElement = 
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLButtonElement ||
          e.target instanceof HTMLSelectElement;
        
        if (!isInteractiveElement) {
          e.preventDefault();
          goBack();
        }
      } else if (e.key === " ") {
        // Space should not pause if user is on an interactive element
        const isInteractiveElement = 
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLButtonElement ||
          e.target instanceof HTMLSelectElement ||
          (e.target instanceof HTMLElement && e.target.closest('[role="button"]')) ||
          (e.target instanceof HTMLElement && e.target.closest('[role="tab"]')) ||
          (e.target instanceof HTMLElement && e.target.closest('a'));
        
        if (!isInteractiveElement) {
          e.preventDefault();
          setIsPaused((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goBack, handleClose]);

  const isFirst = globalIndex === 0;
  const isLast = globalIndex >= steps.length - 1;

  if (!step || !rule) return null;

  const RuleIcon = rule.icon;

  // Get glow color based on rule
  const getGlowColor = (opacity: number) => {
    const colors: Record<string, string> = {
      emerald: `rgba(52, 211, 153, ${opacity})`,
      amber: `rgba(251, 191, 36, ${opacity})`,
      blue: `rgba(96, 165, 250, ${opacity})`,
      purple: `rgba(192, 132, 252, ${opacity})`,
      rose: `rgba(251, 113, 133, ${opacity})`,
      cyan: `rgba(34, 211, 238, ${opacity})`,
      orange: `rgba(251, 146, 60, ${opacity})`,
      indigo: `rgba(129, 140, 248, ${opacity})`,
    };
    return colors[rule.color] || colors.indigo;
  };

  const getGradientClass = () => {
    const gradients: Record<string, string> = {
      emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500",
      amber: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500",
      blue: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500",
      purple: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500",
      rose: "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500",
      cyan: "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500",
      orange: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500",
      indigo: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500",
    };
    return gradients[rule.color] || gradients.indigo;
  };

  const getProgressGradient = () => {
    const gradients: Record<string, string> = {
      emerald: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      amber: "bg-gradient-to-r from-amber-500 to-amber-400",
      blue: "bg-gradient-to-r from-blue-500 to-blue-400",
      purple: "bg-gradient-to-r from-purple-500 to-purple-400",
      rose: "bg-gradient-to-r from-rose-500 to-rose-400",
      cyan: "bg-gradient-to-r from-cyan-500 to-cyan-400",
      orange: "bg-gradient-to-r from-orange-500 to-orange-400",
      indigo: "bg-gradient-to-r from-indigo-500 to-indigo-400",
    };
    return gradients[rule.color] || gradients.indigo;
  };

  // Calculate overlay rectangles that surround the highlight area
  // This allows the highlight area to be fully interactive (clicks, hover, inputs all work)
  const getOverlayRects = () => {
    if (!highlightRect) return null;
    
    const padding = 4; // Small padding around highlight
    const hl = {
      top: highlightRect.top - padding,
      left: highlightRect.left - padding,
      right: highlightRect.left + highlightRect.width + padding,
      bottom: highlightRect.top + highlightRect.height + padding,
      width: highlightRect.width + padding * 2,
      height: highlightRect.height + padding * 2,
    };
    
    return {
      // Top rectangle (full width, from top to highlight top)
      top: { top: 0, left: 0, width: "100%", height: hl.top },
      // Bottom rectangle (full width, from highlight bottom to viewport bottom)
      bottom: { top: hl.bottom, left: 0, width: "100%", height: `calc(100vh - ${hl.bottom}px)` },
      // Left rectangle (from highlight top to bottom, left edge to highlight left)
      left: { top: hl.top, left: 0, width: hl.left, height: hl.height },
      // Right rectangle (from highlight top to bottom, highlight right to viewport right)
      right: { top: hl.top, left: hl.right, width: `calc(100vw - ${hl.right}px)`, height: hl.height },
    };
  };

  const overlayRects = getOverlayRects();

  return (
    <>
      {/* Dark overlay using 4 rectangles - highlight area remains fully interactive */}
      <div
        className={cn(
          "fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        {overlayRects ? (
          <>
            {/* Top overlay */}
            <div
              className="absolute bg-slate-950/85 pointer-events-auto"
              style={{ top: overlayRects.top.top, left: overlayRects.top.left, width: overlayRects.top.width, height: overlayRects.top.height }}
              onClick={(e) => e.stopPropagation()}
            />
            {/* Bottom overlay */}
            <div
              className="absolute bg-slate-950/85 pointer-events-auto"
              style={{ top: overlayRects.bottom.top, left: overlayRects.bottom.left, width: overlayRects.bottom.width, height: overlayRects.bottom.height }}
              onClick={(e) => e.stopPropagation()}
            />
            {/* Left overlay */}
            <div
              className="absolute bg-slate-950/85 pointer-events-auto"
              style={{ top: overlayRects.left.top, left: overlayRects.left.left, width: overlayRects.left.width, height: overlayRects.left.height }}
              onClick={(e) => e.stopPropagation()}
            />
            {/* Right overlay */}
            <div
              className="absolute bg-slate-950/85 pointer-events-auto"
              style={{ top: overlayRects.right.top, left: overlayRects.right.left, width: overlayRects.right.width, height: overlayRects.right.height }}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        ) : (
          /* Full overlay when no highlight */
          <div className="absolute inset-0 bg-slate-950/85 pointer-events-auto" />
        )}

        {/* Glowing border around highlight */}
        {highlightRect && (
          <div
            className="absolute rounded-xl transition-all duration-300 pointer-events-none"
            style={{
              top: highlightRect.top - 3,
              left: highlightRect.left - 3,
              width: highlightRect.width + 6,
              height: highlightRect.height + 6,
              boxShadow: `
                0 0 0 2px ${getGlowColor(0.9)},
                0 0 15px 4px ${getGlowColor(0.4)},
                0 0 30px 8px ${getGlowColor(0.15)}
              `,
            }}
          />
        )}

        {/* Secondary highlight for notifications - doesn't block main highlight */}
        {secondaryHighlight && (
          <div
            className="absolute rounded-xl pointer-events-none animate-pulse"
            style={{
              top: secondaryHighlight.top - 3,
              left: secondaryHighlight.left - 3,
              width: secondaryHighlight.width + 6,
              height: secondaryHighlight.height + 6,
              boxShadow: `
                0 0 0 3px rgba(16, 185, 129, 0.9),
                0 0 20px 6px rgba(16, 185, 129, 0.5),
                0 0 40px 12px rgba(16, 185, 129, 0.2)
              `,
              zIndex: 200,
            }}
          />
        )}
      </div>

      {/* Main presentation card with arrow */}
      <div
        ref={bubbleRef}
        className={cn(
          "fixed z-[101] transition-all duration-300 ease-out",
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{
          ...bubbleStyle,
          width: bubbleStyle.maxWidth || 400,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`HCI Tour slide ${globalIndex + 1} of ${steps.length}: ${step.title}`}
        tabIndex={-1}
      >
        {/* Arrow pointing to highlight */}
        {arrowPosition.direction !== "none" && (
          <div
            className={cn(
              "absolute w-4 h-4 rotate-45 border-2 bg-slate-900",
              rule.borderColor,
              // Hide the inner edges based on direction
              arrowPosition.direction === "left" && "border-t-0 border-r-0",
              arrowPosition.direction === "right" && "border-b-0 border-l-0",
              arrowPosition.direction === "top" && "border-b-0 border-r-0",
              arrowPosition.direction === "bottom" && "border-t-0 border-l-0"
            )}
            style={{
              // Position arrow based on direction
              ...(arrowPosition.direction === "left" && {
                left: -8,
                top: arrowPosition.offsetY - 8,
              }),
              ...(arrowPosition.direction === "right" && {
                right: -8,
                top: arrowPosition.offsetY - 8,
              }),
              ...(arrowPosition.direction === "top" && {
                top: -8,
                left: arrowPosition.offsetX - 8,
              }),
              ...(arrowPosition.direction === "bottom" && {
                bottom: -8,
                left: arrowPosition.offsetX - 8,
              }),
            }}
          />
        )}
        
        <Card className={cn(
          "overflow-hidden border-2 bg-slate-900/98 shadow-2xl backdrop-blur-md",
          rule.borderColor
        )}>
          {/* Rule header */}
          <div className={cn("px-5 py-3", rule.bgColor)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  rule.bgColor,
                  "ring-2",
                  rule.borderColor
                )}>
                  <RuleIcon className={cn("h-5 w-5", rule.textColor)} />
                </div>
                <div>
                  <div className={cn("text-xs font-bold uppercase tracking-wider", rule.textColor)}>
                    Golden Rule {rule.number}
                  </div>
                  <div className="text-sm font-semibold text-slate-100">
                    {rule.title}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Step selector dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-7 gap-1.5 rounded-md px-2 text-xs", rule.textColor, "hover:bg-slate-800")}
                      aria-label="Jump to slide"
                    >
                      <List className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">All Slides</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="z-[200] max-h-80 w-64 overflow-y-auto bg-slate-950 text-slate-100 border-slate-700"
                  >
                    {steps.map((s, idx) => (
                      <DropdownMenuItem
                        key={idx}
                        className={cn(
                          "text-xs cursor-pointer",
                          idx === globalIndex && "bg-slate-800 text-white"
                        )}
                        onSelect={() => goTo(idx)}
                      >
                        <span className="mr-2 text-slate-500">{idx + 1}.</span>
                        {s.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  onClick={handleClose}
                  aria-label="Close tour"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <CardHeader className="space-y-3 pb-2 pt-4">
            <p className="text-xs text-slate-400 italic">
              &ldquo;{rule.description}&rdquo;
            </p>
            <CardTitle className="text-lg font-semibold leading-tight text-slate-50">
              {step.title}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-300">
              {step.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {/* Implementation details */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Implementation
              </div>
              <p className="text-xs text-slate-300">
                {step.implementation}
              </p>
            </div>

            {/* Code example if present - collapsible */}
            {step.codeExample && (
              <div className="rounded-lg border border-slate-800 bg-slate-950">
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-2 text-left hover:bg-slate-800/50 transition-colors rounded-lg"
                  onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Code Example
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-slate-500 transition-transform duration-200",
                      isCodeExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isCodeExpanded && (
                  <div className="px-3 pb-3">
                    <pre className="overflow-x-auto text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                      <code>{step.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Demo action prompt */}
            {step.demoAction && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-3",
                rule.bgColor,
                "border",
                rule.borderColor
              )}>
                <Sparkles className={cn("h-4 w-4 flex-shrink-0", rule.textColor)} />
                <p className={cn("text-xs font-medium", rule.textColor)}>
                  {step.demoAction}
                  {step.interactionRequired && (
                    <span className="ml-1 opacity-75">(interact with the highlighted area)</span>
                  )}
                </p>
              </div>
            )}

            {/* Progress within current rule */}
            {currentRuleSteps.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Rule {rule.number} progress
                </span>
                <div className="flex items-center gap-1">
                  {currentRuleSteps.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === currentRuleIndex
                          ? cn("w-6", rule.bgColor.replace("/20", ""))
                          : i < currentRuleIndex
                          ? cn("w-3", rule.bgColor.replace("/20", "/60"))
                          : "w-3 bg-slate-700"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Global progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  getProgressGradient()
                )}
                style={{
                  width: `${((globalIndex + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Slide counter */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Slide {globalIndex + 1} of {steps.length}</span>
              <span>
                {Object.keys(GOLDEN_RULES).filter((k) => 
                  STEPS_BY_RULE[k as RuleKey]?.some((i) => i <= globalIndex)
                ).length} / 8 rules covered
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
                onClick={goBack}
                disabled={isFirst}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200"
                  onClick={handleClose}
                >
                  Skip
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className={cn(
                    "gap-1.5 px-4 font-medium shadow-lg transition-all duration-300",
                    getGradientClass(),
                    "text-white"
                  )}
                  onClick={goNext}
                >
                  {isLast ? "Finish" : "Next"}
                  {!isLast && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-[11px] text-slate-500">
              Use{" "}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">←</kbd>
              <kbd className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">→</kbd>
              {" "}to navigate{" • "}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">Esc</kbd>
              {" "}to exit
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
