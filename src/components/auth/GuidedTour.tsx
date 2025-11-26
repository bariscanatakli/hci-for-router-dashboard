"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// S3: Informative feedback - clear step structure
type TourStep = {
  title: string;
  body: string;
  selector?: string;
  selectors?: string[];
  page: string; // Which page this step belongs to
};

// S8: Reduce memory load - organized by logical flow through the app
const TOUR_PAGES = [
  "/dashboard",
  "/devices",
  "/wifi",
  "/security",
  "/performance",
  "/system",
] as const;

// Complete tour flow covering all pages in order
// Updated selectors to target page headers with icons for consistency
const allTourSteps: TourStep[] = [
  // ===== DASHBOARD =====
  {
    title: "Welcome to Router Dashboard",
    body: "This guided tour will walk you through all features. Use Next/Back to navigate, or Skip to exit anytime.",
    selectors: [
      '[data-tour="page-header"]',
      '[data-tour="dashboard-header"]',
    ],
    page: "/dashboard",
  },
  {
    title: "Quick Search (Cmd/Ctrl+K)",
    body: "Press Cmd/Ctrl+K anytime to search pages, devices, settings, or add custom shortcuts.",
    selectors: ['[data-tour="topbar-search"]', '[data-hci="mobile-search"]'],
    page: "/dashboard",
  },
  {
    title: "Sidebar Navigation",
    body: "Access all main sections: Dashboard, Devices, Wi-Fi, Security, Performance, and System. Click any item to navigate.",
    selectors: [
      '[data-tour="sidebar-links"]',
      '[data-tour="sidebar-nav-links"]',
    ],
    page: "/dashboard",
  },
  {
    title: "Status Cards Overview",
    body: "Internet status, Wi-Fi info, and connected devices at a glance. Click any card for details.",
    selectors: ['[data-tour="dashboard-status-cards"]'],
    page: "/dashboard",
  },
  {
    title: "Health & Bandwidth",
    body: "Monitor real-time throughput and system health. Hover charts for detailed values.",
    selectors: ['[data-tour="dashboard-health-cards"]'],
    page: "/dashboard",
  },

  // ===== DEVICES =====
  {
    title: "Device Management",
    body: "View and manage all connected devices. Filter by status, search by name or MAC address.",
    selectors: [
      '[data-tour="page-header"]',
      '[data-tour="devices-header"]',
    ],
    page: "/devices",
  },
  {
    title: "Device Statistics",
    body: "Quick counts of total, online, and offline devices help you triage connectivity issues.",
    selectors: ['[data-tour="devices-stats"]'],
    page: "/devices",
  },
  {
    title: "Device Table & Actions",
    body: "Inspect device details, pause/block access, or prioritize traffic. All actions support Undo.",
    selectors: ['[data-tour="devices-table"]'],
    page: "/devices",
  },

  // ===== WI-FI =====
  {
    title: "Wi-Fi Configuration",
    body: "Manage your wireless networks, including SSID, password, band selection, and security settings.",
    selectors: [
      '[data-tour="page-header"]',
      '[data-tour="wifi-header"]',
    ],
    page: "/wifi",
  },
  {
    title: "Network Status",
    body: "Toggle Wi-Fi on/off, enable guest network, and monitor signal strength and throughput.",
    selectors: ['[data-tour="wifi-status"]', '[data-tour="wifi-banner"]'],
    page: "/wifi",
  },
  {
    title: "Wi-Fi Settings Form",
    body: "Configure SSID, band (2.4/5GHz), channel, bandwidth, mode (802.11ax), and client limits.",
    selectors: ['[data-tour="wifi-form"]'],
    page: "/wifi",
  },

  // ===== SECURITY =====
  {
    title: "Security & Firewall",
    body: "Control your network's security posture with firewall levels, IPS, and threat monitoring.",
    selectors: [
      '[data-tour="page-header"]',
      '[data-tour="security-header"]',
    ],
    page: "/security",
  },
  {
    title: "Port Forwarding",
    body: "Expose internal services safely. Add rules with validation, and use Undo if you make mistakes.",
    selectors: ['[data-tour="port-forward-wizard"]'],
    page: "/security",
  },

  // ===== PERFORMANCE =====
  {
    title: "Performance Monitoring",
    body: "Track network throughput, latency, and reliability trends over time.",
    selectors: [
      '[data-tour="page-header"]',
      '[data-tour="performance-header"]',
    ],
    page: "/performance",
  },
  {
    title: "Performance Charts",
    body: "Bandwidth and latency charts show peaks, averages, and help identify bottlenecks.",
    selectors: ['[data-tour="performance-charts"]'],
    page: "/performance",
  },

  // ===== SYSTEM =====
  {
    title: "System Settings",
    body: "Check firmware version, uptime, CPU/memory usage, and configure automatic updates for your router.",
    selectors: [
      '[data-tour="page-header"]',
      '[data-tour="system-header"]',
    ],
    page: "/system",
  },
  {
    title: "Firmware & Updates",
    body: "View current firmware version and check for updates. Enable auto-updates to stay secure automatically.",
    selectors: [
      '[data-tour="firmware-card"]',
      '[data-tour="system-firmware"]',
    ],
    page: "/system",
  },
  {
    title: "Reboot & Recovery",
    body: "Safely reboot router or restart modem with progress feedback and countdown timer. Use when troubleshooting.",
    selectors: ['[data-tour="reboot-card"]'],
    page: "/system",
  },
  {
    title: "Tour Complete!",
    body: "You've seen all major features. Use Cmd/Ctrl+K search anytime, or click 'Start Tour' in the header to revisit.",
    selectors: [
      '[data-tour="system-content"]',
      '[data-tour="page-system"]',
    ],
    page: "/system",
  },
];

// S1: Consistency - fixed positioning zones
type BubblePosition = "top" | "bottom" | "left" | "right" | "center";

interface PositionStyle {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  transform?: string;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function GuidedTour({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [globalIndex, setGlobalIndex] = useState(0);
  const [position, setPosition] = useState<PositionStyle | null>(null);
  const [bubbleZone, setBubbleZone] = useState<BubblePosition>("bottom");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const measureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const lastPageIndexRef = useRef<Record<string, number>>({});

  const steps = allTourSteps;
  const step = steps[globalIndex];

  // S7: User control - find current page's first step when landing
  useEffect(() => {
    // When pathname changes, check if we need to update index
    const currentStepPage = step?.page;
    if (currentStepPage && currentStepPage !== pathname && !isNavigating) {
      // User navigated manually; restore last seen step on that page if exists, else first step
      const lastIndexForPage = lastPageIndexRef.current[pathname];
      const pageFirstIndex = steps.findIndex((s) => s.page === pathname);
      const targetIndex =
        typeof lastIndexForPage === "number" ? lastIndexForPage : pageFirstIndex;
      if (targetIndex >= 0 && targetIndex !== globalIndex) {
        setGlobalIndex(targetIndex);
      }
    }
    setIsNavigating(false);
  }, [pathname, step?.page, steps, globalIndex, isNavigating]);

  // S3: Feedback - measure and position the bubble
  const measure = useCallback(() => {
    if (!step) {
      setPosition(null);
      setHighlightRect(null);
      return false;
    }

    const selectors = step.selectors ?? (step.selector ? [step.selector] : []);
    if (!selectors.length) {
      // No selector - use center/bottom positioning
      setPosition({ bottom: 32, right: 32 });
      setBubbleZone("center");
      setHighlightRect(null);
      return true;
    }

    // Find a visible target element
    const target = selectors
      .map((sel) => document.querySelector(sel) as HTMLElement | null)
      .find((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

    if (!target) {
      // Element not found yet - use fallback position
      setPosition({ bottom: 32, right: 32 });
      setBubbleZone("center");
      setHighlightRect(null);
      return false;
    }

    const rect = target.getBoundingClientRect();
    const bubbleHeight = bubbleRef.current?.offsetHeight ?? 280;
    const bubbleWidth = bubbleRef.current?.offsetWidth ?? 400;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const padding = 20;
    const gap = 24;
    const highlightPadding = 8;

    const isFixedElement = window.getComputedStyle(target).position === 'fixed';

    // S3: Auto-scroll to make target visible with smart positioning
    // Don't scroll for fixed elements
    if (!isFixedElement) {
      const scrollMargin = 100; // Extra space around element
      const elementTop = rect.top + window.scrollY;
      const elementBottom = rect.bottom + window.scrollY;
      const viewportTop = window.scrollY;
      const viewportBottom = window.scrollY + viewportHeight;

      // Calculate if element is fully visible with margin
      const isAboveViewport = rect.top < scrollMargin;
      const isBelowViewport = rect.bottom > viewportHeight - scrollMargin;
      const isPartiallyHidden = isAboveViewport || isBelowViewport;

      if (isPartiallyHidden) {
        setIsAutoScrolling(true);
        // Calculate optimal scroll position
        // Center the element in the viewport, accounting for bubble space
        const elementCenter = elementTop + (rect.height / 2);
        const optimalScrollY = elementCenter - (viewportHeight / 2);
        
        // Ensure we don't scroll past document bounds
        const maxScroll = document.documentElement.scrollHeight - viewportHeight;
        const targetScroll = Math.max(0, Math.min(optimalScrollY, maxScroll));

        // Scroll instantly to reduce animation jitter between scroll and bubble transitions
        window.scrollTo({
          top: targetScroll,
          behavior: 'auto'
        });

        // Re-measure after scroll completes
        requestAnimationFrame(() => {
          const newRect = target.getBoundingClientRect();
          updateHighlightAndPosition(newRect, target);
          setIsAutoScrolling(false);
        });

        return true;
      }
    }

    // Update highlight and position immediately if no scroll needed
    updateHighlightAndPosition(rect, target);
    return true;

    function updateHighlightAndPosition(rect: DOMRect, target: HTMLElement) {
      // S3: Center highlight on target element, clamp to viewport to avoid left/top bias
      const maxHighlightWidth = Math.min(rect.width + highlightPadding * 2, viewportWidth * 0.7);
      const maxHighlightHeight = Math.min(rect.height + highlightPadding * 2, viewportHeight * 0.75);
      const centeredLeft = rect.left + rect.width / 2 - maxHighlightWidth / 2;
      const centeredTop = rect.top + rect.height / 2 - maxHighlightHeight / 2;
      const clampedLeft = Math.max(highlightPadding, Math.min(centeredLeft, viewportWidth - maxHighlightWidth - highlightPadding));
      const clampedTop = Math.max(highlightPadding, Math.min(centeredTop, viewportHeight - maxHighlightHeight - highlightPadding));

      setHighlightRect({
        top: clampedTop,
        left: clampedLeft,
        width: maxHighlightWidth,
        height: maxHighlightHeight,
      });

      // S1: Consistent positioning logic
      let zone: BubblePosition = "bottom";
      let newPosition: PositionStyle = {};

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      // Check if this is a sidebar/left-aligned element
      const isLeftEl = rect.left < viewportWidth * 0.3;

      if (isLeftEl && spaceRight >= bubbleWidth + gap + padding) {
        zone = "right";
        newPosition = {
          top: Math.max(
            padding,
            Math.min(rect.top, viewportHeight - bubbleHeight - padding)
          ),
          left: Math.min(rect.right + gap, viewportWidth - bubbleWidth - padding),
        };
      } else if (spaceBelow >= bubbleHeight + gap + padding) {
        zone = "bottom";
        newPosition = {
          top: rect.bottom + gap,
          left: Math.max(
            padding,
            Math.min(rect.left, viewportWidth - bubbleWidth - padding)
          ),
        };
      } else if (spaceAbove >= bubbleHeight + gap + padding) {
        zone = "top";
        newPosition = {
          top: rect.top - bubbleHeight - gap,
          left: Math.max(
            padding,
            Math.min(rect.left, viewportWidth - bubbleWidth - padding)
          ),
        };
      } else if (spaceRight >= bubbleWidth + gap + padding) {
        zone = "right";
        newPosition = {
          top: Math.max(
            padding,
            Math.min(rect.top, viewportHeight - bubbleHeight - padding)
          ),
          left: rect.right + gap,
        };
      } else if (spaceLeft >= bubbleWidth + gap + padding) {
        zone = "left";
        newPosition = {
          top: Math.max(
            padding,
            Math.min(rect.top, viewportHeight - bubbleHeight - padding)
          ),
          left: rect.left - bubbleWidth - gap,
        };
      } else {
        zone = "center";
        newPosition = {
          bottom: padding,
          right: padding,
        };
      }

      setPosition(newPosition);
      setBubbleZone(zone);
    }
  }, [step]);

  // Wait for page to be ready before showing modal
  useEffect(() => {
    setIsReady(false);
    setIsVisible(false);

    // Clear any pending timeouts
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
    }

    // Lock background scroll and mark page inert while tour is open
    const body = document.body;
    const appRoot = document.querySelector("main");
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    appRoot?.setAttribute("aria-hidden", "true");

    // Wait for page content to load
    readyTimeoutRef.current = setTimeout(() => {
      setIsReady(true);
      // Stagger the visibility for smooth entrance
      requestAnimationFrame(() => {
        setTimeout(() => setIsVisible(true), 50);
      });
    }, 300);

    return () => {
      body.style.overflow = previousOverflow;
      appRoot?.removeAttribute("aria-hidden");
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, [globalIndex, pathname]);

  // Re-measure on step change, resize, scroll
  useEffect(() => {
    if (!isReady) return;

    // Clear any pending measurement
    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
    }

    // Initial measure with slight delay for DOM updates
    measureTimeoutRef.current = setTimeout(() => {
      measure();
    }, 150);

    // Poll for element visibility (handles lazy-loaded content)
    let attempts = 0;
    const maxAttempts = 20;
    const pollInterval = setInterval(() => {
      const found = measure();
      attempts++;
      if (found || attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    }, 150);

    // Listen for scroll and resize
    const handleUpdate = () => measure();
    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);

    // MutationObserver for dynamic content
    const observer = new MutationObserver(() => {
      requestAnimationFrame(measure);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      clearInterval(pollInterval);
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      observer.disconnect();
    };
  }, [measure, globalIndex, isReady]);

  // S6: Reversibility - go back in tour
  const goBack = useCallback(() => {
    if (globalIndex <= 0) return;

    setIsVisible(false);
    setTimeout(() => {
      const prevStep = steps[globalIndex - 1];
      lastPageIndexRef.current[step.page] = globalIndex;
      if (prevStep.page !== pathname) {
        setIsNavigating(true);
        router.push(prevStep.page);
      }
      setGlobalIndex((i) => i - 1);
    }, 150);
  }, [globalIndex, steps, pathname, router, step.page]);

  // S7: User control - go forward in tour
  const goNext = useCallback(() => {
    if (globalIndex >= steps.length - 1) {
      setIsVisible(false);
      setTimeout(onComplete, 200);
      return;
    }

    setIsVisible(false);
    setTimeout(() => {
      const nextStep = steps[globalIndex + 1];
      lastPageIndexRef.current[step.page] = globalIndex;
      if (nextStep.page !== pathname) {
        setIsNavigating(true);
        router.push(nextStep.page);
      }
      setGlobalIndex((i) => i + 1);
    }, 150);
  }, [globalIndex, steps, pathname, router, onComplete, step.page]);

  // Keyboard navigation: Arrow keys, Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
        setTimeout(onComplete, 200);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goBack, onComplete]);

  // Trap focus inside the tour bubble and restore previous focus on exit
  useEffect(() => {
    if (!isVisible) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    bubbleRef.current?.focus();

    const trap = (event: FocusEvent) => {
      if (!bubbleRef.current) return;
      if (event.target instanceof HTMLElement && bubbleRef.current.contains(event.target)) return;
      event.stopPropagation();
      bubbleRef.current.focus();
    };

    document.addEventListener("focusin", trap);
    return () => {
      document.removeEventListener("focusin", trap);
    };
  }, [isVisible]);

  const isFirst = globalIndex === 0;
  const isLast = globalIndex >= steps.length - 1;
  const currentPageSteps = steps.filter((s) => s.page === pathname);
  const currentPageIndex = currentPageSteps.findIndex(
    (s) => s.title === step?.title && s.body === step?.body
  );

  if (!step) return null;

  return (
    <>
      {/* S3: Visual feedback - dark overlay with clear cutout for highlighted element */}
      <div
        className={cn(
          "pointer-events-auto fixed inset-0 z-[100]",
          isAutoScrolling ? "transition-none" : "transition-opacity duration-500 ease-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        {/* SVG-based overlay with proper cutout - content inside is fully visible */}
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left}
                  y={highlightRect.top}
                  width={highlightRect.width}
                  height={highlightRect.height}
                  rx="12"
                  ry="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(2, 6, 23, 0.80)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Glowing border around the highlighted element */}
        {highlightRect && (
          <>
            <div
              className="absolute rounded-xl transition-all duration-500 ease-out"
              style={{
                top: highlightRect.top - 3,
                left: highlightRect.left - 3,
                width: highlightRect.width + 6,
                height: highlightRect.height + 6,
                boxShadow: `
                  0 0 0 2px rgba(129, 140, 248, 0.9),
                  0 0 15px 4px rgba(129, 140, 248, 0.4),
                  0 0 30px 8px rgba(99, 102, 241, 0.15)
                `,
                borderRadius: "12px",
              }}
            />
            
            <div
              className="absolute rounded-xl"
              style={{
                top: highlightRect.top - 6,
                left: highlightRect.left - 6,
                width: highlightRect.width + 12,
                height: highlightRect.height + 12,
                border: "2px solid rgba(165, 180, 252, 0.4)",
                borderRadius: "14px",
                animation: "pulse-ring 2s ease-in-out infinite",
              }}
            />
          </>
        )}
      </div>

      {/* Inject keyframe animation */}
      <style jsx>{`
        @keyframes pulse-ring {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>

      {/* Tour bubble with smooth animations */}
      <div
        ref={bubbleRef}
        className={cn(
          "fixed z-[101] w-[380px] max-w-[calc(100vw-40px)]",
          isAutoScrolling ? "transition-none" : "transition-all duration-500 ease-out",
          isVisible && position
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={position ?? { bottom: 32, right: 32 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Tour step ${globalIndex + 1} of ${steps.length}: ${step.title}`}
      >
        {/* Animated arrow indicator - pointing toward target */}
        {bubbleZone !== "center" && isVisible && (
          <div
            className={cn(
              "absolute z-10",
              bubbleZone === "top" && "bottom-[-24px] left-10",
              bubbleZone === "bottom" && "top-[-24px] left-10",
              bubbleZone === "left" && "right-[-24px] top-10",
              bubbleZone === "right" && "left-[-24px] top-10"
            )}
            aria-hidden="true"
          >
            {/* Arrow SVG with glow */}
            <svg
              className={cn(
                "relative h-6 w-6",
                "drop-shadow-[0_0_12px_rgba(129,140,248,0.9)]",
                "animate-bounce",
                bubbleZone === "top" && "rotate-180",
                bubbleZone === "bottom" && "rotate-0",
                bubbleZone === "left" && "rotate-90",
                bubbleZone === "right" && "-rotate-90"
              )}
              style={{ animationDuration: "1.5s" }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 4L4 14h5v6h6v-6h5L12 4z"
                fill="#818cf8"
                stroke="#c7d2fe"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <Card className="overflow-hidden border-indigo-500/40 bg-slate-900/98 shadow-2xl shadow-indigo-950/60 backdrop-blur-md">
          <CardHeader className="space-y-3 pb-3 pt-4">
            {/* Top row: Step counter and close button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span className="text-xs font-medium text-indigo-300">
                  Step {globalIndex + 1} of {steps.length}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onComplete, 200);
                }}
                aria-label="Close tour"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Page navigation pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {TOUR_PAGES.map((page) => (
                <span
                  key={page}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-300",
                    step.page === page
                      ? "bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-500/40"
                      : "bg-slate-800/60 text-slate-500"
                  )}
                >
                  {page.replace("/", "") || "home"}
                </span>
              ))}
            </div>

            {/* Title and description */}
            <div className="space-y-1.5 pt-1">
              <CardTitle className="text-lg font-semibold leading-tight text-slate-50">
                {step.title}
              </CardTitle>
              <CardDescription className="text-[13px] leading-relaxed text-slate-300">
                {step.body}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-4 pt-0">
            {/* Page progress dots */}
            {currentPageSteps.length > 1 && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  This page
                </span>
                <div className="flex items-center gap-1">
                  {currentPageSteps.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === currentPageIndex
                          ? "w-6 bg-indigo-400"
                          : i < currentPageIndex
                          ? "w-3 bg-indigo-400/60"
                          : "w-3 bg-slate-700"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Global progress bar */}
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-500 ease-out"
                style={{
                  width: `${((globalIndex + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
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
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onComplete, 200);
                  }}
                >
                  Skip
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className={cn(
                    "gap-1.5 px-4 font-medium shadow-lg transition-all duration-300",
                    "bg-gradient-to-r from-indigo-500 to-indigo-600",
                    "hover:from-indigo-400 hover:to-indigo-500",
                    "shadow-indigo-900/50 hover:shadow-indigo-800/60"
                  )}
                  onClick={goNext}
                >
                  {isLast ? "Finish" : "Next"}
                  {!isLast && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <p className="mt-4 text-center text-[10px] text-slate-600">
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">←</kbd>
              {" "}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">→</kbd>
              {" "}to navigate • {" "}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">Esc</kbd>
              {" "}to exit
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
